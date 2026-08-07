'use client';
import { useEffect, useState } from 'react';
import { SSEEvent } from '../types';
import { getApiBaseUrl } from '../lib/api';

export function useSSE(projectId?: string) {
  const [event, setEvent] = useState<SSEEvent | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!projectId) return;

    const url = `${getApiBaseUrl()}/sse/projects/${projectId}/status`;
    const eventSource = new EventSource(url);

    eventSource.onopen = () => {
      setIsConnected(true);
    };

    eventSource.onmessage = (e) => {
      try {
        const data: SSEEvent = JSON.parse(e.data);
        setEvent(data);
      } catch (err) {
        console.error('[SSE] Error parsing event data:', err);
      }
    };

    eventSource.onerror = () => {
      setIsConnected(false);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [projectId]);

  return { event, isConnected };
}
