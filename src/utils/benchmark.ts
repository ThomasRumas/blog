export interface BenchmarkTask {
  task: string;
  status: 'success' | 'failure' | 'error';
  reward: number;
  agent: string;
  agent_version: string;
  tokens: {
    input: number;
    output: number;
    cache: number;
  };
  cost_usd: number | null;
  timing: {
    agent_setup: string;
    agent_execution: string;
    verifier: string;
    total: string;
  };
  error?: {
    type: string;
    message: string;
  };
  failure_reason?: string;
  test_details: {
    test_summary_line: string;
    failed_tests?: string[];
  };
}

export interface BenchmarkSummary {
  total_tasks: number;
  success: number;
  failure: number;
  error: number;
  success_rate: string;
}

export interface BenchmarkData {
  generated_at: string;
  jobs_dir: string;

  summary: BenchmarkSummary;
  tasks: BenchmarkTask[];
}

// ─── Task scoring ──────────────────────────────────────────────────────────

/**
 * Parse pytest-style summary lines like:
 *   "4 passed in 0.19s"
 *   "1 failed, 5 passed in 13.10s"
 *   "3 failed in 1.41s"
 */
export function parseTestLine(line: string): { passed: number; total: number } {
  if (!line || line === '—') return { passed: 0, total: 0 };
  const passMatch  = line.match(/(\d+)\s+passed/);
  const failMatch  = line.match(/(\d+)\s+failed/);
  const errorMatch = line.match(/(\d+)\s+error/);
  const passed = passMatch  ? Number(passMatch[1])  : 0;
  const failed = failMatch  ? Number(failMatch[1])  : 0;
  const errors = errorMatch ? Number(errorMatch[1]) : 0;
  return { passed, total: passed + failed + errors };
}

export type TaskGrade = 'success' | 'partial' | 'failure';

export interface TaskScore {
  grade:         TaskGrade;
  passed:        number;
  total:         number;
  passRate:      number;        // 0–1
  errorMessage?: string;        // present when task ran into an error
}

/**
 * Compute the display grade for a single task:
 * - 100 %       → success
 * - ≥ 75 %      → partial
 * - < 75 %      → failure
 *
 * When status === 'error' but tests still meet the partial threshold, the
 * task is graded as partial and the error message is attached for tooltip display.
 */
export function computeTaskScore(task: BenchmarkTask): TaskScore {
  const line = task.test_details?.test_summary_line ?? '';
  const { passed, total } = parseTestLine(line);

  const passRate = total > 0
    ? passed / total
    : task.status === 'success' ? 1 : 0;

  const grade: TaskGrade =
    passRate >= 1    ? 'success' :
    passRate >= 0.75 ? 'partial' :
                       'failure';

  const errorMessage = task.error?.message ?? undefined;

  return { grade, passed, total, passRate, errorMessage };
}

// ─── Run-level stats ───────────────────────────────────────────────────────

export interface RunStats {
  total:           number;
  success:         number;
  partial:         number;
  failure:         number;
  overallPassRate: number;   // weighted 0–1 across all task test lines
}

export function computeRunStats(tasks: BenchmarkTask[]): RunStats {
  const scores  = tasks.map(computeTaskScore);
  const total   = scores.length;
  const success = scores.filter(s => s.grade === 'success').length;
  const partial = scores.filter(s => s.grade === 'partial').length;
  const failure = scores.filter(s => s.grade === 'failure').length;

  const allPassed = scores.reduce((sum, s) => sum + s.passed, 0);
  const allTotal  = scores.reduce((sum, s) => sum + s.total,  0);
  const overallPassRate = allTotal > 0
    ? allPassed / allTotal
    : total > 0 ? success / total : 0;

  return { total, success, partial, failure, overallPassRate };
}

// ─── Run (file) ────────────────────────────────────────────────────────────

/** One JSON file parsed from public/benchmark/{model}/{agentRun}.json */
export interface BenchmarkRun {
  /** Folder name — the LLM / suite being evaluated (e.g. "omnicoder-9b") */
  model: string;
  /** Filename without extension — the agent that ran the tasks (e.g. "claude-code") */
  agentRun: string;
  data: BenchmarkData;
}
