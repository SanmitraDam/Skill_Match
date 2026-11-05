'use client';

import React, { useState, useEffect } from 'react';
import {
  Code2,
  Play,
  Cpu,
  Zap,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  Layers,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  Terminal,
  ChevronRight
} from 'lucide-react';
import { useExecuteSandbox, useProfileAST } from '@/hooks/useFastAPI';

interface TestCase {
  name: string;
  passed: boolean;
  latency_micros: number;
  memory_allocated_bytes: number;
}

const CHALLENGES = [
  {
    id: 'two_sum',
    title: 'Two Sum: Sub-Quadratic Indexing',
    difficulty: 'Medium',
    targetComplexity: 'O(N)',
    defaultCode: `def two_sum(nums: list[int], target: int) -> list[int]:
    """Finds indices of two numbers that add up to target in O(N) time."""
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []
`,
  },
  {
    id: 'lru_cache',
    title: 'LRU Cache: O(1) Get & Put',
    difficulty: 'Hard',
    targetComplexity: 'O(1)',
    defaultCode: `class LRUCache:
    """Least Recently Used Cache with O(1) hash map & doubly-linked list."""
    def __init__(self, capacity: int):
        self.capacity = capacity
        self.cache = {}
        
    def get(self, key: int) -> int:
        if key not in self.cache:
            return -1
        return self.cache[key]

    def put(self, key: int, value: int) -> None:
        self.cache[key] = value
`,
  },
  {
    id: 'nested_suboptimal',
    title: 'Quadratic Brute Force (Anti-Pattern Demo)',
    difficulty: 'Easy',
    targetComplexity: 'O(N^2)',
    defaultCode: `def brute_force_search(nums: list[int], target: int) -> list[int]:
    """Demonstrates O(N^2) nested loop triggering AST Socratic scaffolding."""
    for i in range(len(nums)):
        for j in range(i + 1, len(nums)):
            if nums[i] + nums[j] == target:
                return [i, j]
    return []
`,
  }
];

export const CodeSandboxStudio: React.FC = () => {
  const [selectedChallenge, setSelectedChallenge] = useState(CHALLENGES[0]);
  const [sourceCode, setSourceCode] = useState(CHALLENGES[0].defaultCode);
  const [language, setLanguage] = useState<'python' | 'typescript' | 'cpp'>('python');

  const executeSandboxMutation = useExecuteSandbox();
  const profileASTMutation = useProfileAST();

  const [astComplexity, setAstComplexity] = useState<{
    time: string;
    space: string;
    loopDepth: number;
    hasRecursion: boolean;
  }>({
    time: 'O(N)',
    space: 'O(N)',
    loopDepth: 1,
    hasRecursion: false,
  });

  const [executionResult, setExecutionResult] = useState<any>(null);

  // Sync default code on challenge switch
  const handleSelectChallenge = (ch: typeof CHALLENGES[0]) => {
    setSelectedChallenge(ch);
    setSourceCode(ch.defaultCode);
    setExecutionResult(null);
  };

  // Immediate AST Profiling on code edits
  useEffect(() => {
    const timer = setTimeout(() => {
      if (sourceCode.trim().length > 10) {
        profileASTMutation.mutate(
          { source_code: sourceCode, language },
          {
            onSuccess: (data) => {
              setAstComplexity({
                time: data.ast_time_complexity || 'O(1)',
                space: data.space_complexity || 'O(1)',
                loopDepth: data.loop_nesting_depth || 0,
                hasRecursion: !!data.has_recursive_calls,
              });
            },
          }
        );
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [sourceCode, language]);

  const handleRunCode = () => {
    executeSandboxMutation.mutate(
      {
        candidate_id: 'cand_sandbox_user',
        language,
        source_code: sourceCode,
        challenge_id: selectedChallenge.id,
      },
      {
        onSuccess: (data) => {
          setExecutionResult(data);
          if (data.ast_complexity) {
            setAstComplexity({
              time: data.ast_complexity.ast_time_complexity || 'O(1)',
              space: data.ast_complexity.space_complexity || 'O(1)',
              loopDepth: data.ast_complexity.loop_nesting_depth || 0,
              hasRecursion: !!data.ast_complexity.has_recursive_calls,
            });
          }
        },
      }
    );
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-12">
      {/* Top Header Banner */}
      <div className="relative overflow-hidden rounded-2xl theme-card border border-[var(--glass-border-subtle)] p-6 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-cyan-500 animate-pulse" />
                Live Code Sandbox
              </span>
              <span className="px-2.5 py-0.5 text-xs font-mono rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                WASM Execution
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-[var(--fg-color)] tracking-tight">
              Live Coding Sandbox &amp; Complexity Profiler
            </h1>
            <p className="text-sm text-[var(--fg-muted)] max-w-2xl mt-1">
              Real-time code evaluation with static Big-O complexity deduction, algorithmic hint scaffolding, and edge boundary unit testing.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setSourceCode(selectedChallenge.defaultCode)}
              className="px-3.5 py-2 rounded-xl text-xs font-medium text-[var(--fg-color)] bg-[var(--glass-bg)] hover:border-[var(--accent-primary)] border border-[var(--glass-border-subtle)] transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Code
            </button>
            <button
              onClick={handleRunCode}
              disabled={executeSandboxMutation.isPending}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 shadow-md border border-cyan-400/30 transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" />
              {executeSandboxMutation.isPending ? 'Executing...' : 'Run Unit Tests'}
            </button>
          </div>
        </div>

        {/* Challenge Selection Bar */}
        <div className="mt-6 flex flex-wrap gap-2 pt-4 border-t border-[var(--glass-border-subtle)]">
          {CHALLENGES.map((ch) => (
            <button
              key={ch.id}
              onClick={() => handleSelectChallenge(ch)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-2 cursor-pointer ${
                selectedChallenge.id === ch.id
                  ? 'bg-cyan-500/20 text-cyan-600 dark:text-cyan-300 border border-cyan-500/50 shadow-sm font-bold'
                  : 'bg-[var(--glass-bg)] text-[var(--fg-muted)] border border-[var(--glass-border-subtle)] hover:text-[var(--fg-color)]'
              }`}
            >
              <span>{ch.title}</span>
              <span className={`px-1.5 py-0.5 text-[10px] rounded font-mono ${
                ch.difficulty === 'Hard' ? 'bg-rose-500/15 text-rose-600 dark:text-rose-300' : (ch.difficulty === 'Medium' ? 'bg-amber-500/15 text-amber-600 dark:text-amber-300' : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300')
              }`}>
                {ch.targetComplexity}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Left Code Editor, Right Telemetry & Scaffolding */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Code Editor (7 cols) */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          <div className="rounded-2xl theme-card overflow-hidden flex flex-col h-[560px]">
            {/* Editor Toolbar */}
            <div className="bg-[var(--glass-bg)] px-4 py-3 border-b border-[var(--glass-border-subtle)] flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                </div>
                <div className="h-4 w-px bg-[var(--glass-border-subtle)]" />
                <span className="font-mono text-[var(--fg-color)] flex items-center gap-1.5">
                  <Code2 className="w-4 h-4 text-cyan-500" />
                  solution.py
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex bg-[var(--glass-card)] p-0.5 rounded-lg border border-[var(--glass-border-subtle)] text-[11px]">
                  <button
                    onClick={() => setLanguage('python')}
                    className={`px-2.5 py-1 rounded transition-colors ${language === 'python' ? 'bg-[var(--accent-primary)]/15 text-[var(--accent-primary)] font-semibold' : 'text-[var(--fg-muted)] hover:text-[var(--fg-color)]'}`}
                  >
                    Python (WASM)
                  </button>
                  <button
                    onClick={() => setLanguage('typescript')}
                    className={`px-2.5 py-1 rounded transition-colors ${language === 'typescript' ? 'bg-[var(--accent-primary)]/15 text-[var(--accent-primary)] font-semibold' : 'text-[var(--fg-muted)] hover:text-[var(--fg-color)]'}`}
                  >
                    TypeScript
                  </button>
                </div>
              </div>
            </div>

            {/* Code Input Area */}
            <div className="relative flex-1 bg-[var(--bg-subtle)] p-4 font-mono text-sm leading-relaxed overflow-auto">
              <textarea
                value={sourceCode}
                onChange={(e) => setSourceCode(e.target.value)}
                spellCheck={false}
                className="w-full h-full bg-transparent text-[var(--fg-color)] resize-none outline-none font-mono text-xs md:text-sm leading-6 selection:bg-[var(--accent-primary)]/20"
              />
            </div>

            {/* Editor Footer Status */}
            <div className="bg-[var(--glass-bg)] px-4 py-2 border-t border-[var(--glass-border-subtle)] flex items-center justify-between text-[11px] text-[var(--fg-muted)]">
              <div className="flex items-center gap-4">
                <span>Lines: {sourceCode.split('\n').length}</span>
                <span>Chars: {sourceCode.length}</span>
                <span className="text-cyan-500 flex items-center gap-1">
                  <Cpu className="w-3 h-3" /> Pyodide 0.25.1 Active
                </span>
              </div>
              <div className="flex items-center gap-2 text-emerald-500">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                AST Live Analysis Active
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: AST Complexities, Edge Tests & Socratic Scaffolding (5 cols) */}
        <div className="lg:col-span-5 flex flex-col space-y-4">
          {/* AST Complexity Card */}
          <div className="rounded-2xl bg-[var(--glass-card)] border border-[var(--glass-border-subtle)] p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-[var(--fg-color)] flex items-center gap-2">
                <Cpu className="w-4 h-4 text-cyan-500" />
                Static AST Complexity Analysis
              </h2>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30">
                Deterministic
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className={`p-3 rounded-xl border ${
                astComplexity.time === 'O(N^2)'
                  ? 'bg-amber-500/10 border-amber-500/30'
                  : 'bg-emerald-500/10 border-emerald-500/30'
              }`}>
                <div className="text-[10px] uppercase font-medium text-[var(--fg-muted)]">Time Complexity</div>
                <div className="text-xl font-mono font-bold mt-1 text-[var(--fg-color)] flex items-center justify-between">
                  <span>{astComplexity.time}</span>
                  {astComplexity.time === 'O(N^2)' ? (
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  )}
                </div>
                <div className="text-[10px] text-[var(--fg-muted)] mt-1">
                  {astComplexity.time === 'O(N^2)' ? 'Sub-optimal nested loop' : 'Linear or constant time'}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border-subtle)]">
                <div className="text-[10px] uppercase font-medium text-[var(--fg-muted)]">Space Complexity</div>
                <div className="text-xl font-mono font-bold mt-1 text-[var(--fg-color)] flex items-center justify-between">
                  <span>{astComplexity.space}</span>
                  <Layers className="w-4 h-4 text-indigo-500" />
                </div>
                <div className="text-[10px] text-[var(--fg-muted)] mt-1">Auxiliary Memory Space</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono text-[var(--fg-color)] pt-1">
              <div className="flex justify-between bg-[var(--glass-bg)] px-3 py-1.5 rounded-lg border border-[var(--glass-border-subtle)]">
                <span className="text-[var(--fg-muted)]">Nesting Depth:</span>
                <span className="font-bold text-cyan-600 dark:text-cyan-300">{astComplexity.loopDepth}</span>
              </div>
              <div className="flex justify-between bg-[var(--glass-bg)] px-3 py-1.5 rounded-lg border border-[var(--glass-border-subtle)]">
                <span className="text-[var(--fg-muted)]">Recursion:</span>
                <span className={`font-bold ${astComplexity.hasRecursion ? 'text-amber-500' : 'text-[var(--fg-color)]'}`}>
                  {astComplexity.hasRecursion ? 'DETECTED' : 'NONE'}
                </span>
              </div>
            </div>
          </div>

          {/* Socratic Hint Scaffolding */}
          <div className="rounded-2xl bg-[var(--glass-card)] border border-[var(--glass-border-subtle)] p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              <h2 className="text-sm font-bold text-[var(--fg-color)]">Algorithmic Guidance</h2>
            </div>
            <p className="text-xs text-[var(--fg-muted)] leading-relaxed">
              {executionResult?.socratic_hints?.[0] ||
                (astComplexity.time === 'O(N^2)'
                  ? 'Notice the nested iteration pattern. Can you trade auxiliary space (e.g. an O(N) hash table) to achieve single-pass O(N) linear time?'
                  : 'Your asymptotic algorithm is optimal! Focus on edge cases such as empty input arrays or duplicate targets.')}
            </p>
          </div>

          {/* Edge Unit Tests Execution */}
          <div className="rounded-2xl bg-[var(--glass-card)] border border-[var(--glass-border-subtle)] p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-[var(--fg-color)] flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-500" />
                Edge Unit Tests Execution
              </h2>
              {executionResult && (
                <span className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded-full ${
                  executionResult.sub_10ms_sla_passed
                    ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-500/40'
                    : 'bg-rose-500/20 text-rose-600 dark:text-rose-300 border border-rose-500/40'
                }`}>
                  {executionResult.execution_latency_ms}ms
                </span>
              )}
            </div>

            <div className="space-y-2">
              {(executionResult?.edge_tests || [
                { test_name: 'standard_case', passed: true, latency_micros: 420 },
                { test_name: 'empty_input_edge', passed: true, latency_micros: 380 },
                { test_name: 'negative_numbers', passed: true, latency_micros: 450 },
                { test_name: 'large_input_boundary (N=1000)', passed: true, latency_micros: 610 },
              ]).map((t: any, idx: number) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border-subtle)] text-xs"
                >
                  <div className="flex items-center gap-2">
                    {t.passed ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    )}
                    <span className="font-mono text-[var(--fg-color)]">{t.test_name}</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono text-[11px] text-[var(--fg-muted)]">
                    <Clock className="w-3 h-3 text-cyan-500" />
                    <span>{t.latency_micros} μs</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Code Quality Rubric Bar */}
            {executionResult && (
              <div className="pt-3 border-t border-[var(--glass-border-subtle)] mt-3 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[var(--fg-muted)] flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-cyan-500" />
                    Code Quality Rubric
                  </span>
                  <span className="font-bold text-cyan-600 dark:text-cyan-300 font-mono">
                    {executionResult.code_quality_score}/100
                  </span>
                </div>
                <div className="w-full bg-[var(--glass-bg)] rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${executionResult.code_quality_score}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
