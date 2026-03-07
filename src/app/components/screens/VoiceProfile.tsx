import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ArrowRight, SlidersHorizontal, Loader2 } from 'lucide-react';
import { GhostPostLogo } from '../layout/GhostPostLogo';
import { GhostButton } from '../ui/GhostButton';
import { api } from '../../lib/api';

export function VoiceProfile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/voice/profile')
      .then(data => setProfile(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleConfirm = async () => {
    try { await api.post('/voice/confirm'); } catch (e) {}
    navigate('/onboarding/persona-schedule');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#2b2b2b' }}>
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={32} className="text-[#d4a853] animate-spin" />
          <p style={{ color: '#999', fontSize: 14 }}>Analysing your voice profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#2b2b2b' }}>
        <div className="text-center" style={{ maxWidth: 400 }}>
          <GhostPostLogo size={28} />
          <h2 className="mt-4 mb-2" style={{ fontSize: 20, fontWeight: 700, color: '#e5e5e5' }}>Profile Not Ready</h2>
          <p style={{ fontSize: 13, color: '#999', marginBottom: 20 }}>
            {error || 'Your voice profile is still being generated. This usually takes 30-60 seconds.'}
          </p>
          <GhostButton variant="gold" size="md" onClick={() => { setLoading(true); setError(''); api.get('/voice/profile').then(setProfile).catch(e => setError(e.message)).finally(() => setLoading(false)); }}>
            Check again
          </GhostButton>
        </div>
      </div>
    );
  }

  const vp = profile.voice_profile || profile;
  const formality = Math.round((vp.formality || 0.5) * 100);
  const directness = Math.round((vp.directness || 0.5) * 100);
  const expressiveness = Math.round((vp.expressiveness || 0.5) * 100);
  const signatureWords = vp.signature_words || [];
  const antiWords = vp.anti_words || [];
  const primaryTopics = vp.primary_topics || [];
  const secondaryTopics = vp.secondary_topics || [];
  const emotionalRange = vp.emotional_range || {};
  const formatPrefs = vp.format_prefs || {};
  const offLimits = vp.off_limits || [];
  const summaryQuote = vp.summary_quote || '';

  return (
    <div className="min-h-screen flex items-center justify-center p-8" style={{ background: '#2b2b2b' }}>
      <div className="w-full max-w-[520px]" style={{ background: '#333333', borderRadius: 24, padding: '36px 32px', border: '1px solid #444444' }}>
        <div className="flex items-center gap-2.5 mb-6">
          <GhostPostLogo size={20} />
          <span style={{ fontWeight: 700, fontSize: 14, color: '#e5e5e5' }}>GhostPost</span>
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: '#e5e5e5', letterSpacing: '-0.02em', marginBottom: 4 }}>Your Voice Profile</h2>
        <p style={{ fontSize: 12, color: '#999999', marginBottom: 20 }}>Here's what we learned. Adjust anything that doesn't feel right.</p>

        {summaryQuote && (
          <div style={{ background: '#3a3a3a', borderRadius: 12, padding: '14px 16px', marginBottom: 16, borderLeft: '3px solid #d4a853' }}>
            <p style={{ fontSize: 13, color: '#cccccc', fontStyle: 'italic', lineHeight: 1.6 }}>"{summaryQuote}"</p>
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

        {(primaryTopics.length > 0 || secondaryTopics.length > 0) && (
          <div style={{ background: '#3a3a3a', borderRadius: 14, padding: '16px 18px', marginBottom: 12 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#e5e5e5', marginBottom: 10 }}>Topics</h3>
            <div className="flex flex-wrap gap-2">
              {[...primaryTopics, ...secondaryTopics].map((t: string) => (
                <span key={t} style={{ padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 500, background: '#4a4a4a', color: '#ccc' }}>{t}</span>
              ))}
            </div>
          </div>
        )}

        {signatureWords.length > 0 && (
          <div style={{ background: '#3a3a3a', borderRadius: 14, padding: '16px 18px', marginBottom: 12 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#e5e5e5', marginBottom: 10 }}>Signature Words</h3>
            <div className="flex flex-wrap gap-2">
              {signatureWords.map((w: string) => (
                <span key={w} style={{ padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: 'rgba(212,168,83,0.12)', color: '#d4a853' }}>{w}</span>
              ))}
            </div>
          </div>
        )}

        {antiWords.length > 0 && (
          <div style={{ background: '#3a3a3a', borderRadius: 14, padding: '16px 18px', marginBottom: 12 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#e5e5e5', marginBottom: 10 }}>Anti-Words</h3>
            <div className="flex flex-wrap gap-2">
              {antiWords.map((w: string) => (
                <span key={w} style={{ padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: 'rgba(239,68,68,0.1)', color: '#ef4444', textDecoration: 'line-through' }}>{w}</span>
              ))}
            </div>
          </div>
        )}

        {Object.keys(emotionalRange).length > 0 && (
          <div style={{ background: '#3a3a3a', borderRadius: 14, padding: '16px 18px', marginBottom: 12 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#e5e5e5', marginBottom: 12 }}>Emotional Range</h3>
            {Object.entries(emotionalRange).map(([key, val]: [string, any]) => (
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
              {Object.entries(formatPrefs).map(([key, val]: [string, any]) => (
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
              {offLimits.map((t: string) => (
                <span key={t} style={{ padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 500, background: '#4a4a4a', color: '#999' }}>{t}</span>
              ))}
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
