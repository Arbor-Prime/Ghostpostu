import { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight, RotateCw, X, Monitor, Loader2, ExternalLink, Paperclip, Check } from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import { GhostPostLogo } from '../layout/GhostPostLogo';
import { GhostButton } from '../ui/GhostButton';
import { useAuth } from '../../lib/auth-context';

interface LogEntry {
  icon?: string;
  text: string;
  type: 'action' | 'status' | 'success' | 'error' | 'thinking';
  time: string;
}

export function BrowserView() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const imgRef = useRef(new Image());
  const { user } = useAuth();

  const [connected, setConnected] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [launching, setLaunching] = useState(false);
  const [error, setError] = useState('');
  const [currentUrl, setCurrentUrl] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [activityLog, setActivityLog] = useState<LogEntry[]>([]);
  const [frameCount, setFrameCount] = useState(0);
  const [chatInput, setChatInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [panelWidth, setPanelWidth] = useState(360);
  const isDragging = useRef(false);

  const addLog = useCallback((entry: Omit<LogEntry, 'time'>) => {
    setActivityLog(prev => [...prev, { ...entry, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) }]);
  }, []);

  const launchBrowser = useCallback(() => {
    setLaunching(true);
    setError('');
    addLog({ text: 'Starting GhostPost Computer...', type: 'action', icon: '⚡' });

    const socket = io(window.location.origin, { path: '/socket.io', transports: ['websocket', 'polling'] });
    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      socket.emit('browser:launch');
    });

    socket.on('browser:launched', (data: any) => {
      setLaunching(false);
      if (data.success && !data.reused) {
        addLog({ text: 'Browser launched', type: 'success', icon: '✓' });
      }
    });

    socket.on('browser:streaming', () => {
      if (!streaming) {
        setStreaming(true);
        addLog({ text: 'Streaming', type: 'status', icon: '●' });
      }
    });

    socket.on('browser:frame', (data: { data: string }) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const img = imgRef.current;
      img.onload = () => {
        if (canvas.width !== img.naturalWidth || canvas.height !== img.naturalHeight) {
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
        }
        ctx.drawImage(img, 0, 0);
      };
      img.src = 'data:image/jpeg;base64,' + data.data;
      setFrameCount(c => c + 1);
    });

    socket.on('browser:cookies-captured', (data: any) => {
      addLog({ text: `Session cookies captured (${data.count} cookies)`, type: 'success', icon: '🔑' });
    });

    socket.on('browser:error', (data: { message: string }) => {
      setError(data.message);
      setLaunching(false);
      addLog({ text: data.message, type: 'error' });
    });

    socket.on('chat:response', (data: { response: string; browserAction?: any }) => {
      setIsThinking(false);
      addLog({ text: data.response, type: 'status', icon: '🤖' });
    });

    socket.on('chat:thinking', (data: { active: boolean }) => {
      setIsThinking(data.active);
    });

    socket.on('browser:closed', () => {
      setStreaming(false);
      setConnected(false);
      addLog({ text: 'Browser session closed', type: 'status' });
    });

    socket.on('disconnect', () => {
      setConnected(false);
      setStreaming(false);
    });
  }, [addLog]);

  useEffect(() => {
    return () => { if (socketRef.current) socketRef.current.disconnect(); };
  }, []);

  // Mouse + keyboard handlers
  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: Math.round((e.clientX - rect.left) * (canvas.width / rect.width)),
      y: Math.round((e.clientY - rect.top) * (canvas.height / rect.height)),
    };
  };

  const handleMouse = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const socket = socketRef.current;
    if (!socket) return;
    const { x, y } = getCanvasCoords(e);
    const typeMap: Record<string, string> = { mousemove: 'mousemove', mousedown: 'mousedown', mouseup: 'mouseup' };
    if (typeMap[e.type]) socket.emit('browser:mouse', { type: typeMap[e.type], x, y, button: e.button, clickCount: 1 });
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent<HTMLCanvasElement>) => {
    const socket = socketRef.current;
    if (!socket) return;
    const { x, y } = getCanvasCoords(e as any);
    socket.emit('browser:mouse', { type: 'wheel', x, y, deltaX: e.deltaX, deltaY: e.deltaY });
  }, []);

  const handleKey = useCallback((e: React.KeyboardEvent<HTMLCanvasElement>) => {
    const socket = socketRef.current;
    if (!socket) return;
    e.preventDefault();
    socket.emit('browser:key', { type: e.type, key: e.key, code: e.code, keyCode: e.keyCode, altKey: e.altKey, ctrlKey: e.ctrlKey, metaKey: e.metaKey, shiftKey: e.shiftKey });
  }, []);

  const handleNav = (action: string) => {
    const socket = socketRef.current;
    if (!socket) return;
    socket.emit(`browser:${action}`);
    addLog({ text: action === 'back' ? 'Navigating back' : action === 'forward' ? 'Navigating forward' : 'Reloading page', type: 'action' });
  };

  const handleNavigateUrl = () => {
    const socket = socketRef.current;
    if (!socket || !urlInput.trim()) return;
    let url = urlInput.trim();
    if (!url.startsWith('http')) url = 'https://' + url;
    socket.emit('browser:navigate', url);
    setUrlInput('');
    addLog({ text: `Navigating to ${url}`, type: 'action', icon: '◎' });
  };

  const handleClose = () => {
    const socket = socketRef.current;
    if (!socket) return;
    socket.emit('browser:close');
    socket.disconnect();
    socketRef.current = null;
    setStreaming(false);
    setConnected(false);
  };

  const handleChatSend = () => {
    const socket = socketRef.current;
    if (!socket || !chatInput.trim() || !user?.id) return;
    const msg = chatInput.trim();
    addLog({ text: msg, type: 'action', icon: '💬' });
    socket.emit('chat:message', { message: msg, userId: user.id });
    setChatInput('');
  };

  const handleDragStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isDragging.current = true;
    const startX = e.clientX;
    const startWidth = panelWidth;

    const onMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      const newWidth = Math.max(240, Math.min(600, startWidth + (e.clientX - startX)));
      setPanelWidth(newWidth);
    };

    const onUp = () => {
      isDragging.current = false;
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }, [panelWidth]);

  // Not launched — show launch screen
  if (!connected && !launching) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center" style={{ maxWidth: 420 }}>
          <div className="flex justify-center mb-5">
            <div className="flex items-center justify-center" style={{ width: 56, height: 56, borderRadius: 16, background: '#383838', border: '1px solid #4a4a4a' }}>
              <Monitor size={26} strokeWidth={1.5} style={{ color: '#d4a853' }} />
            </div>
          </div>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: '#e5e5e5', marginBottom: 8 }}>GhostPost Computer</h2>
          <p style={{ fontSize: 13, color: '#999', lineHeight: 1.6, marginBottom: 6 }}>
            Launch a live browser to log into X, Instagram, or LinkedIn. GhostPost captures your session automatically.
          </p>
          <p style={{ fontSize: 11, color: '#666', marginBottom: 20 }}>
            Your credentials stay in the browser — we only store session cookies.
          </p>
          {error && (
            <div className="mb-4" style={{ background: 'rgba(239,68,68,0.08)', borderRadius: 10, padding: '10px 14px', border: '1px solid rgba(239,68,68,0.15)', textAlign: 'left' }}>
              <span style={{ fontSize: 12, color: '#f87171' }}>{error}</span>
            </div>
          )}
          <GhostButton variant="gold" size="lg" onClick={launchBrowser} icon={<Monitor size={15} strokeWidth={2} />}>
            Launch GhostPost Computer
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
          <p style={{ color: '#999', fontSize: 14 }}>Starting GhostPost Computer...</p>
        </div>
      </div>
    );
  }

  // Live split-screen view
  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 flex min-h-0">

        {/* LEFT: Activity Log */}
        <div className="flex flex-col min-h-0 shrink-0" style={{ width: panelWidth, borderRight: '1px solid #444' }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid #444' }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: '#e5e5e5' }}>GhostPost Computer</h3>
            <p style={{ fontSize: 11, color: '#888', marginTop: 2 }}>Activity log</p>
          </div>

          <div className="flex-1 overflow-auto" style={{ padding: '12px 16px' }}>
            <div className="space-y-3">
              {activityLog.map((entry, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  {(entry.type === 'action' || entry.type === 'success' || entry.type === 'error') && (
                    <div className="flex items-center justify-center shrink-0 mt-0.5" style={{
                      width: 22, height: 22, borderRadius: 6,
                      background: entry.type === 'success' ? 'rgba(34,197,94,0.12)' : entry.type === 'error' ? 'rgba(239,68,68,0.12)' : '#444',
                      border: entry.type === 'success' ? '1px solid rgba(34,197,94,0.2)' : entry.type === 'error' ? '1px solid rgba(239,68,68,0.2)' : '1px solid #555',
                    }}>
                      {entry.type === 'success' ? <Check size={10} strokeWidth={2.5} className="text-[#22c55e]" /> :
                       entry.icon ? <span style={{ fontSize: 10 }}>{entry.icon}</span> : null}
                    </div>
                  )}
                  <div style={{ marginLeft: entry.type === 'status' ? 30 : 0, flex: 1 }}>
                    <span style={{
                      fontSize: 13,
                      color: entry.type === 'success' ? '#22c55e' : entry.type === 'error' ? '#f87171' : entry.type === 'action' ? '#e5e5e5' : '#cccccc',
                      fontWeight: entry.type === 'action' ? 600 : 400,
                      lineHeight: 1.55,
                      display: 'block',
                    }}>{entry.text}</span>
                  </div>
                </div>
              ))}
              {streaming && (
                <div className="flex items-center gap-2 pt-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse" />
                  <span style={{ fontSize: 11, color: '#22c55e', fontWeight: 500 }}>Streaming</span>
                </div>
              )}
            </div>
          </div>

          {/* Message input */}
          <div style={{ padding: '10px 16px', borderTop: '1px solid #444' }}>
            <div className="flex items-center gap-2" style={{ background: '#383838', borderRadius: 8, padding: '8px 12px', border: '1px solid #4a4a4a' }}>
              <input
                type="text"
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleChatSend()}
                placeholder={isThinking ? 'Thinking...' : 'Ask GhostPost — "find cafes in Nottingham"'}
                disabled={isThinking}
                className="flex-1 bg-transparent border-none outline-none placeholder:text-[#666] text-[#e5e5e5]"
                style={{ fontSize: 12 }}
              />
              {chatInput.trim() && (
                <div onClick={handleChatSend} className="flex items-center justify-center cursor-pointer" style={{ width: 24, height: 24, borderRadius: 6, background: '#d4a853' }}>
                  <Check size={12} strokeWidth={2.5} style={{ color: '#1a1a1a' }} />
                </div>
              )}
            </div>
            {isThinking && (
              <div className="flex items-center gap-2 mt-2 ml-1">
                <Loader2 size={11} className="text-[#d4a853] animate-spin" />
                <span style={{ fontSize: 10, color: '#d4a853' }}>GhostPost is thinking...</span>
              </div>
            )}
          </div>
        </div>

        {/* DRAG HANDLE */}
        <div
          onMouseDown={handleDragStart}
          className="shrink-0 flex items-center justify-center cursor-col-resize hover:bg-[rgba(212,168,83,0.1)] transition-colors"
          style={{ width: 8, background: 'transparent' }}
        >
          <div style={{ width: 3, height: 40, borderRadius: 2, background: '#555' }} />
        </div>

        {/* RIGHT: Browser */}
        <div className="flex-1 flex flex-col min-h-0" style={{ background: '#2a2a2a' }}>
          {/* Browser header */}
          <div className="flex items-center justify-between" style={{ padding: '10px 16px', borderBottom: '1px solid #444' }}>
            <div className="flex items-center gap-2.5">
              <GhostPostLogo size={16} />
              <div>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#e5e5e5' }}>GhostPost's Computer</span>
                <span className="block" style={{ fontSize: 10, color: streaming ? '#22c55e' : '#888' }}>
                  {streaming ? 'Live — streaming browser' : 'Connecting...'}
                </span>
              </div>
            </div>
            <GhostButton variant="glass" size="sm" icon={<ExternalLink size={11} strokeWidth={1.5} />}>
              Take Control
            </GhostButton>
          </div>

          {/* URL bar + nav */}
          <div className="flex items-center gap-2" style={{ padding: '6px 16px', borderBottom: '1px solid #444' }}>
            <div className="flex items-center gap-1">
              {[
                { icon: ChevronLeft, action: 'back' },
                { icon: ChevronRight, action: 'forward' },
                { icon: RotateCw, action: 'reload' },
              ].map(({ icon: Icon, action }) => (
                <div key={action} onClick={() => handleNav(action)} className="flex items-center justify-center cursor-pointer hover:bg-[#555] transition-colors" style={{ width: 24, height: 24, borderRadius: 5, background: '#444', border: '1px solid #555' }}>
                  <Icon size={12} strokeWidth={1.5} style={{ color: '#999' }} />
                </div>
              ))}
            </div>
            <div className="flex-1 flex items-center" style={{ background: '#444', border: '1px solid #555', borderRadius: 5, padding: '4px 10px' }}>
              <input
                type="text"
                value={urlInput}
                onChange={e => setUrlInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleNavigateUrl()}
                placeholder={currentUrl || 'Enter URL — x.com, instagram.com, linkedin.com'}
                className="flex-1 bg-transparent border-none outline-none placeholder:text-[#777] text-[#ccc]"
                style={{ fontSize: 11 }}
              />
            </div>
            <div onClick={handleClose} className="flex items-center justify-center cursor-pointer hover:bg-[#555] transition-colors" style={{ width: 24, height: 24, borderRadius: 5, background: '#444', border: '1px solid #555' }}>
              <X size={12} strokeWidth={1.5} style={{ color: '#999' }} />
            </div>
          </div>

          {/* Canvas viewport */}
          <div className="flex-1 relative overflow-hidden" style={{ background: '#1a1a1a' }}>
            {!streaming && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 size={24} className="text-[#d4a853] animate-spin" />
                  <span style={{ fontSize: 12, color: '#888' }}>Waiting for screen...</span>
                </div>
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
      </div>

      {/* Bottom status bar */}
      <div className="flex items-center justify-between" style={{ padding: '8px 16px', borderTop: '1px solid #444' }}>
        <div className="flex items-center gap-2.5">
          <div className="w-2 h-2 rounded-full" style={{ background: streaming ? '#22c55e' : connected ? '#d4a853' : '#ef4444' }} />
          <span style={{ fontSize: 11, color: '#aaa' }}>
            {streaming ? 'GhostPost Computer is active' : connected ? 'Connecting...' : 'Disconnected'}
          </span>
        </div>
        {streaming && (
          <span style={{ fontSize: 10, fontWeight: 700, color: '#22c55e', background: 'rgba(34,197,94,0.1)', borderRadius: 20, padding: '3px 8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>LIVE</span>
        )}
      </div>
    </div>
  );
}
