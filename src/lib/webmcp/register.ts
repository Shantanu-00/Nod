import { WebMCPToolDefinition } from './tools';

export async function registerWebMCPTools(
  tools: WebMCPToolDefinition[],
  signal?: AbortSignal
): Promise<number> {
  if (typeof window === 'undefined') return 0;

  // Feature detection per WebMCP standard
  // @ts-ignore
  const modelContext = document.modelContext ?? navigator.modelContext;

  if (!modelContext || typeof modelContext.registerTool !== 'function') {
    return 0;
  }

  let registeredCount = 0;

  for (const tool of tools) {
    if (signal?.aborted) break;

    try {
      await modelContext.registerTool(
        {
          name: tool.name,
          description: tool.description,
          inputSchema: tool.inputSchema,
          annotations: tool.annotations,
          execute: tool.execute,
        },
        signal ? { signal } : undefined
      );
      registeredCount++;
    } catch (err) {
      console.warn(`[WebMCP] Could not register tool "${tool.name}":`, err);
    }
  }

  return registeredCount;
}

export function isWebMCPSupported(): boolean {
  if (typeof window === 'undefined') return false;
  // @ts-ignore
  const modelContext = document.modelContext ?? navigator.modelContext;
  return Boolean(modelContext && typeof modelContext.registerTool === 'function');
}
