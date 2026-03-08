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
      const data = await api.get(`/voice/profile/${user.id}`);
      const vp = data.voice_profile;
      const onboardStatus = data.voice_onboarding_status;

      if (onboardStatus === 'processing') {
        setStatus('processing');
        return; // keep polling
      }

      if (!vp || onboardStatus === 'pending') {
        setStatus('not-recorded');
        return;
      }

      // Check if it's a real profile (has actual data, not just defaults)
      if (vp.summary_quote || (vp.signature_words && vp.signature_words.length > 0)) {
        setProfile(vp);
        setStatus('ready');
        if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
      } else {
        // Profile exists but is empty/default — still processing
        setProfile(vp);
        setStatus('ready');
        if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
      }
    } catch (err: any) {
      setError(err.message);
      setStatus('error');
    }
  };

  useEffect(() => {
    fetchProfile();
    // Poll every 5 seconds while processing
    pollRef.current = setInterval(fetchProfile, 5000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [user]);

  const handleConfirm = async () => {
    try { await api.post(`/voice/confirm/${user?.id}`); } catch (e) {}
    navigate('/onboarding/persona-schedule');
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#2b2b2b' }}>
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={32} className="text-[#d4a853] animate-spin" />
          <p style={{ color: '#999', fontSize: 14 }}>Loading your voice profile...</p>
        </div>
      </div>
    );
  }

  if (status === 'processing') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#2b2b2b' }}>
        <div className="flex flex-col items-center gap-4 text-center" style={{ maxWidth: 400 }}>
          <Loader2 size={32} className="text-[#d4a853] animate-spin" />
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#e5e5e5' }}>Analysing Your Voice</h2>
          <p style={{ color: '#999', fontSize: 13, lineHeight: 1.6 }}>
            We're transcribing your recording and extracting your communication patterns. This usually takes 30-90 seconds.
          </p>
          <div className="flex flex-col gap-2 mt-2 w-full" style={{ maxWidth: 260 }}>
            {['Transcribing audio', 'Extracting vocabulary', 'Mapping style patterns', 'Building emotional profile'].map((step, i) => (
              <div key={step} className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#d4a853', opacity: 0.3 + (i * 0.2) }} />
                <span style={{ fontSize: 11, color: '#888' }}>{step}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (status === 'not-recorded') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#2b2b2b' }}>
        <div className="text-center" style={{ maxWidth: 400 }}>
          <GhostPostLogo size={28} />
          <h2 className="mt-4 mb-2" style={{ fontSize: 20, fontWeight: 700, color: '#e5e5e5' }}>No Recording Found</h2>
          <p style={{ fontSize: 13, color: '#999', marginBottom: 20, lineHeight: 1.6 }}>
            We didn't find a voice recording for your account. Go back and record at least 60 seconds so we can build your profile.
          </p>
          <GhostButton variant="gold" size="md" onClick={() => navigate('/onboarding/recording')}>Record Now</GhostButton>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#2b2b2b' }}>
        <div className="text-center" style={{ maxWidth: 400 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#e5e5e5' }}>Something Went Wrong</h2>
          <p style={{ fontSize: 13, color: '#999', marginBottom: 20 }}>{error}</p>
          <GhostButton variant="gold" size="md" onClick={() => { setStatus('loading'); setError(''); fetchProfile(); }}>Try Again</GhostButton>
        </div>
      </div>
    );
  }

  // Profile ready — show real data
  const vp = profile || {};
  const formality = Math.round((vp.formality || 0.5) * 100);
  const directness = Math.round((vp.directness || 0.5) * 100);
  const expressiveness = Math.round((vp.expressiveness || 0.5) * 100);
  const signatureWords: string[] = vp.signature_words || [];
  const antiWords: string[] = vp.anti_words || [];
  const primaryTopics: string[] = vp.primary_topics || [];
  const secondaryTopics: string[] = vp.secondary_topics || [];
  const emotionalRange: Record<string, number> = vp.emotional_range || {};
  const formatPrefs: Record<string, string> = vp.format_prefs || {};
  const offLimits: string[] = vp.off_limits || [];
  const summaryQuote: string = vp.summary_quote || '';

  return (
    <div className="min-h-screen flex items-center justify-center p-8" style={{ background: '#2b2b2b' }}>
      <div className="w-full max-w-[520px]" style={{ background: '#333', borderRadius: 24, padding: '36px 32px', border: '1px solid #444' }}>
        <div className="flex items-center gap-2.5 mb-6">
          <GhostPostLogo size={20} />
          <span style={{ fontWeight: 700, fontSize: 14, color: '#e5e5e5' }}>GhostPost</span>
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: '#e5e5e5', letterSpacing: '-0.02em', marginBottom: 4 }}>Your Voice Profile</h2>
        <p style={{ fontSize: 12, color: '#999', marginBottom: 20 }}>Here's what we learned. Adjust anything that doesn't feel right.</p>

        {summaryQuote && (
          <div style={{ background: '#3a3a3a', borderRadius: 12, padding: '14px 16px', marginBottom: 16, borderLeft: '3px solid #d4a853' }}>
            <p style={{ fontSize: 13, color: '#ccc', fontStyle: 'italic', lineHeight: 1.6 }}>"{summaryQuote}"</p>
          </div>
        )}

        <div style={{ background: '#3a3a3a', borderRadius: 14, padding: '16px 18px', marginBottom: 12 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#e5e5e5', marginBottom: 12 }}>Style</h3>
          {[
            { label: 'Formal', labelRight: 'Casual', value: 100 - formality },
            { label: 'Reserved', labelRight: 'Expressive', value: expressiveness },
            { label: 'Cautious', labelRight: 'Direct', value: directness },
          ].map((s) => (
            <div key={s.label} className="mb-3">
              <div className="flex justify-between mb-1">
                <span style={{ fontSize: 10, color: '#888' }}>{s.label}</span>
                <span style={{ fontSize: 10, color: '#888' }}>{s.labelRight}</span>
              </div>
              <div style={{ height: 6, background: '#555', borderRadius: 3, position: 'relative' }}>
                <div style={{ height: '100%', width: `${s.value}%`, background: '#d4a853', borderRadius: 3 }} />
                <div style={{ position: 'absolute', top: -4, left: `${s.value}%`, transform: 'translateX(-50%)', width: 14, height: 14, borderRadius: '50%', background: '#d4a853', border: '2px solid #333' }} />
              </div>
            </div>
          ))}
        </div>

        {[...primaryTopics, ...secondaryTopics].length > 0 && (
          <div style={{ background: '#3a3a3a', borderRadius: 14, padding: '16px 18px', marginBottom: 12 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#e5e5e5', marginBottom: 10 }}>Topics</h3>
            <div className="flex flex-wrap gap-2">
              {[...primaryTopics, ...secondaryTopics].map((t) => <span key={t} style={{ padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 500, background: '#4a4a4a', color: '#ccc' }}>{t}</span>)}
            </div>
          </div>
        )}

        {signatureWords.length > 0 && (
          <div style={{ background: '#3a3a3a', borderRadius: 14, padding: '16px 18px', marginBottom: 12 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#e5e5e5', marginBottom: 10 }}>Signature Words</h3>
            <div className="flex flex-wrap gap-2">
              {signatureWords.map((w) => <span key={w} style={{ padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: 'rgba(212,168,83,0.12)', color: '#d4a853' }}>{w}</span>)}
            </div>
          </div>
        )}

        {antiWords.length > 0 && (
          <div style={{ background: '#3a3a3a', borderRadius: 14, padding: '16px 18px', marginBottom: 12 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#e5e5e5', marginBottom: 10 }}>Anti-Words</h3>
            <div className="flex flex-wrap gap-2">
              {antiWords.map((w) => <span key={w} style={{ padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: 'rgba(239,68,68,0.1)', color: '#ef4444', textDecoration: 'line-through' }}>{w}</span>)}
            </div>
          </div>
        )}

        {Object.keys(emotionalRange).length > 0 && (
          <div style={{ background: '#3a3a3a', borderRadius: 14, padding: '16px 18px', marginBottom: 12 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#e5e5e5', marginBottom: 12 }}>Emotional Range</h3>
            {Object.entries(emotionalRange).map(([key, val]) => (
              <div key={key} className="mb-2.5">
                <div className="flex justify-between mb-1">
                  <span style={{ fontSize: 11, fontWeight: 500, color: '#ccc', textTransform: 'capitalize' }}>{key}</span>
                  <span style={{ fontSize: 11, color: '#999' }}>{Math.round(val * 100)}%</span>
                </div>
                <div style={{ height: 5, background: '#555', borderRadius: 3 }}>
                  <div style={{ height: '100%', width: `${val * 100}%`, background: '#d4a853', borderRadius: 3 }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {Object.keys(formatPrefs).length > 0 && (
          <div style={{ background: '#3a3a3a', borderRadius: 14, padding: '16px 18px', marginBottom: 12 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#e5e5e5', marginBottom: 10 }}>Format Preferences</h3>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(formatPrefs).map(([key, val]) => (
                <div key={key} style={{ background: '#444', borderRadius: 8, padding: '8px 12px', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 11, color: '#999', textTransform: 'capitalize' }}>{key.replace(/_/g, ' ')}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#e5e5e5', textTransform: 'capitalize' }}>{String(val)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {offLimits.length > 0 && (
          <div style={{ background: '#3a3a3a', borderRadius: 14, padding: '16px 18px', marginBottom: 16 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#e5e5e5', marginBottom: 10 }}>Off-Limits Topics</h3>
            <div className="flex flex-wrap gap-2">
              {offLimits.map((t) => <span key={t} style={{ padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 500, background: '#4a4a4a', color: '#999' }}>{t}</span>)}
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <GhostButton variant="gold" size="lg" onClick={handleConfirm} icon={<ArrowRight size={14} strokeWidth={2} />}>Confirm and continue</GhostButton>
          <GhostButton variant="glass" size="lg" icon={<SlidersHorizontal size={14} strokeWidth={1.5} />}>Adjust manually</GhostButton>
        </div>
      </div>
    </div>
  );
}
