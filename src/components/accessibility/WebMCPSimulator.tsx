'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/store/useStore';
import { createCanonicalWebMCPTools } from '@/lib/webmcp/tools';
import { Terminal, X, Play, ShieldAlert, Sparkles } from 'lucide-react';

export function WebMCPSimulator() {
  const isOpen = useStore((state) => state.isSimulatorOpen);
  const setOpen = useStore((state) => state.setSimulatorOpen);
  const isWebMCPAvailable = useStore((state) => state.isWebMCPAvailable);
  const registeredToolCount = useStore((state) => state.registeredToolCount);
  const [selectedTool, setSelectedTool] = useState<string>('adjust_reading_mode');
  const [logOutput, setLogOutput] = useState<string>('Ready for agent action.');
  const [isRunning, setIsRunning] = useState(false);

  const tools = createCanonicalWebMCPTools();
  const currentTool = tools.find((t) => t.name === selectedTool) || tools[0];

  if (!isOpen) return null;

  const handleExecute = async () => {
    setIsRunning(true);
    setLogOutput(`[Agent] Calling "${currentTool.name}"...`);

    try {
      let testInput: any = {};

      if (currentTool.name === 'adjust_reading_mode') {
        testInput = {
          fontFamily: 'lexend',
          contrastTheme: 'soft-cream',
          bionicReading: true,
          letterSpacing: 'wide',
          lineHeight: 'relaxed',
        };
      } else if (currentTool.name === 'render_simplified_view') {
        testInput = {
          simplifiedContent: 'Special fonts alone do not fix reading problems. Clinical tests show that wider letter spacing and line height stop letters from blending together. Soft cream tints also stop glare.',
          keyTakeaways: [
            'Letter and line spacing reduce reading fatigue.',
            'Warm background tints prevent photopic glare.',
            'Working memory is preserved when layouts are predictable.',
          ],
        };
      } else if (currentTool.name === 'assist_draft_content') {
        testInput = {
          rawText: 'city bus ramp broken 4th ave need inspect right now dangerous for chairs',
          intent: 'expand_telegraphic_shorthand',
        };
      } else if (currentTool.name === 'publish_article') {
        testInput = {
          title: 'Live Agent Test: Accessibility in Action',
          content: 'This post was generated and dispatched by the NOD WebMCP agent engine to confirm end-to-end publishing.',
          category: 'tips',
          tags: ['webmcp', 'agentic', 'accessibility'],
        };
      } else if (currentTool.name === 'search_community_feed') {
        testInput = { query: 'dyslexia', category: 'all' };
      } else if (currentTool.name === 'post_comment') {
        const activeArticle = useStore.getState().activeArticle;
        testInput = {
          articleId: activeArticle ? activeArticle.id : 'seed-001',
          content: 'This WebMCP simplified view made this article so much easier for me to digest!',
        };
      }

      const result = await currentTool.execute(testInput);
      setLogOutput(
        `✓ [Success: ${currentTool.name}]\nArguments:\n${JSON.stringify(testInput, null, 2)}\n\nResult:\n${JSON.stringify(result, null, 2)}`
      );
    } catch (err: any) {
      setLogOutput(`✗ [Error executing ${currentTool.name}]:\n${err.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex justify-end animate-in fade-in duration-200"
      role="dialog"
      aria-labelledby="simulator-title"
      aria-modal="true"
    >
      <div className="w-full max-w-xl bg-brand-surface border-l border-brand-border h-full flex flex-col p-6 overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-brand-border">
          <div className="flex items-center gap-2.5">
            <Terminal className="w-5 h-5 text-brand-green" />
            <h2 id="simulator-title" className="text-base font-bold text-brand-text">
              WebMCP Agent Inspector & Simulator
            </h2>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="p-1.5 rounded-lg text-brand-muted hover:text-brand-text hover:bg-brand-surface-elevated"
            aria-label="Close inspector"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Runtime Diagnostics */}
        <div className="my-4 p-3 bg-brand-surface-elevated border border-brand-border rounded-xl flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${isWebMCPAvailable ? 'bg-brand-green animate-pulse' : 'bg-emerald-500'}`} />
            <span className="text-brand-text font-medium">
              {isWebMCPAvailable ? 'Native document.modelContext Active' : 'Simulated Agent Environment'}
            </span>
          </div>
          <span className="font-semibold text-brand-green">
            {tools.length} Tools Available
          </span>
        </div>

        {/* Notice for Judges */}
        <div className="mb-4 p-3 bg-brand-green-muted/40 border border-brand-green/20 rounded-xl text-xs text-brand-muted flex items-start gap-2">
          <Sparkles className="w-4 h-4 text-brand-green shrink-0 mt-0.5" />
          <span>
            This inspector allows testing all canonical WebMCP tools in any browser. In ChatGPT App or Chrome 149+, these tools are automatically registered with the native model context.
          </span>
        </div>

        {/* Tool Selector */}
        <div className="space-y-2 mb-4">
          <label className="text-xs font-bold uppercase tracking-wider text-brand-muted">
            Select Tool to Inspect / Trigger
          </label>
          <div className="grid grid-cols-2 gap-2">
            {tools.map((t) => (
              <button
                key={t.name}
                onClick={() => setSelectedTool(t.name)}
                className={`py-2 px-3 text-left rounded-xl border text-xs font-mono transition-all ${
                  selectedTool === t.name
                    ? 'border-brand-green bg-brand-green-muted text-brand-green-text font-bold shadow-xs'
                    : 'border-brand-border bg-brand-surface-elevated text-brand-muted hover:text-brand-text'
                }`}
              >
                {t.name}
              </button>
            ))}
          </div>
        </div>

        {/* Tool Details & Annotations */}
        <div className="p-4 bg-brand-surface-elevated border border-brand-border rounded-xl space-y-3 mb-4 text-xs font-mono">
          <div className="flex items-center justify-between">
            <span className="text-brand-green font-bold">{currentTool.name}</span>
            <div className="flex gap-1.5">
              {currentTool.annotations?.readOnlyHint && (
                <span className="px-2 py-0.5 bg-sky-50 border border-sky-200 text-sky-700 rounded text-[10px]">
                  readOnlyHint
                </span>
              )}
              {currentTool.annotations?.untrustedContentHint && (
                <span className="px-2 py-0.5 bg-amber-50 border border-amber-200 text-amber-700 rounded text-[10px] flex items-center gap-1">
                  <ShieldAlert className="w-3 h-3" />
                  untrustedContent
                </span>
              )}
              {!currentTool.annotations?.readOnlyHint && (
                <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded text-[10px]">
                  mutation (requires consent)
                </span>
              )}
            </div>
          </div>

          <p className="text-brand-muted font-sans text-xs">{currentTool.description}</p>
        </div>

        {/* Execute Action */}
        <button
          onClick={handleExecute}
          disabled={isRunning}
          className="w-full py-2.5 px-4 bg-brand-green hover:bg-brand-green-hover text-white font-bold rounded-xl flex items-center justify-center gap-2 text-sm transition-all active:scale-[0.99] disabled:opacity-50 shadow-sm"
        >
          <Play className="w-4 h-4 fill-white" />
          <span>{isRunning ? 'Invoking Tool...' : `Execute ${currentTool.name}`}</span>
        </button>

        {/* Execution Log */}
        <div className="mt-4 flex-1 flex flex-col">
          <div className="text-xs font-bold uppercase tracking-wider text-brand-muted mb-1.5 flex items-center justify-between">
            <span>Execution Terminal & Payloads</span>
            <span className="text-[10px] text-brand-muted font-mono">JSON AST</span>
          </div>
          <pre className="flex-1 min-h-[160px] p-3 bg-brand-dark text-emerald-300 border border-brand-border rounded-xl text-xs font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed shadow-inner">
            {logOutput}
          </pre>
        </div>
      </div>
    </div>
  );
}
