---
title: "Streamlining WordPress Development with Docker"
date: 2018-11-14
description: Improve your WordPress development workflow using Docker for consistent environments
img: wordpress.png
tags: [DevOps, Development]
---

WordPress is the world's most popular CMS, thanks to its active community and rich ecosystem of themes and plugins. Consequently, it's used by many people to deploy and develop countless websites. However, before developing with WordPress, you typically need to configure your machine with Nginx/Apache, install PHP, MySQL, and more—which isn't accessible to every developer. Each specialist has their own domain of expertise.

In this guide, we'll see how to spin up a WordPress site with all necessary prerequisites for a development environment. If your WordPress site is version-controlled with Git and your database is accessible, you can follow this tutorial to deploy your WordPress more efficiently.

## Why Docker?

As I explained in a [previous article](/posts/2018-07-24-dokku/), Docker is simple and easy to install. It doesn't require extensive system administration knowledge for users to start working with Docker images.

Docker also facilitates collaboration. How many times have you heard a colleague say, "It doesn't work for you? Works fine for me, look!" Nothing is more frustrating than having different development environments among teammates, or between development and staging/production.

Having an environment identical to production is essential. If your environments diverge, how can you tell if a bug after deploying a release or new feature comes from your code, npm dependencies, or server configuration?

Identical environments for all developers is a prerequisite given the number of dependencies and tools we use daily to improve our workflow.

Using a Docker image provides much greater flexibility. There are numerous ways to deploy Docker images to servers—whether during development, in test environments, or pre-production. We'll revisit this topic later, but it's not the focus of today's article.

## Creating the Docker Image

First, we'll create a Docker image containing the necessary steps to deploy WordPress. Our directory structure will be:

- Dockerfile
- entrypoint.sh

The Dockerfile will contain all instructions needed to create our environment. The entrypoint file will contain instructions to execute when starting our instance.

### Dockerfile Contents

```dockerfile
FROM php:7.2-apache

ENV branch=master
ENV git=https://github.com/WordPress/WordPress.git

RUN apt update
RUN apt install git dos2unix -y
RUN docker-php-ext-install pdo pdo_mysql mysqli

WORKDIR /var/www/html

COPY entrypoint.sh /
RUN dos2unix /entrypoint.sh
RUN chmod u+x /entrypoint.sh

EXPOSE 80
VOLUME [ "/var/www/html" ]

ENTRYPOINT [ "sh","/entrypoint.sh" ]
```

As explained earlier, to deploy WordPress, we need an environment running a web server and PHP. Here we'll use PHP 7.2 with Apache as the web server.

The line `FROM php:7.2-apache` uses an official Docker image from the PHP hub that provides the services we need.

You'll notice we've defined environment variables (using the `ENV` keyword). These variables allow us to use default values when no parameters are passed during image launch.

The `RUN` commands execute shell commands in our Docker container necessary for system operation.

By default, files in a Docker image aren't accessible by the host running the image. To make them accessible, we declare a `VOLUME` that can be mounted locally on our machine for editing files.

A web server must be accessible, which is why the `EXPOSE` line indicates a port to access our Docker container—here port 80 for Apache.

Finally, we provide an `ENTRYPOINT` file to our image. Let's examine its contents in detail.

### entrypoint.sh Contents

```bash
#!/bin/bash
set -e; 

if [ -z "$(ls -A /var/www/html)" ]; then
   echo "Folder is empty"; 
   echo "Get the source from git repository on specific branch : $branch"; 
   git clone -b $branch $git /var/www/html; 
fi

apachectl -DFOREGROUND;
```

The entrypoint content is straightforward. Using an official PHP hub image allows us to skip all the steps necessary for configuring an Apache server with PHP, focusing only on essentials.

Remember our environment variables? They're used here as script variables, making our script more generic and reusable.

The condition checks if the `/var/www/html` folder is empty. If so, Docker fetches sources from the Git repository we provided during image initialization.

Finally, the line `apachectl -DFOREGROUND` runs our Apache service in the background to prevent Docker from shutting down once all tasks are complete.

Now that we've seen how these two files work, how do we use them?

## Using Our Image

Ready? The hardest part is behind us. Now just a few commands to launch our WordPress instance!

```bash
docker build --tag wordpress .
docker run -p 8080:80 -v ${PWD}:/var/www/html --link mysql-instance:mysql -e branch=master -e git=https://github.com/WordPress/WordPress.git wordpress
```

The first command creates our Docker image on our machine so we can use it. The second command launches a Docker instance based on our compiled image. Let's examine the parameters:

- `-p 8080:80` forwards all requests to our machine's port 8080 to port 80 of our Docker instance
- `-v ${PWD}:/var/www/html` mounts the `/var/www/html` directory content to the current folder where we launched our instance (modify this path as needed)
- `--link mysql-instance:mysql` allows our two instances to communicate if you're using a Docker MySQL instance (unnecessary if your database is on another server)
- `-e branch=master` specifies which branch to fetch sources from
- `-e git=https://github.com/WordPress/WordPress.git` specifies the repository to fetch branch content from

If you followed these steps correctly, visiting `http://localhost:8080` should display your WordPress instance ready to use. The advantage of this solution is you've bypassed all configuration, and everyone working on your project will have the same development environment. You could easily migrate environments for everyone by deploying a new Docker image and instance.

## Conclusion

You can find all source code from this article on my [GitHub](https://github.com/ThomasRumas/wordpress-starter). I'll update it as my needs evolve.

Remember that WordPress requires a MySQL database. You can also instantiate a MySQL image using Docker:

```bash
docker run --name mysql-instance -e MYSQL_ROOT_PASSWORD=toto -d -p 3306:3306 mysql:5.7
```

Then use any MySQL administration tool to connect and create the database needed for WordPress.

### Going Further

We could imagine fetching a database to a Docker MySQL instance for local work. However, everything done on a local database won't reflect in production, requiring data synchronization between databases for your site to function. Perhaps the best approach is deploying separate development and production databases, periodically syncing production down to development environments.

Additionally, this Docker image works well for continuous deployment. We could easily use this image with a Docker container orchestrator to deploy our WordPress site.

I hope you enjoyed this article. I'm open to any recommendations and questions.
