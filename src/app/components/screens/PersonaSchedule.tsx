import { useNavigate } from 'react-router';
import { ArrowRight } from 'lucide-react';
import { GhostPostLogo } from '../layout/GhostPostLogo';
import { GhostButton } from '../ui/GhostButton';

const personas = [
  { name: 'Early Riser', time: '05:00 – 07:00', desc: 'Quiet, reflective, still waking up. Low energy, minimal engagement.', energy: 25, tones: ['Calm', 'Brief'], color: '#e89aad' },
  { name: 'Morning Drive', time: '07:00 – 09:00', desc: 'Getting into gear. Slightly more alert, focused on priorities.', energy: 45, tones: ['Focused', 'Direct'], color: '#7ab4e0' },
  { name: 'Work Mode', time: '09:00 – 12:00', desc: 'Peak professional mode. Sharp, articulate, on-topic.', energy: 80, tones: ['Professional', 'Articulate'], color: '#6dc992' },
  { name: 'Midday Break', time: '12:00 – 13:30', desc: 'Relaxed lunch energy. More casual, slightly distracted.', energy: 55, tones: ['Casual', 'Warm'], color: '#e0c064' },
  { name: 'Afternoon Push', time: '13:30 – 17:00', desc: 'Back to work but energy is dipping. Still productive but briefer.', energy: 65, tones: ['Efficient', 'Helpful'], color: '#b48ad6' },
  { name: 'Wind Down', time: '17:00 – 19:30', desc: 'Transitioning out of work. More personal, relaxed tone.', energy: 50, tones: ['Relaxed', 'Personal'], color: '#a0a0b4' },
  { name: 'Evening Social', time: '19:30 – 22:00', desc: 'Most social window. Humorous, opinionated, engaging.', energy: 70, tones: ['Playful', 'Opinionated'], color: '#e09868' },
  { name: 'Night Owl', time: '22:00 – 05:00', desc: 'Late night mode. Sparse, sometimes philosophical.', energy: 20, tones: ['Sparse', 'Thoughtful'], color: '#d08080' },
];
const quickAdjusts = ['I work 9-5', "I'm a night owl", "I don't have kids", 'I work weekends', 'I skip mornings'];

export function PersonaSchedule() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen py-10 px-6" style={{ background: '#2b2b2b' }}>
      <div className="max-w-[860px] mx-auto">
        <div style={{ background: '#333333', borderRadius: 24, padding: '36px 36px 32px', border: '1px solid #444444' }}>
          <div className="flex items-center gap-2.5 mb-6">
            <GhostPostLogo size={22} />
            <span style={{ fontWeight: 700, fontSize: 15, color: '#e5e5e5' }}>GhostPost</span>
          </div>
          <h1 className="mb-1.5" style={{ fontSize: 22, fontWeight: 800, color: '#e5e5e5', letterSpacing: '-0.03em' }}>Your Persona Schedule</h1>
          <p className="mb-6" style={{ fontSize: 13, color: '#aaaaaa' }}>GhostPost adjusts your voice throughout the day. These 8 personas represent how your communication changes.</p>

          <div className="mb-6">
            <div className="flex overflow-hidden" style={{ borderRadius: 10, height: 32, border: '1px solid #4a4a4a' }}>
              {personas.map((p) => (
                <div key={p.name} className="flex-1 flex items-center justify-center" style={{ backgroundColor: p.color }}>
                  <span style={{ fontSize: 9, fontWeight: 600, color: 'rgba(0,0,0,0.45)' }}>{p.time.split(' – ')[0]}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-6">
            {personas.map((p) => (
              <div key={p.name} style={{ background: '#3a3a3a', borderRadius: 14, padding: '16px 18px', border: '1px solid #4a4a4a' }}>
                <div className="flex items-center gap-2.5 mb-1">
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ background: p.color, boxShadow: `0 0 6px ${p.color}60` }} />
                  <h3 style={{ fontSize: 13, fontWeight: 700, color: '#e5e5e5' }}>{p.name}</h3>
                </div>
                <span style={{ fontSize: 11, fontWeight: 500, color: '#999999', marginLeft: 22 }} className="block">{p.time}</span>
                <p style={{ fontSize: 12, color: '#aaaaaa', lineHeight: 1.5, marginTop: 6, marginBottom: 10 }}>{p.desc}</p>
                <div className="mb-2.5">
                  <div className="flex justify-between mb-1">
                    <span style={{ fontSize: 10, fontWeight: 500, color: '#999999' }}>Energy</span>
                    <span style={{ fontSize: 10, fontWeight: 600, color: '#e5e5e5' }}>{p.energy}%</span>
                  </div>
                  <div className="w-full h-1.5" style={{ borderRadius: 3, background: '#4a4a4a' }}>
                    <div className="h-full" style={{ width: `${p.energy}%`, background: p.color, borderRadius: 3 }} />
                  </div>
                </div>
                <div className="flex gap-1.5">
                  {p.tones.map((t) => <span key={t} style={{ borderRadius: 20, padding: '3px 10px', fontSize: 10, fontWeight: 500, color: '#aaaaaa', background: '#444444', border: '1px solid #505050' }}>{t}</span>)}
                </div>
              </div>
            ))}
          </div>

          <div className="mb-6">
            <span style={{ fontSize: 11, fontWeight: 600, color: '#999999' }} className="block mb-2.5">Quick adjustments</span>
            <div className="flex flex-wrap gap-2">
              {quickAdjusts.map((q) => (
                <GhostButton key={q} variant="ghost" size="sm">
                  {q}
                </GhostButton>
              ))}
            </div>
          </div>

          <GhostButton
            variant="gold"
            size="lg"
            onClick={async () => { try { await fetch('/api/auth/onboarding-complete', { method: 'PATCH', credentials: 'include' }); } catch(e) {} navigate('/dashboard'); }}
            iconRight={<ArrowRight size={14} strokeWidth={2.5} />}
          >
            Generate schedule
          </GhostButton>
        </div>
      </div>
    </div>
  );
}
