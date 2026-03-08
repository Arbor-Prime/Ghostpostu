import { useState, useEffect } from 'react';
import { useAuth } from '../../lib/auth-context';
import { api } from '../../lib/api';
import { Save, RotateCcw, CreditCard, Pencil } from 'lucide-react';
import { GhostButton } from '../ui/GhostButton';

const categories = [
  { group: 'Account', items: [{ id: 'general', label: 'General' }, { id: 'notifications', label: 'Notifications' }] },
  { group: 'AI Configuration', items: [{ id: 'voice-profile', label: 'Voice Profile' }, { id: 'personas', label: 'Personas' }, { id: 'privacy', label: 'Privacy and Data' }] },
  { group: 'System', items: [{ id: 'integrations', label: 'Integrations' }, { id: 'system-health', label: 'System Health' }, { id: 'billing', label: 'Billing' }] },
];
const services = [{ name: 'Database', status: 'running' }, { name: 'Redis', status: 'running' }, { name: 'Ollama', status: 'running' }, { name: 'Playwright', status: 'down' }];

function Toggle({ enabled }: { enabled: boolean }) {
  return (
    <div className="relative cursor-pointer shrink-0" style={{ width: 38, height: 20, borderRadius: 10, background: enabled ? '#d4a853' : '#555555', transition: 'background 0.2s', boxShadow: enabled ? '0 1px 6px rgba(212,168,83,0.25)' : 'none' }}>
      <div className="absolute top-[2px] bg-white rounded-full" style={{ width: 16, height: 16, left: enabled ? 'calc(100% - 18px)' : '2px', boxShadow: '0 1px 3px rgba(0,0,0,0.3)', transition: 'left 0.2s' }} />
    </div>
  );
}

export function Settings() {
  const [activeCategory, setActiveCategory] = useState('general');
  const { user } = useAuth();
  const [healthData, setHealthData] = useState<any>(null);
  const [connectionStatus, setConnectionStatus] = useState<any>(null);

  useEffect(() => {
    if (activeCategory === 'system-health') {
      api.get('/health').then(setHealthData).catch(() => {});
    }
    if (activeCategory === 'integrations') {
      api.get('/cookie-import/status').then(setConnectionStatus).catch(() => {});
    }
  }, [activeCategory]);

  const healthServices = healthData ? [
    { name: 'Database', status: healthData.services?.database === 'connected' ? 'running' : 'down' },
    { name: 'Redis', status: healthData.services?.redis === 'connected' ? 'running' : 'down' },
    { name: 'Ollama', status: healthData.services?.ollama?.includes('running') ? 'running' : 'down' },
    { name: 'Playwright', status: healthData.services?.playwright === 'available' ? 'running' : 'down' },
  ] : services;

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
              {[{ label: 'Display Name', type: 'text', defaultValue: user?.name || '' }, { label: 'Email', type: 'email', defaultValue: user?.email || '' }].map((f) => (
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
              {healthServices.map((s, i) => (
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
            <div style={{ background: '#383838', borderRadius: 14, padding: '18px 20px', marginBottom: 20, border: '1px solid #4a4a4a' }}>
              <p style={{ fontSize: 13, color: '#cccccc', fontStyle: 'italic', lineHeight: 1.6, marginBottom: 14 }}>"Casual, warm, direct communicator with a preference for short sentences and occasional humour."</p>
              <div className="flex gap-2">
                {['Casual', 'Direct', 'Witty'].map((t) => <span key={t} style={{ fontSize: 11, fontWeight: 600, color: '#d4a853', background: 'rgba(212,168,83,0.1)', borderRadius: 20, padding: '4px 12px' }}>{t}</span>)}
              </div>
            </div>
            <GhostButton variant="glass" size="md" icon={<Pencil size={13} strokeWidth={1.5} />}>Edit Profile</GhostButton>
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
            <div style={{ background: '#383838', borderRadius: 14, padding: '16px 20px', border: '1px solid #4a4a4a' }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center" style={{ width: 36, height: 36, borderRadius: 10, background: '#444444', border: '1px solid #505050' }}>
                    <span style={{ fontSize: 15, fontWeight: 800, color: '#e5e5e5' }}>𝕏</span>
                  </div>
                  <div>
                    <span className="block" style={{ fontSize: 13, fontWeight: 600, color: '#e5e5e5' }}>X (Twitter)</span>
                    <span style={{ fontSize: 11, color: '#22c55e' }}>Connected as @{connectionStatus?.username || 'unknown'}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#22c55e]" style={{ boxShadow: '0 0 6px rgba(34,197,94,0.4)' }} />
                  <span style={{ fontSize: 12, fontWeight: 500, color: '#22c55e' }}>Active</span>
                </div>
              </div>
            </div>
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
