import { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight, RotateCw, Loader2, Monitor, X } from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import { GhostPostLogo } from '../layout/GhostPostLogo';
import { GhostButton } from '../ui/GhostButton';

export function BrowserView() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const imgRef = useRef(new Image());
  const [connected, setConnected] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [launching, setLaunching] = useState(false);
  const [error, setError] = useState('');
  const [url, setUrl] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [frameCount, setFrameCount] = useState(0);

  const launchBrowser = useCallback(() => {
    setLaunching(true);
    setError('');
    setFrameCount(0);

    const socket = io(window.location.origin, {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      timeout: 10000,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('[Browser] Socket connected:', socket.id);
      setConnected(true);
      socket.emit('browser:launch');
    });

    socket.on('connect_error', (err) => {
      console.error('[Browser] Socket connect error:', err.message);
      setError('Connection failed: ' + err.message);
      setLaunching(false);
    });

    socket.on('browser:launched', (data: any) => {
      console.log('[Browser] Launched:', data);
      setLaunching(false);
      if (!data.success) {
        setError(data.message || 'Browser launch failed');
      }
    });

    socket.on('browser:streaming', () => {
      console.log('[Browser] Streaming started');
      setStreaming(true);
    });

    socket.on('browser:frame', (data: { data: string }) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      setFrameCount(c => c + 1);
      const img = imgRef.current;
      img.onload = () => {
        if (canvas.width !== img.naturalWidth) canvas.width = img.naturalWidth;
        if (canvas.height !== img.naturalHeight) canvas.height = img.naturalHeight;
        ctx.drawImage(img, 0, 0);
      };
      img.src = 'data:image/jpeg;base64,' + data.data;
    });

    socket.on('browser:error', (data: { message: string }) => {
      console.error('[Browser] Error:', data.message);
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

  useEffect(() => {
    return () => { if (socketRef.current) socketRef.current.disconnect(); };
  }, []);

  const handleMouse = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const socket = socketRef.current;
    const canvas = canvasRef.current;
    if (!socket || !canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = Math.round((e.clientX - rect.left) * scaleX);
    const y = Math.round((e.clientY - rect.top) * scaleY);
    const types: Record<string, string> = { mousemove: 'mousemove', mousedown: 'mousedown', mouseup: 'mouseup' };
    if (types[e.type]) socket.emit('browser:mouse', { type: types[e.type], x, y, button: e.button, clickCount: 1 });
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent<HTMLCanvasElement>) => {
    const socket = socketRef.current;
    const canvas = canvasRef.current;
    if (!socket || !canvas) return;
    const rect = canvas.getBoundingClientRect();
    socket.emit('browser:mouse', { type: 'wheel', x: Math.round((e.clientX - rect.left) * (canvas.width / rect.width)), y: Math.round((e.clientY - rect.top) * (canvas.height / rect.height)), deltaX: e.deltaX, deltaY: e.deltaY });
  }, []);

  const handleKey = useCallback((e: React.KeyboardEvent<HTMLCanvasElement>) => {
    const socket = socketRef.current;
    if (!socket) return;
    e.preventDefault();
    socket.emit('browser:key', { type: e.type, key: e.key, code: e.code, keyCode: e.keyCode, altKey: e.altKey, ctrlKey: e.ctrlKey, metaKey: e.metaKey, shiftKey: e.shiftKey });
  }, []);

  const handleNav = useCallback((action: string) => {
    socketRef.current?.emit(`browser:${action}`);
  }, []);

  const handleNavigate = useCallback(() => {
    if (!urlInput.trim()) return;
    let navUrl = urlInput.trim();
    if (!navUrl.startsWith('http')) navUrl = 'https://' + navUrl;
    socketRef.current?.emit('browser:navigate', navUrl);
    setUrl(navUrl);
  }, [urlInput]);

  const handleClose = useCallback(() => {
    socketRef.current?.emit('browser:close');
    socketRef.current?.disconnect();
    socketRef.current = null;
    setStreaming(false);
    setConnected(false);
    setFrameCount(0);
  }, []);

  // Launch screen
  if (!connected && !launching) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center" style={{ maxWidth: 440 }}>
          <div className="flex justify-center mb-5">
            <div className="flex items-center justify-center" style={{ width: 56, height: 56, borderRadius: 16, background: '#383838', border: '1px solid #4a4a4a' }}>
              <Monitor size={26} strokeWidth={1.5} style={{ color: '#d4a853' }} />
            </div>
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#e5e5e5', marginBottom: 8 }}>Browser View</h2>
          <p style={{ fontSize: 13, color: '#999', lineHeight: 1.6, marginBottom: 6 }}>
            Launch a live browser to log into your social accounts. GhostPost captures your session automatically.
          </p>
          <p style={{ fontSize: 12, color: '#666', marginBottom: 20 }}>
            Supports X, Instagram, and LinkedIn.
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
          <p style={{ color: '#999', fontSize: 14 }}>Starting browser...</p>
          <p style={{ color: '#666', fontSize: 11 }}>This may take 10-15 seconds</p>
        </div>
      </div>
    );
  }

  // Live view
  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center gap-2" style={{ padding: '8px 12px', borderBottom: '1px solid #444', background: '#2a2a2a' }}>
        <div className="flex items-center gap-1">
          {[
            { icon: ChevronLeft, action: 'back' },
            { icon: ChevronRight, action: 'forward' },
            { icon: RotateCw, action: 'reload' },
          ].map(({ icon: Icon, action }) => (
            <div key={action} onClick={() => handleNav(action)} className="flex items-center justify-center cursor-pointer hover:bg-[#444] transition-colors" style={{ width: 28, height: 28, borderRadius: 6, background: '#383838' }}>
              <Icon size={13} strokeWidth={1.5} style={{ color: '#999' }} />
            </div>
          ))}
        </div>
        <div className="flex-1 flex items-center" style={{ background: '#333', borderRadius: 8, border: '1px solid #444' }}>
          <input
            type="text"
            value={urlInput}
            onChange={e => setUrlInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleNavigate()}
            placeholder="Enter URL — instagram.com, x.com, linkedin.com"
            className="flex-1 bg-transparent border-none outline-none text-[#ccc] placeholder:text-[#666]"
            style={{ padding: '6px 12px', fontSize: 12 }}
          />
          <button onClick={handleNavigate} style={{ padding: '4px 10px', fontSize: 11, color: '#d4a853', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>Go</button>
        </div>
        <div className="flex items-center gap-2">
          {streaming && <span style={{ fontSize: 10, fontWeight: 700, color: '#22c55e', background: 'rgba(34,197,94,0.1)', borderRadius: 20, padding: '3px 8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>LIVE</span>}
          {frameCount > 0 && <span style={{ fontSize: 10, color: '#666' }}>{frameCount} frames</span>}
          <div onClick={handleClose} className="flex items-center justify-center cursor-pointer hover:bg-[#444] transition-colors" style={{ width: 28, height: 28, borderRadius: 6, background: '#383838' }}>
            <X size={13} strokeWidth={1.5} style={{ color: '#999' }} />
          </div>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 relative overflow-hidden" style={{ background: '#111' }}>
        {connected && !streaming && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <Loader2 size={24} className="text-[#d4a853] animate-spin" />
            <p style={{ color: '#888', fontSize: 12 }}>Waiting for browser frames...</p>
            {error && <p style={{ color: '#f87171', fontSize: 11 }}>{error}</p>}
          </div>
        )}
        <canvas
          ref={canvasRef}
          className="w-full h-full"
          style={{ objectFit: 'contain', cursor: streaming ? 'default' : 'wait' }}
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
