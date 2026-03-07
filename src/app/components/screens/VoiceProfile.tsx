import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowRight, SlidersHorizontal } from 'lucide-react';
import { GhostPostLogo } from '../layout/GhostPostLogo';
import { GhostButton } from '../ui/GhostButton';

const styleSliders = [
  { label: 'Formal', rightLabel: 'Casual', value: 72 },
  { label: 'Reserved', rightLabel: 'Expressive', value: 65 },
  { label: 'Cautious', rightLabel: 'Direct', value: 80 },
];
const topics = [
  { label: 'AI & Machine Learning', size: 'large' }, { label: 'Developer Tools', size: 'large' }, { label: 'Startups', size: 'large' },
  { label: 'Design Systems', size: 'small' }, { label: 'Open Source', size: 'small' }, { label: 'Product Strategy', size: 'small' },
  { label: 'TypeScript', size: 'small' }, { label: 'Remote Work', size: 'small' },
];
const signatureWords = ['honestly', 'mate', 'ship it', 'basically', 'vibe'];
const antiWords = ['synergy', 'leverage', 'circle back', 'deep dive'];
const emotionalBars = [
  { label: 'Humour', value: 75 }, { label: 'Passion', value: 85 }, { label: 'Sarcasm', value: 60 },
  { label: 'Supportive', value: 70 }, { label: 'Vulnerability', value: 40 },
];
const formatPrefs = [
  { label: 'Line breaks', value: 'Moderate' }, { label: 'Emoji usage', value: 'Occasional' },
  { label: 'Sentence length', value: 'Mixed' }, { label: 'Hashtags', value: 'Rarely' },
  { label: 'Swearing', value: 'Sometimes' }, { label: 'Caps usage', value: 'Emphasis only' },
];
const offLimits = ['Politics', 'Religion', 'Personal health'];

export function VoiceProfile() {
  const navigate = useNavigate();
  const [sliders, setSliders] = useState(styleSliders.map((s) => s.value));

  const Section = ({ children }: { children: React.ReactNode }) => (
    <div className="mb-4" style={{ background: '#3a3a3a', borderRadius: 14, padding: '18px 20px', border: '1px solid #4a4a4a' }}>{children}</div>
  );

  return (
    <div className="min-h-screen py-10 px-6" style={{ background: '#2b2b2b' }}>
      <div className="max-w-[680px] mx-auto">
        <div style={{ background: '#333333', borderRadius: 24, padding: '36px 36px 32px', border: '1px solid #444444' }}>
          <div className="flex items-center gap-2.5 mb-6">
            <GhostPostLogo size={22} />
            <span style={{ fontWeight: 700, fontSize: 15, color: '#e5e5e5' }}>GhostPost</span>
          </div>
          <h1 className="mb-1.5" style={{ fontSize: 22, fontWeight: 800, color: '#e5e5e5', letterSpacing: '-0.03em' }}>Your Voice Profile</h1>
          <p className="mb-6" style={{ fontSize: 13, color: '#aaaaaa' }}>Here's what we learned. Adjust anything that doesn't feel right.</p>

          <div className="mb-4" style={{ background: '#3a3a3a', borderRadius: 14, padding: '18px 20px', borderLeft: '3px solid #d4a853', border: '1px solid #4a4a4a', borderLeftColor: '#d4a853', borderLeftWidth: 3 }}>
            <p style={{ fontSize: 13, color: '#cccccc', fontStyle: 'italic', lineHeight: 1.65 }}>
              "You communicate with a casual warmth and directness that's refreshingly authentic. You favour short, punchy sentences with the occasional longer thought. Humour is your default mode, but you're not afraid to get serious when it matters."
            </p>
          </div>

          <Section>
            <h3 className="mb-4" style={{ fontSize: 13, fontWeight: 700, color: '#e5e5e5' }}>Style</h3>
            <div className="space-y-5">
              {styleSliders.map((s, i) => (
                <div key={s.label}>
                  <div className="flex justify-between mb-2">
                    <span style={{ fontSize: 11, fontWeight: 500, color: '#999999' }}>{s.label}</span>
                    <span style={{ fontSize: 11, fontWeight: 500, color: '#999999' }}>{s.rightLabel}</span>
                  </div>
                  <div className="relative w-full h-2" style={{ borderRadius: 4, background: '#4a4a4a' }}>
                    <div className="absolute h-full" style={{ width: `${sliders[i]}%`, background: '#d4a853', borderRadius: 4 }} />
                    <input type="range" min={0} max={100} value={sliders[i]} onChange={(e) => { const n = [...sliders]; n[i] = Number(e.target.value); setSliders(n); }} className="absolute inset-0 w-full opacity-0 cursor-pointer" />
                    <div className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-[#d4a853]" style={{ borderRadius: 6, left: `calc(${sliders[i]}% - 8px)`, boxShadow: '0 1px 4px rgba(0,0,0,0.4)' }} />
                  </div>
                </div>
              ))}
            </div>
          </Section>

          <Section>
            <h3 className="mb-3" style={{ fontSize: 13, fontWeight: 700, color: '#e5e5e5' }}>Topics</h3>
            <div className="flex flex-wrap gap-2">
              {topics.map((t) => <span key={t.label} style={{ background: '#444444', border: '1px solid #505050', borderRadius: 20, padding: '5px 14px', fontSize: t.size === 'large' ? 12 : 11, fontWeight: t.size === 'large' ? 600 : 400, color: '#cccccc' }}>{t.label}</span>)}
            </div>
          </Section>

          <Section>
            <h3 className="mb-3" style={{ fontSize: 13, fontWeight: 700, color: '#e5e5e5' }}>Signature Words</h3>
            <div className="flex flex-wrap gap-2">
              {signatureWords.map((w) => <span key={w} style={{ borderRadius: 20, padding: '5px 14px', fontSize: 12, fontWeight: 600, background: 'rgba(212,168,83,0.1)', color: '#d4a853' }}>{w}</span>)}
            </div>
          </Section>

          <Section>
            <h3 className="mb-3" style={{ fontSize: 13, fontWeight: 700, color: '#e5e5e5' }}>Anti-Words</h3>
            <div className="flex flex-wrap gap-2">
              {antiWords.map((w) => <span key={w} style={{ borderRadius: 20, padding: '5px 14px', fontSize: 12, fontWeight: 600, background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>{w}</span>)}
            </div>
          </Section>

          <Section>
            <h3 className="mb-4" style={{ fontSize: 13, fontWeight: 700, color: '#e5e5e5' }}>Emotional Range</h3>
            <div className="space-y-3.5">
              {emotionalBars.map((bar) => (
                <div key={bar.label}>
                  <div className="flex justify-between mb-1">
                    <span style={{ fontSize: 11, fontWeight: 500, color: '#cccccc' }}>{bar.label}</span>
                    <span style={{ fontSize: 10, fontWeight: 500, color: '#999999' }}>{bar.value}%</span>
                  </div>
                  <div className="w-full h-1.5" style={{ borderRadius: 3, background: '#4a4a4a' }}>
                    <div className="h-full" style={{ width: `${bar.value}%`, background: '#d4a853', borderRadius: 3 }} />
                  </div>
                </div>
              ))}
            </div>
          </Section>

          <Section>
            <h3 className="mb-3" style={{ fontSize: 13, fontWeight: 700, color: '#e5e5e5' }}>Format Preferences</h3>
            <div className="grid grid-cols-2 gap-2">
              {formatPrefs.map((p) => (
                <div key={p.label} className="flex justify-between py-2 px-3" style={{ borderRadius: 8, background: '#333333', border: '1px solid #4a4a4a' }}>
                  <span style={{ fontSize: 11, fontWeight: 500, color: '#999999' }}>{p.label}</span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#e5e5e5' }}>{p.value}</span>
                </div>
              ))}
            </div>
          </Section>

          <Section>
            <h3 className="mb-3" style={{ fontSize: 13, fontWeight: 700, color: '#e5e5e5' }}>Off-Limits Topics</h3>
            <div className="flex flex-wrap gap-2">
              {offLimits.map((t) => <span key={t} style={{ background: '#444444', border: '1px solid #505050', borderRadius: 20, padding: '5px 14px', fontSize: 11, fontWeight: 500, color: '#aaaaaa' }}>{t}</span>)}
            </div>
          </Section>

          <div className="flex items-center gap-3 mt-2">
            <GhostButton
              variant="gold"
              size="lg"
              onClick={() => navigate('/onboarding/persona-schedule')}
              iconRight={<ArrowRight size={14} strokeWidth={2.5} />}
            >
              Confirm and continue
            </GhostButton>
            <GhostButton
              variant="glass"
              size="lg"
              icon={<SlidersHorizontal size={13} strokeWidth={1.5} />}
            >
              Adjust manually
            </GhostButton>
          </div>
        </div>
      </div>
    </div>
  );
}
