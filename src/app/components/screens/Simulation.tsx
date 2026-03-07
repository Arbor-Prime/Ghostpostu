import { FlaskConical, Info, Play } from 'lucide-react';
import { GhostButton } from '../ui/GhostButton';

const scores = [{ label: 'Behaviour Score', value: '—' }, { label: 'Timing Score', value: '—' }, { label: 'Content Score', value: '—' }];

export function Simulation() {
  return (
    <div className="flex-1 flex items-center justify-center py-12">
      <div className="max-w-md w-full text-center">
        <div style={{ background: '#383838', borderRadius: 18, padding: '36px 32px', marginBottom: 24, border: '1px solid #4a4a4a' }}>
          <div className="flex justify-center mb-5">
            <div className="flex items-center justify-center" style={{ width: 48, height: 48, borderRadius: 14, background: '#444444', border: '1px solid #505050' }}>
              <FlaskConical size={22} strokeWidth={1.5} className="text-[#999999]" />
            </div>
          </div>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: '#e5e5e5', letterSpacing: '-0.02em', marginBottom: 8 }}>Simulation Not Yet Active</h2>
          <p style={{ fontSize: 13, color: '#aaaaaa', lineHeight: 1.6, marginBottom: 20 }}>This feature will benchmark your persona believability against real human interaction patterns.</p>
          <div className="flex justify-center">
            <GhostButton variant="gold" size="lg" icon={<Play size={13} strokeWidth={2} fill="currentColor" />}>
              Run First Simulation
            </GhostButton>
          </div>
        </div>
        <div className="flex justify-center gap-6 mb-7">
          {scores.map((s) => (
            <div key={s.label} className="flex flex-col items-center">
              <div className="flex items-center justify-center mb-2" style={{ width: 68, height: 68, borderRadius: '50%', border: '3px solid #505050' }}>
                <span style={{ fontSize: 20, fontWeight: 700, color: '#777777' }}>{s.value}</span>
              </div>
              <span style={{ fontSize: 11, fontWeight: 500, color: '#999999' }}>{s.label}</span>
            </div>
          ))}
        </div>
        <div className="flex items-start gap-2.5 text-left" style={{ background: '#383838', borderRadius: 12, padding: '14px 16px', border: '1px solid #4a4a4a' }}>
          <div className="flex items-center justify-center shrink-0" style={{ width: 24, height: 24, borderRadius: 7, background: '#444444', border: '1px solid #505050' }}>
            <Info size={12} strokeWidth={1.5} className="text-[#999999]" />
          </div>
          <span style={{ fontSize: 12, color: '#aaaaaa', lineHeight: 1.55 }}>Simulation requires at least 7 days of activity and 50+ observations to generate meaningful scores.</span>
        </div>
      </div>
    </div>
  );
}
