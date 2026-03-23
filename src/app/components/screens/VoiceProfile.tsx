import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { ArrowRight, SlidersHorizontal, Loader2 } from 'lucide-react';
import { GhostPostLogo } from '../layout/GhostPostLogo';
import { GhostButton } from '../ui/GhostButton';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/auth-context';

export function VoiceProfile() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [status, setStatus] = useState<string>('loading');
  const [error, setError] = useState('');
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchProfile = async () => {
    if (!user) return;
    try {
      const data = await api.get('/voice/profile');
      const vp = data.voice_profile;
      const st = data.voice_onboarding_status;
      if (st === 'processing') { setStatus('processing'); return; }
      if (!vp || st === 'pending') { setStatus('not-recorded'); return; }
      setProfile(vp);
      setStatus('ready');
      if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
    } catch (err: any) { setError(err.message); setStatus('error'); }
  };

  useEffect(() => {
    fetchProfile();
    pollRef.current = setInterval(fetchProfile, 5000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [user]);

  const handleConfirm = () => navigate('/onboarding/persona-schedule');

  // Loading / processing / error / not-recorded states
  if (status === 'loading' || status === 'processing') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#2b2b2b' }}>
        <div className="flex flex-col items-center gap-4 text-center" style={{ maxWidth: 360 }}>
          <Loader2 size={32} className="text-[#d4a853] animate-spin" />
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#e5e5e5' }}>{status === 'processing' ? 'Analysing Your Voice' : 'Loading...'}</h2>
          {status === 'processing' && <p style={{ color: '#999', fontSize: 13 }}>Transcribing and extracting patterns. 30-90 seconds.</p>}
        </div>
      </div>
    );
  }
  if (status === 'not-recorded') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#2b2b2b' }}>
        <div className="text-center" style={{ maxWidth: 400 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#e5e5e5', marginBottom: 12 }}>No Recording Found</h2>
          <p style={{ fontSize: 13, color: '#999', marginBottom: 20 }}>Go back and record at least 60 seconds.</p>
          <GhostButton variant="gold" size="md" onClick={() => navigate('/onboarding/recording')}>Record Now</GhostButton>
        </div>
      </div>
    );
  }
  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#2b2b2b' }}>
        <div className="text-center" style={{ maxWidth: 400 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#e5e5e5', marginBottom: 12 }}>Something Went Wrong</h2>
          <p style={{ fontSize: 13, color: '#999', marginBottom: 20 }}>{error}</p>
          <GhostButton variant="gold" size="md" onClick={() => { setStatus('loading'); fetchProfile(); }}>Try Again</GhostButton>
        </div>
      </div>
    );
  }

  const vp = profile || {};
  const formality = Math.round((vp.formality || 0.5) * 100);
  const directness = Math.round((vp.directness || 0.5) * 100);
  const expressiveness = Math.round((vp.expressiveness || 0.5) * 100);
  const signatureWords: string[] = vp.signature_words || [];
  const antiWords: string[] = vp.anti_words || [];
  const topics: string[] = [...(vp.primary_topics || []), ...(vp.secondary_topics || [])];
  const emotionalRange: Record<string, number> = vp.emotional_range || {};
  const formatPrefs: Record<string, string> = vp.format_prefs || {};
  const summaryQuote: string = vp.summary_quote || '';

  const Slider = ({ label, labelRight, value }: { label: string; labelRight: string; value: number }) => (
    <div className="mb-2.5">
      <div className="flex justify-between mb-0.5">
        <span style={{ fontSize: 9, color: '#888' }}>{label}</span>
        <span style={{ fontSize: 9, color: '#888' }}>{labelRight}</span>
      </div>
      <div style={{ height: 5, background: '#555', borderRadius: 3, position: 'relative' }}>
        <div style={{ height: '100%', width: `${value}%`, background: '#d4a853', borderRadius: 3 }} />
        <div style={{ position: 'absolute', top: -3, left: `${value}%`, transform: 'translateX(-50%)', width: 11, height: 11, borderRadius: '50%', background: '#d4a853', border: '2px solid #333' }} />
      </div>
    </div>
  );

  const Card = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div style={{ background: '#3a3a3a', borderRadius: 12, padding: '12px 14px' }}>
      <h3 style={{ fontSize: 12, fontWeight: 700, color: '#e5e5e5', marginBottom: 8 }}>{title}</h3>
      {children}
    </div>
  );

  const Pills = ({ items, color = '#ccc', bg = '#4a4a4a', strike = false }: { items: string[]; color?: string; bg?: string; strike?: boolean }) => (
    <div className="flex flex-wrap gap-1.5">
      {items.map(w => <span key={w} style={{ padding: '2px 9px', borderRadius: 14, fontSize: 10, fontWeight: 500, background: bg, color, textDecoration: strike ? 'line-through' : 'none' }}>{w}</span>)}
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: '#2b2b2b' }}>
      <div className="w-full max-w-[860px]" style={{ background: '#333', borderRadius: 24, padding: '24px 28px', border: '1px solid #444' }}>
        {/* Header with button */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <GhostPostLogo size={18} />
            <span style={{ fontWeight: 700, fontSize: 13, color: '#e5e5e5' }}>GhostPost</span>
          </div>
          <div className="flex gap-2">
            <GhostButton variant="gold" size="md" onClick={handleConfirm} icon={<ArrowRight size={13} strokeWidth={2} />}>Confirm and continue</GhostButton>
            <GhostButton variant="glass" size="md" icon={<SlidersHorizontal size={13} strokeWidth={1.5} />}>Adjust</GhostButton>
          </div>
        </div>

        <h2 style={{ fontSize: 18, fontWeight: 800, color: '#e5e5e5', marginBottom: 2 }}>Your Voice Profile</h2>
        <p style={{ fontSize: 11, color: '#999', marginBottom: 12 }}>Here's what we learned.</p>

        {summaryQuote && (
          <div style={{ background: '#3a3a3a', borderRadius: 10, padding: '10px 14px', marginBottom: 12, borderLeft: '3px solid #d4a853' }}>
            <p style={{ fontSize: 12, color: '#ccc', fontStyle: 'italic', lineHeight: 1.5 }}>"{summaryQuote}"</p>
          </div>
        )}

        {/* Two column layout */}
        <div className="grid grid-cols-2 gap-3">
          {/* Left column */}
          <div className="space-y-3">
            <Card title="Style">
              <Slider label="Formal" labelRight="Casual" value={100 - formality} />
              <Slider label="Reserved" labelRight="Expressive" value={expressiveness} />
              <Slider label="Cautious" labelRight="Direct" value={directness} />
            </Card>

            {topics.length > 0 && <Card title="Topics"><Pills items={topics} /></Card>}

            {signatureWords.length > 0 && (
              <Card title="Signature Words">
                <Pills items={signatureWords} color="#d4a853" bg="rgba(212,168,83,0.12)" />
              </Card>
            )}

            {Object.keys(formatPrefs).length > 0 && (
              <Card title="Format Preferences">
                <div className="grid grid-cols-2 gap-1.5">
                  {Object.entries(formatPrefs).map(([k, v]) => (
                    <div key={k} style={{ background: '#444', borderRadius: 6, padding: '5px 10px', display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 10, color: '#999', textTransform: 'capitalize' }}>{k.replace(/_/g, ' ')}</span>
                      <span style={{ fontSize: 10, fontWeight: 700, color: '#e5e5e5', textTransform: 'capitalize' }}>{String(v)}</span>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Right column */}
          <div className="space-y-3">
            {antiWords.length > 0 && (
              <Card title="Anti-Words">
                <Pills items={antiWords} color="#ef4444" bg="rgba(239,68,68,0.1)" strike />
              </Card>
            )}

            {Object.keys(emotionalRange).length > 0 && (
              <Card title="Emotional Range">
                {Object.entries(emotionalRange).map(([k, v]) => (
                  <div key={k} className="mb-2">
                    <div className="flex justify-between mb-0.5">
                      <span style={{ fontSize: 10, color: '#ccc', textTransform: 'capitalize' }}>{k}</span>
                      <span style={{ fontSize: 10, color: '#999' }}>{Math.round(v * 100)}%</span>
                    </div>
                    <div style={{ height: 4, background: '#555', borderRadius: 2 }}>
                      <div style={{ height: '100%', width: `${v * 100}%`, background: '#d4a853', borderRadius: 2 }} />
                    </div>
                  </div>
                ))}
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
