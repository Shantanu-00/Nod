'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useStore } from '@/lib/store/useStore';
import { getViewScopedTools, createCanonicalWebMCPTools } from './tools';
import { registerWebMCPTools, isWebMCPSupported } from './register';

export function useWebMCP() {
  const pathname = usePathname() || '/';
  const setWebMCPStatus = useStore((state) => state.setWebMCPStatus);
  const isWebMCPAvailable = useStore((state) => state.isWebMCPAvailable);
  const registeredToolCount = useStore((state) => state.registeredToolCount);
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const supported = isWebMCPSupported();
    const activeTools = getViewScopedTools(pathname);

    if (!supported) {
      setWebMCPStatus(false, activeTools.length);
      return;
    }

    // Abort previous route's registered tools before mounting the new view scope
    if (controllerRef.current) {
      controllerRef.current.abort();
    }

    controllerRef.current = new AbortController();
    const signal = controllerRef.current.signal;

    registerWebMCPTools(activeTools, signal).then((count) => {
      setWebMCPStatus(true, count);
    });

    return () => {
      if (controllerRef.current) {
        controllerRef.current.abort();
      }
    };
  }, [pathname, setWebMCPStatus]);

  return {
    isSupported: isWebMCPAvailable,
    toolCount: registeredToolCount,
    tools: createCanonicalWebMCPTools(),
    activeScopedTools: getViewScopedTools(pathname),
  };
}
