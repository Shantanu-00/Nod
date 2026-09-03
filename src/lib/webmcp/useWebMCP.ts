'use client';

import { useEffect, useRef } from 'react';
import { useStore } from '@/lib/store/useStore';
import { createCanonicalWebMCPTools } from './tools';
import { registerWebMCPTools, isWebMCPSupported } from './register';

export function useWebMCP() {
  const setWebMCPStatus = useStore((state) => state.setWebMCPStatus);
  const isWebMCPAvailable = useStore((state) => state.isWebMCPAvailable);
  const registeredToolCount = useStore((state) => state.registeredToolCount);
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const supported = isWebMCPSupported();
    const tools = createCanonicalWebMCPTools();

    if (!supported) {
      setWebMCPStatus(false, tools.length);
      return;
    }

    controllerRef.current = new AbortController();
    const signal = controllerRef.current.signal;

    registerWebMCPTools(tools, signal).then((count) => {
      setWebMCPStatus(true, count);
    });

    return () => {
      if (controllerRef.current) {
        controllerRef.current.abort();
      }
    };
  }, [setWebMCPStatus]);

  return {
    isSupported: isWebMCPAvailable,
    toolCount: registeredToolCount,
    tools: createCanonicalWebMCPTools(),
  };
}
