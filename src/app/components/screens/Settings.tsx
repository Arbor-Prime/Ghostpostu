import { useState, useEffect } from 'react';
import { Save, RotateCcw, CreditCard, Pencil, Loader2, RefreshCw, Unplug } from 'lucide-react';
import { GhostButton } from '../ui/GhostButton';
import { useAuth } from '../../lib/auth-context';
import { api } from '../../lib/api';

const categories = [
  { group: 'Account', items: [{ id: 'general', label: 'General' }, { id: 'notifications', label: 'Notifications' }] },
  { group: 'AI Configuration', items: [{ id: 'voice-profile', label: 'Voice Profile' }, { id: 'personas', label: 'Personas' }, { id: 'privacy', label: 'Privacy and Data' }] },
  { group: 'System', items: [{ id: 'integrations', label: 'Integrations' }, { id: 'system-health', label: 'System Health' }, { id: 'billing', label: 'Billing' }] },
];
const services = [
  { name: 'Database', status: 'running' },
  { name: 'Redis', status: 'running' },
  { name: 'Ollama', status: 'running' },
  { name: 'Playwright', status: 'running' },
  { name: 'DM Scheduler', status: 'running' },
  { name: 'Reply Checker', status: 'running' },
];

const WARMUP_SCHEDULE = [
  { week: 'Week 1', days: '1–7', limit: 10 },
  { week: 'Week 2', days: '8–14', limit: 15 },
  { week: 'Week 3', days: '15–21', limit: 25 },
  { week: 'Week 4', days: '22–28', limit: 40 },
  { week: 'Fully Warmed', days: '29+', limit: 50 },
];

function Toggle({ enabled }: { enabled: boolean }) {
  return (
    <div className="relative cursor-pointer shrink-0" style={{ width: 38, height: 20, borderRadius: 10, background: enabled ? '#d4a853' : '#555555', transition: 'background 0.2s', boxShadow: enabled ? '0 1px 6px rgba(212,168,83,0.25)' : 'none' }}>
      <div className="absolute top-[2px] bg-white rounded-full" style={{ width: 16, height: 16, left: enabled ? 'calc(100% - 18px)' : '2px', boxShadow: '0 1px 3px rgba(0,0,0,0.3)', transition: 'left 0.2s' }} />
    </div>
  );
}

function InstagramCard() {
  const [igStatus, setIgStatus] = useState<any>(null);
  const [igLoading, setIgLoading] = useState(true);
  const [showImport, setShowImport] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const [csrfToken, setCsrfToken] = useState('');
  const [dsUserId, setDsUserId] = useState('');
  const [validating, setValidating] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchStatus = async () => {
    setIgLoading(true);
    try {
      const data = await api.get('/instagram-cookie-import/status');
      setIgStatus(data);
    } catch {
      setIgStatus(null);
    } finally {
      setIgLoading(false);
    }
  };

  useEffect(() => { fetchStatus(); }, []);

  const handleValidate = async () => {
    if (!sessionId.trim()) return;
    setValidating(true);
    setError(null);
    setSuccess(null);
    try {
      const data = await api.post('/instagram-cookie-import/validate', {
        sessionid: sessionId.trim(),
        csrftoken: csrfToken.trim() || undefined,
        ds_user_id: dsUserId.trim() || undefined,
      });
      if (data.valid) {
        setSuccess(`Connected as @${data.username || 'unknown'}. ${data.cookieCount} cookies stored.`);
        setShowImport(false);
        setSessionId('');
        setCsrfToken('');
        setDsUserId('');
        fetchStatus();
      } else {
        setError(data.error || 'Validation failed');
      }
    } catch (err: any) {
      setError(err.message || 'Validation failed');
    } finally {
      setValidating(false);
    }
  };

  const handleDisconnect = async () => {
    setDisconnecting(true);
    try {
      await api.post('/instagram-cookie-import/disconnect');
      setIgStatus(null);
      setSuccess(null);
      fetchStatus();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setDisconnecting(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', background: '#353535', color: '#e5e5e5',
    border: '1px solid #4a4a4a', borderRadius: 10, padding: '9px 14px',
    fontSize: 12, outline: 'none', boxSizing: 'border-box',
  };

  const isConnected = igStatus?.connected === true;
  const warmup = igStatus?.warmup;
  const currentWeekIdx = warmup ? Math.min(Math.floor((warmup.warmup_day || 0) / 7), 4) : -1;

  return (
    <>
      <div style={{ background: '#383838', borderRadius: 14, padding: '16px 20px', border: '1px solid #4a4a4a', marginBottom: 16 }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center" style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)', border: 'none' }}>
              <span style={{ fontSize: 15, fontWeight: 800, color: '#fff' }}>IG</span>
            </div>
            <div>
              <span className="block" style={{ fontSize: 13, fontWeight: 600, color: '#e5e5e5' }}>Instagram</span>
              {igLoading ? (
                <span style={{ fontSize: 11, color: '#777' }}>Checking...</span>
              ) : isConnected ? (
                <span style={{ fontSize: 11, color: '#22c55e' }}>Connected as @{igStatus.username || 'unknown'}</span>
              ) : (
                <span style={{ fontSize: 11, color: '#ef4444' }}>Not connected</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isConnected ? (
              <>
                <div className="w-2 h-2 rounded-full bg-[#22c55e]" style={{ boxShadow: '0 0 6px rgba(34,197,94,0.4)' }} />
                <span style={{ fontSize: 12, fontWeight: 500, color: '#22c55e' }}>Active</span>
              </>
            ) : (
              <>
                <div className="w-2 h-2 rounded-full bg-[#ef4444]" style={{ boxShadow: '0 0 6px rgba(239,68,68,0.4)' }} />
                <span style={{ fontSize: 12, fontWeight: 500, color: '#ef4444' }}>Disconnected</span>
              </>
            )}
          </div>
        </div>

        {isConnected && warmup && (
          <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid #4a4a4a' }}>
            <div className="grid grid-cols-3 gap-3">
              <div style={{ background: '#2e2e2e', borderRadius: 10, padding: '10px 14px', border: '1px solid #444' }}>
                <span style={{ fontSize: 10, color: '#999', display: 'block' }}>Warmup Day</span>
                <span style={{ fontSize: 18, fontWeight: 700, color: '#d4a853', fontFamily: 'JetBrains Mono, monospace' }}>
                  {warmup.warmup_day || 0}
                </span>
              </div>
              <div style={{ background: '#2e2e2e', borderRadius: 10, padding: '10px 14px', border: '1px solid #444' }}>
                <span style={{ fontSize: 10, color: '#999', display: 'block' }}>Daily Limit</span>
                <span style={{ fontSize: 18, fontWeight: 700, color: '#4a90d9', fontFamily: 'JetBrains Mono, monospace' }}>
                  {warmup.daily_dm_limit || 0}
                </span>
              </div>
              <div style={{ background: '#2e2e2e', borderRadius: 10, padding: '10px 14px', border: '1px solid #444' }}>
                <span style={{ fontSize: 10, color: '#999', display: 'block' }}>Sent Today</span>
                <span style={{ fontSize: 18, fontWeight: 700, color: '#22c55e', fontFamily: 'JetBrains Mono, monospace' }}>
                  {warmup.dms_sent_today || 0}
                </span>
              </div>
            </div>
          </div>
        )}

        <div style={{ marginTop: 14, display: 'flex', gap: 8 }}>
          {!isConnected || showImport ? (
            <GhostButton variant="gold" size="sm" onClick={() => setShowImport(true)}>
              Connect Instagram
            </GhostButton>
          ) : (
            <>
              <GhostButton variant="glass" size="sm"
                icon={<RefreshCw size={11} strokeWidth={1.5} />}
                onClick={() => setShowImport(true)}>
                Refresh Cookies
              </GhostButton>
              <GhostButton variant="danger" size="sm"
                icon={disconnecting ? <Loader2 size={11} style={{ animation: 'spin 1s linear infinite' }} /> : <Unplug size={11} strokeWidth={1.5} />}
                onClick={handleDisconnect} disabled={disconnecting}>
                Disconnect
              </GhostButton>
            </>
          )}
        </div>
      </div>

      {showImport && (
        <div style={{ background: '#383838', borderRadius: 14, padding: '18px 20px', border: '1px solid #d4a853', marginBottom: 16 }}>
          <h4 style={{ fontSize: 13, fontWeight: 700, color: '#e5e5e5', marginBottom: 12 }}>Import Instagram Cookies</h4>

          {error && (
            <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '8px 12px', marginBottom: 12 }}>
              <span style={{ fontSize: 11, color: '#f87171' }}>{error}</span>
            </div>
          )}
          {success && (
            <div style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 8, padding: '8px 12px', marginBottom: 12 }}>
              <span style={{ fontSize: 11, color: '#22c55e' }}>{success}</span>
            </div>
          )}

          <div style={{ background: '#2e2e2e', borderRadius: 10, padding: '12px 14px', marginBottom: 14, border: '1px solid #444' }}>
            <p style={{ fontSize: 11, color: '#aaa', lineHeight: 1.6, margin: 0 }}>
              <strong style={{ color: '#e5e5e5' }}>How to get your cookies:</strong><br />
              1. Open Instagram in Chrome and log in<br />
              2. Press F12 to open DevTools<br />
              3. Go to Application → Cookies → instagram.com<br />
              4. Copy the <strong>sessionid</strong> value (required)<br />
              5. Optionally copy <strong>csrftoken</strong> and <strong>ds_user_id</strong>
            </p>
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#ccc', marginBottom: 4 }}>
              sessionid <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input value={sessionId} onChange={(e) => setSessionId(e.target.value)}
              placeholder="Paste your sessionid cookie value here"
              style={inputStyle} onFocus={(e) => e.target.style.borderColor = '#d4a853'} onBlur={(e) => e.target.style.borderColor = '#4a4a4a'} />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#ccc', marginBottom: 4 }}>
              csrftoken <span style={{ fontSize: 10, color: '#777' }}>(recommended)</span>
            </label>
            <input value={csrfToken} onChange={(e) => setCsrfToken(e.target.value)}
              placeholder="Optional but recommended" style={inputStyle} />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#ccc', marginBottom: 4 }}>
              ds_user_id <span style={{ fontSize: 10, color: '#777' }}>(optional)</span>
            </label>
            <input value={dsUserId} onChange={(e) => setDsUserId(e.target.value)}
              placeholder="Optional" style={inputStyle} />
          </div>
          <div className="flex gap-2">
            <GhostButton variant="gold" size="md"
              icon={validating ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> : undefined}
              onClick={handleValidate} disabled={!sessionId.trim() || validating}>
              {validating ? 'Validating...' : 'Validate and Connect'}
            </GhostButton>
            <GhostButton variant="ghost" size="md" onClick={() => { setShowImport(false); setError(null); setSuccess(null); }}>
              Cancel
            </GhostButton>
          </div>
        </div>
      )}

      {isConnected && (
        <>
          <div style={{ background: '#383838', borderRadius: 14, padding: '16px 20px', border: '1px solid #4a4a4a', marginBottom: 16 }}>
            <h4 style={{ fontSize: 12, fontWeight: 700, color: '#e5e5e5', marginBottom: 12 }}>Warmup Schedule</h4>
            <div className="space-y-1.5">
              {WARMUP_SCHEDULE.map((w, i) => {
                const isCurrent = i === currentWeekIdx;
                return (
                  <div key={w.week} className="flex items-center justify-between"
                    style={{ padding: '8px 12px', borderRadius: 8,
                      background: isCurrent ? 'rgba(212,168,83,0.08)' : 'transparent',
                      border: isCurrent ? '1px solid rgba(212,168,83,0.3)' : '1px solid transparent' }}>
                    <div className="flex items-center gap-2">
                      {isCurrent && <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#d4a853', boxShadow: '0 0 6px rgba(212,168,83,0.4)' }} />}
                      <span style={{ fontSize: 12, fontWeight: isCurrent ? 700 : 400, color: isCurrent ? '#e5e5e5' : '#999' }}>
                        {w.week}
                      </span>
                      <span style={{ fontSize: 10, color: '#666' }}>Days {w.days}</span>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: isCurrent ? '#d4a853' : '#777', fontFamily: 'JetBrains Mono, monospace' }}>
                      {w.limit}/day
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {warmup?.blocks_count > 0 && (
            <div style={{ background: '#383838', borderRadius: 14, padding: '16px 20px', border: '1px solid rgba(239,68,68,0.2)', marginBottom: 16 }}>
              <h4 style={{ fontSize: 12, fontWeight: 700, color: '#ef4444', marginBottom: 8 }}>Block History</h4>
              <div className="flex items-center gap-3">
                <span style={{ fontSize: 11, color: '#999' }}>Total blocks detected:</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#ef4444', fontFamily: 'JetBrains Mono, monospace' }}>
                  {warmup.blocks_count}
                </span>
              </div>
              {warmup.last_block_at && (
                <span style={{ fontSize: 10, color: '#777', marginTop: 4, display: 'block' }}>
                  Last block: {new Date(warmup.last_block_at).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
            </div>
          )}
        </>
      )}
    </>
  );
}

export function Settings() {
  const [activeCategory, setActiveCategory] = useState('general');

  return (
    <div className="flex h-full -mx-7 -mb-7">
      <div className="w-[190px] shrink-0 py-5 px-3" style={{ borderRight: '1px solid #444444' }}>
        {categories.map((group) => (
          <div key={group.group} className="mb-5">
            <h4 className="px-3 mb-2" style={{ fontSize: 10, fontWeight: 700, color: '#999999', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{group.group}</h4>
            {group.items.map((item) => {
              const isActive = activeCategory === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => setActiveCategory(item.id)}
                  className="w-full text-left px-3 py-2 relative cursor-pointer transition-colors hover:bg-[rgba(212,168,83,0.04)]"
                  style={{ borderRadius: 8, fontSize: 12, fontWeight: isActive ? 600 : 400, background: isActive ? 'rgba(212,168,83,0.08)' : 'transparent', color: isActive ? '#e5e5e5' : '#999999' }}
                >
                  {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 bg-[#d4a853]" style={{ borderRadius: 2 }} />}
                  {item.label}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <div className="flex-1 p-7 overflow-auto">
        {activeCategory === 'general' && (
          <div className="max-w-lg">
            <h2 className="mb-6" style={{ fontSize: 18, fontWeight: 800, color: '#e5e5e5', letterSpacing: '-0.02em' }}>General</h2>
            <div className="space-y-4">
              {[{ label: 'Display Name', type: 'text', defaultValue: 'John Doe' }, { label: 'Email', type: 'email', defaultValue: 'john@example.com' }].map((f) => (
                <div key={f.label}>
                  <label className="block mb-1.5" style={{ fontSize: 11, fontWeight: 600, color: '#cccccc' }}>{f.label}</label>
                  <input type={f.type} defaultValue={f.defaultValue} className="w-full focus:outline-none text-[#e5e5e5] transition-colors" style={{ background: '#353535', border: '1px solid #4a4a4a', borderRadius: 10, padding: '9px 14px', fontSize: 12 }} onFocus={(e) => e.target.style.borderColor = '#d4a853'} onBlur={(e) => e.target.style.borderColor = '#4a4a4a'} />
                </div>
              ))}
              <div>
                <label className="block mb-1.5" style={{ fontSize: 11, fontWeight: 600, color: '#cccccc' }}>Timezone</label>
                <select className="w-full focus:outline-none text-[#e5e5e5] cursor-pointer" style={{ background: '#353535', border: '1px solid #4a4a4a', borderRadius: 10, padding: '9px 14px', fontSize: 12 }}>
                  <option>Europe/London (GMT+0)</option><option>America/New_York (EST)</option><option>America/Los_Angeles (PST)</option>
                </select>
              </div>
              <div className="flex items-center justify-between py-3">
                <div>
                  <span className="block" style={{ fontSize: 13, fontWeight: 600, color: '#e5e5e5' }}>Auto-approve low-risk replies</span>
                  <span style={{ fontSize: 12, color: '#999999' }}>Automatically post replies scored above 0.9</span>
                </div>
                <Toggle enabled={true} />
              </div>
              <GhostButton variant="gold" size="md" icon={<Save size={13} strokeWidth={1.5} />}>Save Changes</GhostButton>
            </div>
          </div>
        )}

        {activeCategory === 'system-health' && (
          <div className="max-w-lg">
            <h2 className="mb-6" style={{ fontSize: 18, fontWeight: 800, color: '#e5e5e5', letterSpacing: '-0.02em' }}>System Health</h2>
            <div style={{ background: '#383838', borderRadius: 14, overflow: 'hidden', border: '1px solid #4a4a4a' }}>
              {services.map((s, i) => (
                <div key={s.name} className="flex items-center justify-between" style={{ padding: '14px 18px', borderBottom: i !== services.length - 1 ? '1px solid #4a4a4a' : 'none' }}>
                  <span style={{ fontSize: 13, fontWeight: 500, color: '#cccccc' }}>{s.name}</span>
                  <div className="flex items-center gap-2">
                    <div className="rounded-full" style={{ width: 7, height: 7, background: s.status === 'running' ? '#22c55e' : '#ef4444', boxShadow: s.status === 'running' ? '0 0 6px rgba(34,197,94,0.4)' : '0 0 6px rgba(239,68,68,0.4)' }} />
                    <span style={{ fontSize: 12, fontWeight: 500, color: s.status === 'running' ? '#22c55e' : '#ef4444' }}>{s.status === 'running' ? 'Running' : 'Down'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeCategory === 'voice-profile' && (
          <div className="max-w-lg">
            <h2 className="mb-6" style={{ fontSize: 18, fontWeight: 800, color: '#e5e5e5', letterSpacing: '-0.02em' }}>Voice Profile</h2>
            {voiceStatus === 'loading' && (
              <p style={{ fontSize: 13, color: '#999' }}>Loading voice profile...</p>
            )}
            {voiceStatus === 'processing' && (
              <div style={{ background: '#383838', borderRadius: 14, padding: '18px 20px', marginBottom: 20, border: '1px solid #4a4a4a' }}>
                <p style={{ fontSize: 13, color: '#d4a853', marginBottom: 6 }}>Your voice is being analysed.</p>
                <p style={{ fontSize: 12, color: '#999' }}>This usually takes 30-90 seconds. Refresh shortly.</p>
              </div>
            )}
            {voiceStatus === 'not-recorded' && (
              <div style={{ background: '#383838', borderRadius: 14, padding: '18px 20px', marginBottom: 20, border: '1px solid #4a4a4a' }}>
                <p style={{ fontSize: 13, color: '#999', marginBottom: 10 }}>No voice profile yet.</p>
                <p style={{ fontSize: 12, color: '#777' }}>Complete voice onboarding to build your Voice DNA.</p>
              </div>
            )}
            {voiceStatus === 'ready' && voiceProfile && (
              <>
                <div style={{ background: '#383838', borderRadius: 14, padding: '18px 20px', marginBottom: 20, border: '1px solid #4a4a4a' }}>
                  {voiceProfile.summary_quote && (
                    <p style={{ fontSize: 13, color: '#cccccc', fontStyle: 'italic', lineHeight: 1.6, marginBottom: 14 }}>"{voiceProfile.summary_quote}"</p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {(voiceProfile.signature_words || []).slice(0, 5).map((t: string) => <span key={t} style={{ fontSize: 11, fontWeight: 600, color: '#d4a853', background: 'rgba(212,168,83,0.1)', borderRadius: 20, padding: '4px 12px' }}>{t}</span>)}
                  </div>
                </div>
                <GhostButton variant="glass" size="md" icon={<Pencil size={13} strokeWidth={1.5} />}>Edit Profile</GhostButton>
              </>
            )}
            <div className="mt-8 pt-6" style={{ borderTop: '1px solid #444444' }}>
              <h3 className="mb-2" style={{ fontSize: 14, fontWeight: 700, color: '#ef4444' }}>Danger Zone</h3>
              <p className="mb-4" style={{ fontSize: 12, color: '#999999' }}>Resetting your voice profile will delete all learned patterns and require a new recording.</p>
              <GhostButton variant="danger" size="md" icon={<RotateCcw size={13} strokeWidth={1.5} />}>Reset Voice Profile</GhostButton>
            </div>
          </div>
        )}

        {activeCategory === 'notifications' && (
          <div className="max-w-lg">
            <h2 className="mb-6" style={{ fontSize: 18, fontWeight: 800, color: '#e5e5e5', letterSpacing: '-0.02em' }}>Notifications</h2>
            {[
              { label: 'New opportunities found', desc: 'Get notified when high-relevance opportunities are detected', enabled: true },
              { label: 'Draft ready for review', desc: 'Notification when a new draft is generated', enabled: true },
              { label: 'Reply posted', desc: 'Confirmation when an approved reply is posted', enabled: false },
              { label: 'Session expired', desc: 'Alert when your X session needs renewal', enabled: true },
              { label: 'DM draft generated', desc: 'Notification when a new Instagram DM draft needs approval', enabled: true },
              { label: 'DM reply received', desc: 'Alert when a prospect replies to your DM', enabled: true },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between py-3.5" style={{ borderBottom: '1px solid #3a3a3a' }}>
                <div><span className="block" style={{ fontSize: 13, fontWeight: 600, color: '#e5e5e5' }}>{item.label}</span><span style={{ fontSize: 12, color: '#999999' }}>{item.desc}</span></div>
                <Toggle enabled={item.enabled} />
              </div>
            ))}
          </div>
        )}

        {activeCategory === 'personas' && (
          <div className="max-w-lg">
            <h2 className="mb-6" style={{ fontSize: 18, fontWeight: 800, color: '#e5e5e5', letterSpacing: '-0.02em' }}>Persona Configuration</h2>
            <p style={{ fontSize: 13, color: '#aaaaaa', lineHeight: 1.6 }}>Your 8 circadian personas are managed from the Personas screen.</p>
          </div>
        )}

        {activeCategory === 'privacy' && (
          <div className="max-w-lg">
            <h2 className="mb-6" style={{ fontSize: 18, fontWeight: 800, color: '#e5e5e5', letterSpacing: '-0.02em' }}>Privacy and Data</h2>
            {[
              { label: 'Store voice recordings', desc: 'Keep original recordings for re-analysis', enabled: false },
              { label: 'Analytics data collection', desc: 'Help improve GhostPost with anonymous usage data', enabled: true },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between py-3.5" style={{ borderBottom: '1px solid #3a3a3a' }}>
                <div><span className="block" style={{ fontSize: 13, fontWeight: 600, color: '#e5e5e5' }}>{item.label}</span><span style={{ fontSize: 12, color: '#999999' }}>{item.desc}</span></div>
                <Toggle enabled={item.enabled} />
              </div>
            ))}
          </div>
        )}

        {activeCategory === 'integrations' && (
          <div className="max-w-lg">
            <h2 className="mb-6" style={{ fontSize: 18, fontWeight: 800, color: '#e5e5e5', letterSpacing: '-0.02em' }}>Integrations</h2>

            {/* X (Twitter) card — existing */}
            <div style={{ background: '#383838', borderRadius: 14, padding: '16px 20px', border: '1px solid #4a4a4a', marginBottom: 16 }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center" style={{ width: 36, height: 36, borderRadius: 10, background: '#444444', border: '1px solid #505050' }}>
                    <span style={{ fontSize: 15, fontWeight: 800, color: '#e5e5e5' }}>𝕏</span>
                  </div>
                  <div>
                    <span className="block" style={{ fontSize: 13, fontWeight: 600, color: '#e5e5e5' }}>X (Twitter)</span>
                    <span style={{ fontSize: 11, color: '#22c55e' }}>Connected as @johndoe</span>
                  </div>
                </div>
                {connectionStatus ? (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#22c55e]" style={{ boxShadow: '0 0 6px rgba(34,197,94,0.4)' }} />
                    <span style={{ fontSize: 12, fontWeight: 500, color: '#22c55e' }}>Active</span>
                  </div>
                ) : (
                  <span style={{ fontSize: 11, fontWeight: 500, color: '#888', background: '#444', borderRadius: 20, padding: '4px 12px' }}>Set up</span>
                )}
              </div>
            </div>

            {/* Instagram card — new */}
            <InstagramCard />
          </div>
        )}

        {activeCategory === 'billing' && (
          <div className="max-w-lg">
            <h2 className="mb-6" style={{ fontSize: 18, fontWeight: 800, color: '#e5e5e5', letterSpacing: '-0.02em' }}>Billing</h2>
            <div style={{ background: '#383838', borderRadius: 14, padding: '18px 20px', border: '1px solid #4a4a4a' }}>
              <div className="flex items-center justify-between mb-3">
                <span style={{ fontSize: 13, fontWeight: 600, color: '#e5e5e5' }}>Current Plan</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#22c55e', background: 'rgba(34,197,94,0.1)', borderRadius: 20, padding: '4px 12px' }}>Beta</span>
              </div>
              <p style={{ fontSize: 12, color: '#999999' }}>You're on the free beta. Paid plans coming soon.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
