---
title: "How to Transform an API to an MCP Server with NestJS"
date: 2026-02-10
description: A comprehensive study on building a secure, maintainable MCP server alongside your existing API using NestJS monorepo architecture
img: mcp.png
figCaption: ""
tags: [Architecture, Developer Experience]
---

## Introduction

At ADEO, we've been exploring the [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) to enable AI assistants to interact with our backend systems. However, we faced a critical architectural decision: **should we make our production APIs MCP-compliant, or should we create separate MCP servers?**

### The Security Imperative

For security reasons, we decided against exposing our production APIs directly as MCP servers. Here's why:

**MCP is a brand new protocol** — at the time of writing, it's still in its early days. We don't fully understand its vulnerabilities, attack vectors, or long-term security implications. If we make our production API instances MCP-compliant and a critical security issue is discovered:

- **We would need to shut down the MCP functionality immediately**
- This would also shut down our production API
- Business operations would be disrupted
- Production services would fail

By **separating the MCP server from the production API**, we can shut down the MCP instance without any impact on business-critical operations.

### Alternative Approaches and Their Limitations

One might suggest: "Why not create an MCP server that simply consumes your API as a regular HTTP client?" This approach has merit, but introduces significant challenges:

1. **API Gateway Complexity**: At ADEO, like many enterprises, our APIs sit behind sophisticated API Gateways. An MCP server calling our API would need to:
   - Traverse the entire gateway infrastructure
   - Handle gateway authentication and authorization
   - Deal with rate limiting and throttling
   - Accept additional network latency (gateway processing + API processing)

2. **Protocol Incompatibility**: By design, most business APIs are **not built for streaming protocols**. The MCP protocol is designed around:
   - **Server-Sent Events (SSE)** for bidirectional communication
   - **Streamable HTTP** for long-running operations
   - Real-time data streaming for AI assistant interactions

   Traditional REST APIs don't support these patterns natively. Adapting them would require significant refactoring.

3. **Authentication Separation**: We want different authentication mechanisms for:
   - **Production API**: Enterprise OAuth2, API keys, service accounts
   - **MCP Server**: AI assistant-specific authentication, potentially different security requirements

4. **Observability**: Separate instances allow us to:
   - Monitor MCP-specific metrics independently
   - Track AI assistant usage patterns
   - Debug issues without affecting production monitoring
   - Apply different logging and telemetry strategies

### The Challenge: Avoiding Code Duplication

While we need **separate deployments**, we don't want to **duplicate our business logic**. Writing the same service layer twice (once for the API, once for MCP) would be a maintenance nightmare.

**The question becomes**: Can we use NestJS to maintain a **single source of truth** for our business logic while deploying two separate applications (API and MCP server)?

The answer is **yes**, and this article documents my study on achieving this goal.

---

## Architecture Overview

### NestJS Monorepo: The Foundation

NestJS provides excellent [monorepo support](https://docs.nestjs.com/cli/monorepo) that allows multiple applications to share code within a single workspace. Our architecture leverages this to create:

```
nestjs-api-mcp/
├── apps/
│   ├── api/          # Traditional REST API (production)
│   └── mcp/          # MCP Server (AI assistant gateway)
├── libs/             # Shared libraries (optional)
├── prisma/           # Database schema
└── generated/        # Auto-generated types (Prisma, DTOs)
```

Both applications share:
- **Business logic** (`app.service.ts` imported via path aliases)
- **Database models** (Prisma types)
- **DTOs** (Data Transfer Objects)
- **Utilities** and helper functions

### Key Design Principles

1. **Separation of Concerns**: 
   - API handles traditional HTTP REST endpoints
   - MCP handles AI assistant communication via SSE/streaming

2. **Code Reusability**:
   - Business logic lives in shared services
   - Both apps import the same service layer
   - No duplication of database access or domain logic

3. **Independent Deployment**:
   - Each app can be built, tested, and deployed separately
   - Different security configurations
   - Different scaling strategies

4. **Type Safety**:
   - Shared TypeScript types across apps
   - Prisma-generated types available to both
   - Full IDE support and autocomplete

---

## The MCP Server Implementation

### 1. Tool Discovery with Decorators

One of the biggest challenges was exposing service methods as MCP tools without manual registration. I created a **TypeScript decorator** that automatically discovers and registers tools at application startup.

#### The `@McpTool` Decorator

```typescript
// apps/mcp/src/decorators/mcp-tool.decorator.ts
import 'reflect-metadata';
import type { AnySchema } from '@modelcontextprotocol/sdk/server/zod-compat.js';

export const MCP_TOOL_METADATA = 'mcp:tool';

export interface McpToolMetadata {
  name: string;
  title?: string;
  description?: string;
  inputSchema?: AnySchema;
  methodName: string;
  paramMap?: Record<string, string>;
}

export interface McpToolOptions {
  name: string;
  title?: string;
  description?: string;
  inputSchema?: AnySchema;
  /**
   * Maps MCP input schema property names to method parameter names.
   * Example: { filepath: 'filePath', userid: 'userId' }
   */
  paramMap?: Record<string, string>;
}

export function McpTool(options: McpToolOptions) {
  return (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ): PropertyDescriptor => {
    const metadata: McpToolMetadata = {
      ...options,
      methodName: propertyKey,
    };

    // Store metadata using reflect-metadata
    Reflect.defineMetadata(MCP_TOOL_METADATA, metadata, target, propertyKey);

    return descriptor;
  };
}
```

**How it works:**
1. The decorator stores metadata about each method using TypeScript's `reflect-metadata`
2. The metadata includes the tool name, description, input schema (Zod), and parameter mapping
3. At application startup, NestJS's `DiscoveryService` scans all providers for decorated methods
4. Each decorated method is automatically registered as an MCP tool

### 2. Exposing Shared Services as MCP Tools

Here's how we expose methods from our shared `AppService` as MCP tools:

```typescript
// apps/mcp/src/api/api.service.ts
import { Injectable } from '@nestjs/common';
import { AppService } from '@api/app.service'; // Shared service via path alias
import { McpTool } from '../decorators';
import * as z from 'zod/v4';
import { Observable } from 'rxjs';

@Injectable()
export class ApiService {
  constructor(private readonly appService: AppService) {}

  @McpTool({
    name: 'getHello',
    title: 'Get Hello Message',
    description: 'Get hello message',
  })
  getHello(): string {
    return this.appService.getHello();
  }

  @McpTool({
    name: 'getAllUsers',
    title: 'Get All Users',
    description: 'Get all users from the database',
  })
  getAllUsers(): Observable<any> {
    return this.appService.getAllUsers();
  }

  @McpTool({
    name: 'getPostById',
    title: 'Get Post By Id',
    description: 'Get a specific post by its ID',
    inputSchema: z.object({
      id: z.number().describe('The post ID'),
    }),
  })
  getPostById(id: number): Observable<any> {
    return this.appService.getPostById(id);
  }
}
```

**Key observations:**
- We inject the shared `AppService` from the API app
- Each method is decorated with `@McpTool` to expose it as an MCP tool
- Input validation is defined with **Zod schemas**
- Methods can return **Observables** for streaming data
- **No business logic duplication** — we're just wrapping existing methods

### 3. Automatic Tool Registration

The `McpService` uses NestJS's `DiscoveryService` to automatically find and register all decorated methods:

```typescript
// apps/mcp/src/mcp.service.ts (simplified)
import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from 
  '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { DiscoveryService } from '@nestjs/core';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { MCP_TOOL_METADATA, type McpToolMetadata } from './decorators';
import { isObservable, lastValueFrom } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class McpService implements OnApplicationBootstrap {
  private readonly logger = new Logger(McpService.name);
  private server: McpServer;
  public transport: StreamableHTTPServerTransport;

  constructor(private readonly discoveryService: DiscoveryService) {
    this.initializeMcpServer();
  }

  private initializeMcpServer(): void {
    this.server = new McpServer({
      name: 'nestjs-api-mcp',
      version: '1.0.0',
    });

    this.transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
    });
  }

  async onApplicationBootstrap(): Promise<void> {
    await this.discoverAndRegisterTools();
    await this.server.connect(this.transport);
    this.logger.log('MCP Service initialized successfully');
  }

  private async discoverAndRegisterTools(): Promise<void> {
    const providers: InstanceWrapper[] = this.discoveryService.getProviders();
    let toolCount = 0;

    for (const wrapper of providers) {
      if (!wrapper.instance || !wrapper.metatype) continue;

      const instance = wrapper.instance;
      const prototype = Object.getPrototypeOf(instance);
      const methodNames = Object.getOwnPropertyNames(prototype)
        .filter(name => name !== 'constructor');

      const toolMetadata: McpToolMetadata[] = [];

      for (const methodName of methodNames) {
        const metadata: McpToolMetadata | undefined = Reflect.getMetadata(
          MCP_TOOL_METADATA,
          prototype,
          methodName,
        );

        if (metadata) {
          toolMetadata.push(metadata);
        }
      }

      if (toolMetadata.length === 0) continue;

      this.logger.log(
        `Found ${toolMetadata.length} MCP tools in ${wrapper.metatype.name}`,
      );

      for (const tool of toolMetadata) {
        const methodRef = instance[tool.methodName];

        if (typeof methodRef === 'function') {
          this.server.registerTool(
            tool.name,
            {
              title: tool.title,
              description: tool.description,
              inputSchema: tool.inputSchema,
            },
            async (args: unknown) => {
              try {
                // Transform MCP args to method args
                const methodArgs = this.transformArgs(args, tool);
                const result = await methodRef.call(instance, methodArgs);

                // Handle Observable results by streaming via MCP logs
                if (isObservable(result)) {
                  let emissionCount = 0;
                  const finalResult = await lastValueFrom(
                    result.pipe(
                      tap(async (value) => {
                        emissionCount++;
                        await this.sendLog('info', `tool:${tool.name}`, {
                          emission: emissionCount,
                          data: value,
                        });
                      }),
                    ),
                  );
                  return this.formatToolResult(finalResult);
                }

                return this.formatToolResult(result);
              } catch (error) {
                this.logger.error(`Error executing tool ${tool.name}:`, error);
                return {
                  content: [{
                    type: 'text' as const,
                    text: `Error: ${error.message}`,
                  }],
                };
              }
            },
          );
          toolCount++;
        }
      }
    }

    this.logger.log(`Registered ${toolCount} MCP tools total`);
  }

  private transformArgs(args: unknown, tool: McpToolMetadata): unknown {
    if (!args || (typeof args === 'object' && Object.keys(args).length === 0)) {
      return undefined;
    }

    // Extract single parameter
    if (!tool.paramMap && typeof args === 'object') {
      const keys = Object.keys(args as Record<string, unknown>);
      if (keys.length === 1) {
        return (args as Record<string, unknown>)[keys[0]];
      }
      return args;
    }

    // Apply paramMap transformation if provided
    if (tool.paramMap) {
      const transformed: Record<string, unknown> = {};
      for (const [mcpParam, methodParam] of Object.entries(tool.paramMap)) {
        transformed[methodParam] = (args as Record<string, unknown>)[mcpParam];
      }
      return transformed;
    }

    return args;
  }

  private formatToolResult(result: unknown): CallToolResult {
    // If already in MCP format, return as-is
    if (
      result &&
      typeof result === 'object' &&
      'content' in result &&
      Array.isArray((result as any).content)
    ) {
      return result as CallToolResult;
    }

    // Otherwise, wrap in MCP format
    return {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  }

  public async sendLog(level: string, logger: string, data: any): Promise<void> {
    await this.server.sendLoggingMessage({ level, logger, data });
  }
}
```

**What's happening here:**

1. **Discovery Phase**: At application startup, `DiscoveryService` scans all providers
2. **Metadata Extraction**: For each provider, we check methods for `MCP_TOOL_METADATA`
3. **Tool Registration**: Each decorated method is registered with the MCP server
4. **Observable Handling**: If a method returns an RxJS Observable, emissions are streamed via MCP logging
5. **Automatic Formatting**: Results are automatically formatted to match MCP's `CallToolResult` format

### 4. HTTP Controller for MCP Protocol

The MCP server needs an HTTP endpoint to handle streaming requests:

```typescript
// apps/mcp/src/mcp.controller.ts
import { Controller, Post, Req, Res, Logger } from '@nestjs/common';
import { IncomingMessage, ServerResponse } from 'node:http';
import { McpService } from './mcp.service';

@Controller('mcp')
export class McpController {
  private readonly logger = new Logger(McpController.name);

  constructor(private readonly mcpService: McpService) {}

  @Post('')
  async postMcpEndpoint(
    @Req() request: IncomingMessage & { body?: any },
    @Res() response: ServerResponse<IncomingMessage>,
  ) {
    const method = request.body?.method || 'unknown';

    this.logger.log(`Incoming MCP request: ${method}`);

    // Lifecycle observability
    response.on('finish', () => {
      this.logger.log(`Response finished for ${method} (${response.statusCode})`);
    });

    response.on('close', () => {
      this.logger.log(`Connection closed for ${method}`);
    });

    try {
      // Transport takes exclusive control for SSE streaming
      await this.mcpService.transport.handleRequest(
        request,
        response,
        request.body,
      );
    } catch (error) {
      this.logger.error(`Error handling MCP request:`, error);

      if (!response.headersSent) {
        response.writeHead(500, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({
          jsonrpc: '2.0',
          error: { code: -32603, message: 'Internal error' },
        }));
      }
    }
  }
}
```

**Important notes:**
- The transport's `handleRequest` method takes **exclusive control** of the response
- You cannot write to the response after `handleRequest` is called
- Use `response.on('finish')` and `response.on('close')` for lifecycle logging
- Check `response.headersSent` before sending error responses

---

## Sharing Code Across Applications

### Path Aliases and Monorepo Configuration

To enable code sharing, we configure TypeScript path aliases:

```json
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": "./",
    "paths": {
      "@api/*": ["apps/api/src/*"],
      "@prisma-generated/*": ["generated/prisma/*"]
    }
  }
}
```

This allows the MCP app to import from the API app:

```typescript
import { AppService } from '@api/app.service';
import { User, Post } from '@prisma-generated/client';
```

### Nest CLI Monorepo Configuration

```json
// nest-cli.json
{
  "monorepo": true,
  "root": "apps/api",
  "projects": {
    "api": {
      "type": "application",
      "root": "apps/api",
      "entryFile": "main",
      "sourceRoot": "apps/api/src"
    },
    "mcp": {
      "type": "application",
      "root": "apps/mcp",
      "entryFile": "main",
      "sourceRoot": "apps/mcp/src"
    }
  }
}
```

This enables:
- `npm run start:dev api` — Start the REST API
- `npm run start:dev mcp` — Start the MCP server
- Both apps built and deployed independently

### Shared Business Logic Example

```typescript
// apps/api/src/app.service.ts (shared service)
import { Injectable } from '@nestjs/common';
import { from, Observable } from 'rxjs';
import { PrismaService } from './prisma/prisma.service';
import { User, Post } from '@prisma-generated/client';

@Injectable()
export class AppService {
  constructor(private readonly prisma: PrismaService) {}

  getAllUsers(): Observable<(User & { posts: Post[] })[]> {
    return from(
      this.prisma.user.findMany({
        include: { posts: true },
      })
    );
  }

  getPostById(id: number): Observable<(Post & { author: User }) | null> {
    return from(
      this.prisma.post.findUnique({
        where: { id },
        include: { author: true },
      })
    );
  }
}
```

**Both applications use the exact same service** — no duplication!

---

## MCP SDK Version Strategy

### Why I Stayed on v1.24.3

During my study, I discovered that the MCP SDK underwent significant architectural changes between versions. I decided to stay on **v1.24.3** instead of upgrading to v1.26.0+. Here's why:

#### v1.24.3 Pattern (Singleton)

```typescript
@Injectable()
export class McpService {
  private server: McpServer;           // Created once
  public transport: StreamableHTTPServerTransport; // Created once

  constructor() {
    this.server = new McpServer({ ... });
    this.transport = new StreamableHTTPServerTransport({ ... });
  }

  async onApplicationBootstrap() {
    this.discoverAndRegisterTools();   // Register tools once
    await this.server.connect(this.transport); // Connect once
  }
}
```

**Characteristics:**
- One `McpServer` instance for the entire application lifecycle
- One transport instance for all requests
- Tools registered **once** during bootstrap
- `server.connect()` called **once**
- **Minimal per-request overhead**

#### v1.26.0 Pattern (Per-Request)

```typescript
app.post('/mcp', async (req, res) => {
  const server = getServer(); // Create NEW server
  const transport = new StreamableHTTPServerTransport({ ... });
  
  await server.connect(transport); // Connect for THIS request
  await transport.handleRequest(req, res, req.body);
  
  res.on('close', () => {
    transport.close();
    server.close();
  });
});
```

**Characteristics:**
- New `McpServer` created for **every request**
- New transport created for **every request**
- All tools registered for **every request**
- `server.connect()` called **before each request**
- **Significant per-request overhead**

### Performance Comparison

| Operation | v1.24.3 | v1.26.0 | Impact |
|-----------|---------|---------|--------|
| Create McpServer | Once (startup) | Every request | **High** |
| Register tools | Once (4 tools at startup) | Every request (4 tools × N requests) | **High** |
| Create transport | Once (startup) | Every request | Medium |
| Connect server | Once (startup) | Every request | Medium |
| Cleanup | Never (GC at shutdown) | Every request | Low |

**Estimated overhead:** 5-10ms additional latency per request in v1.26.0

### Why v1.24.3 Works Better for NestJS

1. **Singleton Pattern**: NestJS services are singletons by design — v1.24.3 aligns perfectly
2. **Performance**: No per-request overhead for server/transport creation
3. **Simplicity**: Less code complexity, easier to maintain
4. **Stability**: Proven stable in production, no breaking issues

For our stateless use case, **v1.26.0 provides no benefits while introducing overhead and complexity**.

### When to Reconsider

We would upgrade to v1.26.0+ if:
- Critical security vulnerabilities are found in v1.24.3
- New MCP protocol features are required that only exist in newer versions
- The SDK team provides official guidance for long-lived server instances
- A stateful mode becomes necessary for our use case

---

## Developer Experience Highlights

### 1. Type Safety Everywhere

```typescript
// Shared Prisma types
import { User, Post } from '@prisma-generated/client';

// Auto-generated DTOs from Swagger
import { CreateUserDto } from '@api/users/dto/create-user.dto';

// Full TypeScript validation
@McpTool({
  inputSchema: z.object({
    id: z.number().positive(),
  }),
})
getPostById(id: number): Observable<Post | null> {
  // Full type checking and autocomplete
}
```

### 2. Single Command Development

```bash
# Terminal 1: Run API
npm run start:dev api

# Terminal 2: Run MCP Server
npm run start:dev mcp

# Both watch for changes and hot-reload
```

### 3. Automatic Tool Discovery Logs

When the MCP server starts, you see:

```
[McpService] Found 4 MCP tools in ApiService
[McpService]   → Registering tool: getHello (getHello)
[McpService]   → Registering tool: getAllUsers (getAllUsers)
[McpService]   → Registering tool: getAllPosts (getAllPosts)
[McpService]   → Registering tool: getPostById (getPostById)
[McpService] Registered 4 MCP tools total
[McpService] MCP Service initialized successfully
```

No manual registration required!

### 4. Observable Streaming Support

Methods that return RxJS Observables automatically stream their emissions:

```typescript
@McpTool({ name: 'getAllUsers' })
getAllUsers(): Observable<User[]> {
  return this.appService.getAllUsers();
}

// MCP logs show:
// tool:getAllUsers - Streaming data emission 1
// tool:getAllUsers - Streaming data emission 2
// tool:getAllUsers - Stream complete. Total emissions: 2
```

---

## Security Considerations

### Separate Authentication Systems

```typescript
// API (apps/api/src/auth/jwt-auth.guard.ts)
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  // Enterprise OAuth2, API keys, etc.
}

// MCP (apps/mcp/src/auth/mcp-auth.guard.ts)
@Injectable()
export class McpAuthGuard implements CanActivate {
  // AI assistant-specific authentication
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Custom MCP authentication logic
  }
}
```

### Separate Deployment Units

```yaml
# docker-compose.yml (example)
services:
  api:
    build: ./apps/api
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - AUTH_TYPE=jwt

  mcp:
    build: ./apps/mcp
    ports:
      - "3001:3001"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - AUTH_TYPE=mcp-custom
```

**Key benefits:**
- MCP server can be shut down independently
- Different security policies and configurations
- Separate monitoring and observability
- Different scaling strategies

---

## Real-World Usage

### Starting the Applications

```bash
# Install dependencies
npm install

# Generate Prisma types
npm run prisma:generate

# Start the API (port 3000)
npm run start:dev api

# Start the MCP server (port 3001)
npm run start:dev mcp
```

### Testing with an MCP Client

You can test the MCP server with any MCP-compatible client (Claude Desktop, custom clients, etc.):

```json
{
  "mcpServers": {
    "nestjs-api": {
      "url": "http://localhost:3001/mcp"
    }
  }
}
```

### Example Tool Call

When an AI assistant calls `getPostById`:

```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "getPostById",
    "arguments": {
      "id": 1
    }
  }
}
```

The MCP server:
1. Validates the input against the Zod schema
2. Transforms `{ id: 1 }` to just `1` (single parameter extraction)
3. Calls `appService.getPostById(1)`
4. Streams the Observable emissions via MCP logs
5. Returns the final result in MCP format

---

## Lessons Learned

### What Worked Well

1. **Decorator Pattern**: The `@McpTool` decorator provides an excellent developer experience
2. **Monorepo Architecture**: Sharing code while keeping deployments separate is powerful
3. **Type Safety**: TypeScript + Prisma + Zod = zero runtime surprises
4. **Observable Streaming**: RxJS integration allows real-time data streaming to AI assistants
5. **Singleton Pattern**: v1.24.3's approach aligns perfectly with NestJS

### Challenges

1. **MCP SDK Evolution**: The SDK is still evolving rapidly — version selection matters
2. **Documentation Gap**: MCP SDK documentation for NestJS/singleton patterns is limited
3. **Streaming Complexity**: Understanding SSE lifecycle and `handleRequest` behavior required deep investigation

### Best Practices

1. **Pin MCP SDK version** — Don't auto-upgrade without testing
2. **Use path aliases** — Makes imports clean and maintainable
3. **Leverage DiscoveryService** — Automatic tool registration saves boilerplate
4. **Separate concerns** — Don't mix API and MCP logic in the same controller
5. **Test independently** — Each app should have its own test suite

---

## Conclusion

By leveraging NestJS's monorepo capabilities and creating a custom decorator-based tool discovery system, I successfully achieved our goals:

✅ **No code duplication** between API and MCP server  
✅ **Excellent developer experience** with automatic tool registration  
✅ **Production-ready security** with separate deployment units  
✅ **Full type safety** across shared code  
✅ **Streaming support** via RxJS Observables  
✅ **Independent scaling** and monitoring  

The architecture will allow us to:
- **Shut down the MCP server** without affecting production
- **Evolve the MCP implementation** without touching the API
- **Maintain a single source of truth** for business logic
- **Deploy updates independently** to each application

This approach strikes the perfect balance between **security, maintainability, and developer experience**.

---

## Resources

- [GitHub Repository](https://github.com/ThomasRumas/nestjs-api-mcp)
- [NestJS Monorepo Documentation](https://docs.nestjs.com/cli/monorepo)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [NestJS Discovery Module](https://docs.nestjs.com/recipes/discovery)

---

**Questions or feedback?** Feel free to open an issue on the [GitHub repository](https://github.com/ThomasRumas/nestjs-api-mcp) or reach out to me on [X/Twitter](https://x.com/ThomasRumas).
