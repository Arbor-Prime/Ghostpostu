const personas = [
  { name: 'Early Riser', time: '05:00 – 07:00', desc: 'Quiet, reflective, still waking up. Low energy, minimal engagement.', energy: 25, tones: ['Calm', 'Brief'], color: '#e89aad', active: false },
  { name: 'Morning Drive', time: '07:00 – 09:00', desc: 'Getting into gear. Slightly more alert, focused on priorities.', energy: 45, tones: ['Focused', 'Direct'], color: '#7ab4e0', active: false },
  { name: 'Work Mode', time: '09:00 – 12:00', desc: 'Peak professional mode. Sharp, articulate, on-topic.', energy: 80, tones: ['Professional', 'Articulate'], color: '#6dc992', active: false },
  { name: 'Midday Break', time: '12:00 – 13:30', desc: 'Relaxed lunch energy. More casual, slightly distracted.', energy: 55, tones: ['Casual', 'Warm'], color: '#e0c064', active: false },
  { name: 'Afternoon Push', time: '13:30 – 17:00', desc: 'Back to work but energy is dipping. Still productive but briefer.', energy: 65, tones: ['Efficient', 'Helpful'], color: '#b48ad6', active: true },
  { name: 'Wind Down', time: '17:00 – 19:30', desc: 'Transitioning out of work. More personal, relaxed tone.', energy: 50, tones: ['Relaxed', 'Personal'], color: '#a0a0b4', active: false },
  { name: 'Evening Social', time: '19:30 – 22:00', desc: 'Most social window. Humorous, opinionated, engaging.', energy: 70, tones: ['Playful', 'Opinionated'], color: '#e09868', active: false },
  { name: 'Night Owl', time: '22:00 – 05:00', desc: 'Late night mode. Sparse, sometimes philosophical.', energy: 20, tones: ['Sparse', 'Thoughtful'], color: '#d08080', active: false },
];

export function Personas() {
  return (
    <div>
      <div className="mb-5">
        <div className="flex overflow-hidden" style={{ borderRadius: 10, height: 32, border: '1px solid #4a4a4a' }}>
          {personas.map((p) => (
            <div key={p.name} className="flex-1 flex items-center justify-center relative" style={{ backgroundColor: p.color }}>
              <span style={{ fontSize: 9, fontWeight: 600, color: 'rgba(0,0,0,0.45)' }}>{p.time.split(' – ')[0]}</span>
              {p.active && <div className="absolute bottom-0 left-0 right-0 h-[3px]" style={{ background: '#d4a853' }} />}
            </div>
          ))}
        </div>
      </div>
      <div className="space-y-3">
        {personas.map((p) => (
          <div key={p.name} style={{
            background: '#383838', borderRadius: 14, padding: '18px 20px',
            border: '1px solid #4a4a4a',
            borderLeft: p.active ? `3px solid ${p.color}` : '3px solid transparent',
          }}>
            <div className="flex items-center gap-2.5 mb-0.5">
              <div className="w-3.5 h-3.5 rounded-full shrink-0" style={{ background: p.color, boxShadow: `0 0 6px ${p.color}60` }} />
              <h3 style={{ fontSize: 14, fontWeight: 700, color: '#e5e5e5' }}>{p.name}</h3>
              {p.active && <span style={{ fontSize: 10, fontWeight: 600, color: '#d4a853', background: 'rgba(212,168,83,0.12)', borderRadius: 20, padding: '3px 10px' }}>Active now</span>}
            </div>
            <span style={{ fontSize: 11, fontWeight: 500, color: '#999999', marginLeft: 24 }} className="block">{p.time}</span>
            <p style={{ fontSize: 13, color: '#aaaaaa', lineHeight: 1.5, marginTop: 6 }}>{p.desc}</p>
            <div className="mt-4 flex items-center gap-6">
              <div className="flex-1 max-w-[200px]">
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
          </div>
        ))}
      </div>
    </div>
  );
}
