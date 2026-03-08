import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/auth-context';

const PERSONA_WINDOWS = [
  { name: 'Early Riser', hours: [5, 6], time: '05:00 – 07:00', color: '#e89aad', traits: ['Calm', 'Brief'] },
  { name: 'Morning Drive', hours: [7, 8], time: '07:00 – 09:00', color: '#7ab4e0', traits: ['Focused', 'Direct'] },
  { name: 'Work Mode', hours: [9, 10, 11], time: '09:00 – 12:00', color: '#6dc992', traits: ['Professional', 'Articulate'] },
  { name: 'Midday Break', hours: [12, 13], time: '12:00 – 13:30', color: '#e0c064', traits: ['Casual', 'Warm'] },
  { name: 'Afternoon Push', hours: [14, 15, 16], time: '13:30 – 17:00', color: '#b48ad6', traits: ['Efficient', 'Helpful'] },
  { name: 'Wind Down', hours: [17, 18, 19], time: '17:00 – 19:30', color: '#a0a0b4', traits: ['Relaxed', 'Personal'] },
  { name: 'Evening Social', hours: [20, 21], time: '19:30 – 22:00', color: '#e09868', traits: ['Playful', 'Opinionated'] },
  { name: 'Night Owl', hours: [22, 23, 0, 1, 2, 3, 4], time: '22:00 – 05:00', color: '#d08080', traits: ['Sparse', 'Thoughtful'] },
];

export function Personas() {
  const { user } = useAuth();
  const [circadianData, setCircadianData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/persona/circadian')
      .then(data => setCircadianData(Array.isArray(data) ? data : []))
      .catch(() => setCircadianData([]))
      .finally(() => setLoading(false));
  }, []);

  const getWindowEnergy = (w: typeof PERSONA_WINDOWS[0]) => {
    if (circadianData.length === 0) return 0;
    const entries = circadianData.filter(d => w.hours.includes(d.hour));
    if (entries.length === 0) return 0;
    return Math.round(entries.reduce((sum, e) => sum + (Number(e.energy) || 0), 0) / entries.length * 100);
  };

  const getWindowMood = (w: typeof PERSONA_WINDOWS[0]) => {
    if (circadianData.length === 0) return 'unknown';
    const entries = circadianData.filter(d => w.hours.includes(d.hour));
    return entries[0]?.mood || 'relaxed';
  };

  if (loading) {
    return (<div className="flex items-center justify-center p-20"><Loader2 size={24} className="text-[#d4a853] animate-spin" /></div>);
  }

  if (circadianData.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
        <p style={{ fontSize: 14, marginBottom: 8 }}>No persona data yet.</p>
        <p style={{ fontSize: 12 }}>Complete voice onboarding to generate your circadian personas.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex mb-6" style={{ borderRadius: 10, overflow: 'hidden', height: 32 }}>
        {PERSONA_WINDOWS.map((w) => (
          <div key={w.name} style={{ flex: w.hours.length, background: w.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 9, fontWeight: 700, color: '#fff', textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>{w.time.split(' – ')[0]}</span>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3">
        {PERSONA_WINDOWS.map((w) => {
          const energy = getWindowEnergy(w);
          const mood = getWindowMood(w);
          return (
            <div key={w.name} style={{ background: '#383838', borderRadius: 16, padding: 18, border: '1px solid #4a4a4a' }}>
              <div className="flex items-center gap-2.5 mb-2">
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: w.color }} />
                <h3 style={{ fontSize: 14, fontWeight: 700, color: '#e5e5e5' }}>{w.name}</h3>
              </div>
              <p style={{ fontSize: 11, color: '#999', marginBottom: 8 }}>{w.time}</p>
              <p style={{ fontSize: 12, color: '#aaa', marginBottom: 10 }}>Mood: {mood}. Energy: {energy}%</p>
              <div style={{ height: 5, background: '#555', borderRadius: 3, marginBottom: 10 }}>
                <div style={{ height: '100%', width: `${energy}%`, background: w.color, borderRadius: 3 }} />
              </div>
              <div className="flex gap-2">
                {w.traits.map(t => (
                  <span key={t} style={{ padding: '3px 10px', borderRadius: 8, fontSize: 10, fontWeight: 500, background: '#444', color: '#ccc', border: '1px solid #555' }}>{t}</span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
