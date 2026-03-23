import { useEffect, useRef, useCallback, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export interface DMEvent {
  type: 'draft_generated' | 'approved' | 'sent' | 'send_failed' | 'reply_received' | 'state_changed';
  conversationId: number;
  messageId?: number;
  oldState?: string;
  newState?: string;
  error?: string;
  timestamp: string;
}

export function useDMSocket(onEvent?: (event: DMEvent) => void) {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const socket = io(window.location.origin, {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
    });
    socketRef.current = socket;

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));

    const handle = (type: DMEvent['type']) => (data: any) => {
      const event: DMEvent = { type, ...data, timestamp: new Date().toISOString() };
      if (type === 'draft_generated') setPendingCount(c => c + 1);
      if (type === 'approved') setPendingCount(c => Math.max(0, c - 1));
      onEvent?.(event);
    };

    socket.on('dm:draft_generated', handle('draft_generated'));
    socket.on('dm:approved', handle('approved'));
    socket.on('dm:sent', handle('sent'));
    socket.on('dm:send_failed', handle('send_failed'));
    socket.on('dm:reply_received', handle('reply_received'));
    socket.on('dm:state_changed', handle('state_changed'));

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  const resetPending = useCallback(() => setPendingCount(0), []);

  return { connected, pendingCount, resetPending };
}
