import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Info, Link2 } from 'lucide-react';
import { GhostPostLogo } from '../layout/GhostPostLogo';
import { GhostButton } from '../ui/GhostButton';

export function XAuth() {
  const navigate = useNavigate();
  const [authToken, setAuthToken] = useState('');
  const [ct0, setCt0] = useState('');
  const [connected, setConnected] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center p-8" style={{ background: '#2b2b2b' }}>
      <div className="w-full max-w-[420px]" style={{ background: '#333333', borderRadius: 24, padding: '40px 36px', border: '1px solid #444444' }}>
        <div className="flex items-center gap-2.5 mb-10 justify-center">
          <GhostPostLogo size={22} />
          <span style={{ fontWeight: 700, fontSize: 15, color: '#e5e5e5' }}>GhostPost</span>
        </div>
        <div className="flex justify-center mb-6">
          <div className="flex items-center justify-center" style={{ width: 52, height: 52, borderRadius: 14, background: '#3a3a3a', border: '1px solid #505050' }}>
            <span style={{ fontSize: 22, fontWeight: 800, color: '#e5e5e5' }}>𝕏</span>
          </div>
        </div>
        <h1 className="text-center mb-1.5" style={{ fontSize: 20, fontWeight: 800, color: '#e5e5e5', letterSpacing: '-0.02em' }}>Connect your X account</h1>
        <p className="text-center mb-7" style={{ fontSize: 13, color: '#aaaaaa' }}>GhostPost needs your session cookies to interact with X on your behalf.</p>

        <div className="space-y-3 mb-5">
          {[{ label: 'auth_token', value: authToken, set: setAuthToken, ph: 'Paste your auth_token cookie' }, { label: 'ct0', value: ct0, set: setCt0, ph: 'Paste your ct0 cookie' }].map((f) => (
            <div key={f.label}>
              <label style={{ fontSize: 11, fontWeight: 600, color: '#cccccc' }} className="block mb-1.5">{f.label}</label>
              <input type="text" value={f.value} onChange={(e) => f.set(e.target.value)} placeholder={f.ph}
                className="w-full placeholder:text-[#777777] text-[#e5e5e5] focus:outline-none transition-colors"
                style={{ background: '#3a3a3a', border: '1px solid #4a4a4a', borderRadius: 10, padding: '10px 14px', fontSize: 12 }}
                onFocus={(e) => e.target.style.borderColor = '#d4a853'} onBlur={(e) => e.target.style.borderColor = '#4a4a4a'} />
            </div>
          ))}
        </div>

        {connected && (
          <div className="flex items-center gap-2 mb-5" style={{ background: 'rgba(34,197,94,0.08)', borderRadius: 10, padding: '10px 14px', border: '1px solid rgba(34,197,94,0.15)' }}>
            <div className="w-2 h-2 rounded-full bg-[#22c55e]" style={{ boxShadow: '0 0 6px rgba(34,197,94,0.4)' }} />
            <span style={{ fontSize: 12, fontWeight: 500, color: '#22c55e' }}>Connected as @johndoe</span>
          </div>
        )}

        <GhostButton
          variant="gold"
          size="xl"
          fullWidth
          onClick={() => { setConnected(true); setTimeout(() => navigate('/dashboard'), 1500); }}
          icon={<Link2 size={15} strokeWidth={2} />}
        >
          Connect
        </GhostButton>

        <div className="flex gap-3 mt-5" style={{ background: '#3a3a3a', borderRadius: 12, padding: '14px 16px', border: '1px solid #4a4a4a' }}>
          <div className="flex items-center justify-center shrink-0" style={{ width: 26, height: 26, borderRadius: 7, background: '#444444', border: '1px solid #505050' }}>
            <Info size={13} strokeWidth={1.5} className="text-[#999999]" />
          </div>
          <p style={{ fontSize: 11, color: '#aaaaaa', lineHeight: 1.55 }}>
            Open X in your browser, press F12 for Developer Tools, go to Application → Cookies → x.com, and copy <strong style={{ color: '#cccccc' }}>auth_token</strong> and <strong style={{ color: '#cccccc' }}>ct0</strong>.
          </p>
        </div>
      </div>
    </div>
  );
}
