'use client';
import { useEffect, useState } from 'react';
import { SSEEvent } from '../types';

export function useSSE(projectId?: string) {
  const [event, setEvent] = useState<SSEEvent | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!projectId) return;

    const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/sse/projects/${projectId}/status`;
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
