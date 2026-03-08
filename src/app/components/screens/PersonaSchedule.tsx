import { useNavigate } from 'react-router';
import { ArrowRight } from 'lucide-react';
import { GhostPostLogo } from '../layout/GhostPostLogo';
import { GhostButton } from '../ui/GhostButton';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/auth-context';

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
          <GhostButton variant="gold" size="md" onClick={handleGenerate} icon={<ArrowRight size={14} strokeWidth={2} />}>
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
