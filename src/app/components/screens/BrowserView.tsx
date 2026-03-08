import { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight, RotateCw, Loader2, Monitor, X } from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import { GhostPostLogo } from '../layout/GhostPostLogo';
import { GhostButton } from '../ui/GhostButton';

export function BrowserView() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const imgRef = useRef(new Image());
  const containerRef = useRef<HTMLDivElement>(null);

  const [connected, setConnected] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [launching, setLaunching] = useState(false);
  const [error, setError] = useState('');
  const [url, setUrl] = useState('');

  // Connect socket and launch browser
  const launchBrowser = useCallback(() => {
    setLaunching(true);
    setError('');

    const socket = io(window.location.origin, { path: '/socket.io', transports: ['websocket', 'polling'] });
    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      socket.emit('browser:launch');
    });

    socket.on('browser:launched', (data: any) => {
      setLaunching(false);
      if (data.success) {
        console.log('[Browser] Launched', data.reused ? '(reused)' : '(new)');
      }
    });

    socket.on('browser:streaming', () => {
      setStreaming(true);
    });

    socket.on('browser:frame', (data: { data: string }) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const img = imgRef.current;
      img.onload = () => {
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        ctx.drawImage(img, 0, 0);
      };
      img.src = 'data:image/jpeg;base64,' + data.data;
    });

    socket.on('browser:error', (data: { message: string }) => {
      setError(data.message);
      setLaunching(false);
    });

    socket.on('browser:closed', () => {
      setStreaming(false);
      setConnected(false);
    });

    socket.on('disconnect', () => {
      setConnected(false);
      setStreaming(false);
    });
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  // Mouse event handler
  const handleMouse = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const socket = socketRef.current;
    const canvas = canvasRef.current;
    if (!socket || !canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = Math.round((e.clientX - rect.left) * scaleX);
    const y = Math.round((e.clientY - rect.top) * scaleY);

    const eventMap: Record<string, string> = {
      mousemove: 'mousemove',
      mousedown: 'mousedown',
      mouseup: 'mouseup',
    };

    const type = eventMap[e.type];
    if (type) {
      socket.emit('browser:mouse', { type, x, y, button: e.button, clickCount: 1 });
    }
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent<HTMLCanvasElement>) => {
    const socket = socketRef.current;
    const canvas = canvasRef.current;
    if (!socket || !canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    socket.emit('browser:mouse', {
      type: 'wheel',
      x: Math.round((e.clientX - rect.left) * scaleX),
      y: Math.round((e.clientY - rect.top) * scaleY),
      deltaX: e.deltaX,
      deltaY: e.deltaY,
    });
  }, []);

  // Keyboard handler
  const handleKey = useCallback((e: React.KeyboardEvent<HTMLCanvasElement>) => {
    const socket = socketRef.current;
    if (!socket) return;
    e.preventDefault();

    socket.emit('browser:key', {
      type: e.type,
      key: e.key,
      code: e.code,
      keyCode: e.keyCode,
      altKey: e.altKey,
      ctrlKey: e.ctrlKey,
      metaKey: e.metaKey,
      shiftKey: e.shiftKey,
    });
  }, []);

  const handleNav = useCallback((action: string) => {
    const socket = socketRef.current;
    if (!socket) return;
    socket.emit(`browser:${action}`);
  }, []);

  const handleClose = useCallback(() => {
    const socket = socketRef.current;
    if (!socket) return;
    socket.emit('browser:close');
    socket.disconnect();
    socketRef.current = null;
    setStreaming(false);
    setConnected(false);
  }, []);

  // Not launched yet — show launch screen
  if (!connected && !launching) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center" style={{ maxWidth: 400 }}>
          <div className="flex justify-center mb-5">
            <div className="flex items-center justify-center" style={{ width: 56, height: 56, borderRadius: 16, background: '#383838', border: '1px solid #4a4a4a' }}>
              <Monitor size={26} strokeWidth={1.5} style={{ color: '#d4a853' }} />
            </div>
          </div>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: '#e5e5e5', marginBottom: 8 }}>Browser View</h2>
          <p style={{ fontSize: 13, color: '#999', lineHeight: 1.6, marginBottom: 20 }}>
            Launch a live browser session to log into X, Instagram, or LinkedIn. GhostPost captures your session cookies automatically.
          </p>
          {error && (
            <div className="mb-4" style={{ background: 'rgba(239,68,68,0.08)', borderRadius: 10, padding: '10px 14px', border: '1px solid rgba(239,68,68,0.15)', textAlign: 'left' }}>
              <span style={{ fontSize: 12, color: '#f87171' }}>{error}</span>
            </div>
          )}
          <GhostButton variant="gold" size="lg" onClick={launchBrowser} icon={<Monitor size={15} strokeWidth={2} />}>
            Launch Browser
          </GhostButton>
        </div>
      </div>
    );
  }

  // Launching
  if (launching) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={32} className="text-[#d4a853] animate-spin" />
          <p style={{ color: '#999', fontSize: 14 }}>Starting browser session...</p>
        </div>
      </div>
    );
  }

  // Live browser view
  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between" style={{ padding: '8px 16px', borderBottom: '1px solid #444' }}>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            {[
              { icon: ChevronLeft, action: 'back' },
              { icon: ChevronRight, action: 'forward' },
              { icon: RotateCw, action: 'reload' },
            ].map(({ icon: Icon, action }) => (
              <div key={action} onClick={() => handleNav(action)} className="flex items-center justify-center cursor-pointer hover:bg-[#555] transition-colors" style={{ width: 28, height: 28, borderRadius: 6, background: '#444', border: '1px solid #555' }}>
                <Icon size={13} strokeWidth={1.5} style={{ color: '#999' }} />
              </div>
            ))}
          </div>
          <div style={{ background: '#3a3a3a', border: '1px solid #4a4a4a', borderRadius: 6, padding: '4px 12px', minWidth: 200 }}>
            <span style={{ fontSize: 11, color: '#999' }}>{url || 'x.com'}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {streaming && (
            <span style={{ fontSize: 10, fontWeight: 700, color: '#22c55e', background: 'rgba(34,197,94,0.1)', borderRadius: 20, padding: '3px 8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>LIVE</span>
          )}
          <div onClick={handleClose} className="flex items-center justify-center cursor-pointer hover:bg-[#555] transition-colors" style={{ width: 28, height: 28, borderRadius: 6, background: '#444', border: '1px solid #555' }}>
            <X size={13} strokeWidth={1.5} style={{ color: '#999' }} />
          </div>
        </div>
      </div>

      {/* Canvas */}
      <div ref={containerRef} className="flex-1 relative overflow-hidden" style={{ background: '#1a1a1a' }}>
        {!streaming ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 size={24} className="text-[#d4a853] animate-spin" />
          </div>
        ) : null}
        <canvas
          ref={canvasRef}
          className="w-full h-full"
          style={{ objectFit: 'contain', cursor: 'default' }}
          tabIndex={0}
          onMouseMove={handleMouse}
          onMouseDown={handleMouse}
          onMouseUp={handleMouse}
          onWheel={handleWheel}
          onKeyDown={handleKey}
          onKeyUp={handleKey}
        />
      </div>
    </div>
  );
}
