import { useNavigate } from 'react-router';
import { ArrowRight } from 'lucide-react';
import { GhostPostLogo } from '../layout/GhostPostLogo';
import { GhostButton } from '../ui/GhostButton';
import { api } from '../../lib/api';

const personas = [
  { name: 'Early Riser', time: '05–07', energy: 25, color: '#e89aad', mood: 'Calm, brief' },
  { name: 'Morning Drive', time: '07–09', energy: 45, color: '#7ab4e0', mood: 'Focused, direct' },
  { name: 'Work Mode', time: '09–12', energy: 80, color: '#6dc992', mood: 'Professional' },
  { name: 'Midday Break', time: '12–13:30', energy: 55, color: '#e0c064', mood: 'Casual, warm' },
  { name: 'Afternoon', time: '13:30–17', energy: 65, color: '#b48ad6', mood: 'Efficient' },
  { name: 'Wind Down', time: '17–19:30', energy: 50, color: '#a0a0b4', mood: 'Relaxed' },
  { name: 'Evening', time: '19:30–22', energy: 70, color: '#e09868', mood: 'Playful' },
  { name: 'Night Owl', time: '22–05', energy: 20, color: '#d08080', mood: 'Sparse' },
];

export function PersonaSchedule() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleGenerate = async () => {
    try {
      await api.post('/persona/generate');
    } catch(e) {}
    try {
      await api.patch('/auth/onboarding-complete');
    } catch(e) {}
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: '#2b2b2b' }}>
      <div className="w-full max-w-[960px]" style={{ background: '#333', borderRadius: 24, padding: '28px 28px 24px', border: '1px solid #444' }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <GhostPostLogo size={20} />
            <span style={{ fontWeight: 700, fontSize: 14, color: '#e5e5e5' }}>GhostPost</span>
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
            onClick={async () => {
              try {
                await api.post('/persona/generate');
                await api.patch('/auth/onboarding-complete');
              } catch (e) {}
              navigate('/dashboard');
            }}
            iconRight={<ArrowRight size={14} strokeWidth={2.5} />}
          >
            Generate schedule
          </GhostButton>
        </div>

        <h2 style={{ fontSize: 20, fontWeight: 800, color: '#e5e5e5', marginBottom: 4 }}>Your Persona Schedule</h2>
        <p style={{ fontSize: 12, color: '#999', marginBottom: 16 }}>8 personas adjust your voice throughout the day.</p>

        {/* Timeline bar */}
        <div className="flex mb-4" style={{ borderRadius: 8, overflow: 'hidden', height: 24 }}>
          {personas.map((p) => (
            <div key={p.name} style={{ flex: 1, background: p.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 8, fontWeight: 700, color: '#fff', textShadow: '0 1px 2px rgba(0,0,0,0.4)' }}>{p.time}</span>
            </div>
          ))}
        </div>

        {/* 4-column compact grid */}
        <div className="grid grid-cols-4 gap-2">
          {personas.map((p) => (
            <div key={p.name} style={{ background: '#3a3a3a', borderRadius: 12, padding: '12px 14px', border: '1px solid #4a4a4a' }}>
              <div className="flex items-center gap-2 mb-1.5">
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: p.color, flexShrink: 0 }} />
                <span style={{ fontSize: 12, fontWeight: 700, color: '#e5e5e5' }}>{p.name}</span>
              </div>
              <p style={{ fontSize: 10, color: '#888', marginBottom: 6 }}>{p.time} · {p.mood}</p>
              <div className="flex items-center gap-2">
                <div style={{ flex: 1, height: 4, background: '#555', borderRadius: 2 }}>
                  <div style={{ height: '100%', width: `${p.energy}%`, background: p.color, borderRadius: 2 }} />
                </div>
                <span style={{ fontSize: 9, color: '#999' }}>{p.energy}%</span>
              </div>
            </div>
          ))}
        </div>

        {/* Quick adjustments */}
        <div className="flex items-center gap-2 mt-4">
          <span style={{ fontSize: 11, color: '#777' }}>Quick:</span>
          {['I work 9-5', "Night owl", 'No kids', 'Work weekends', 'Skip mornings'].map(q => (
            <span key={q} style={{ padding: '3px 10px', borderRadius: 6, fontSize: 10, color: '#aaa', background: '#444', border: '1px solid #555', cursor: 'pointer' }}>{q}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
