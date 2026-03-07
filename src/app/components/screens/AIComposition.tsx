import { ChevronDown, Sparkles } from 'lucide-react';
import { GhostButton } from '../ui/GhostButton';

const topicBreakdown = [
  { topic: 'AI and Machine Learning', percentage: 40, color: '#d4a853' },
  { topic: 'Developer Tools', percentage: 30, color: '#4a90d9' },
  { topic: 'Startups & Funding', percentage: 15, color: '#d4a853' },
  { topic: 'Product Strategy', percentage: 10, color: '#4a90d9' },
  { topic: 'Other', percentage: 5, color: '#999999' },
];
const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const timeBlocks = ['6am', '9am', '12pm', '3pm', '6pm', '9pm', '12am'];
const personaColors = [
  '#e89aad', '#6dc992', '#e0c064', '#b48ad6', '#a0a0b4', '#e09868', '#d08080',
];
const heatmapData = [
  [0.1, 0.2, 0.8, 0.9, 0.7, 0.3, 0.1], [0.1, 0.3, 0.7, 0.6, 0.8, 0.4, 0.2],
  [0.2, 0.4, 0.9, 0.7, 0.6, 0.3, 0.1], [0.1, 0.2, 0.5, 0.6, 0.9, 0.5, 0.3],
  [0.1, 0.3, 0.6, 0.5, 0.7, 0.8, 0.4], [0.0, 0.1, 0.3, 0.2, 0.4, 0.6, 0.2],
  [0.0, 0.1, 0.2, 0.2, 0.3, 0.5, 0.3],
];

export function AIComposition() {
  return (
    <div className="space-y-4">
      <div style={{ background: '#383838', borderRadius: 16, padding: '22px 24px', border: '1px solid #4a4a4a' }}>
        <h3 className="mb-5" style={{ fontSize: 13, fontWeight: 700, color: '#e5e5e5' }}>Content Theme Breakdown</h3>
        <div className="space-y-4">
          {topicBreakdown.map((item) => (
            <div key={item.topic}>
              <div className="flex justify-between mb-1.5">
                <span style={{ fontSize: 12, fontWeight: 500, color: '#cccccc' }}>{item.topic}</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#999999' }}>{item.percentage}%</span>
              </div>
              <div className="w-full h-2" style={{ borderRadius: 4, background: '#4a4a4a' }}>
                <div className="h-full" style={{ width: `${item.percentage}%`, backgroundColor: item.color, borderRadius: 4 }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: '#383838', borderRadius: 16, padding: '22px 24px', border: '1px solid #4a4a4a' }}>
        <h3 className="mb-5" style={{ fontSize: 13, fontWeight: 700, color: '#e5e5e5' }}>Posting Activity Heatmap</h3>
        <div>
          <div className="flex mb-2"><div className="w-10" />{timeBlocks.map((t) => <div key={t} className="flex-1 text-center" style={{ fontSize: 10, color: '#999999', fontWeight: 500 }}>{t}</div>)}</div>
          {days.map((day, di) => (
            <div key={day} className="flex items-center mb-1">
              <div className="w-10" style={{ fontSize: 11, fontWeight: 500, color: '#999999' }}>{day}</div>
              {timeBlocks.map((_, ti) => {
                const intensity = heatmapData[di][ti];
                const baseColor = personaColors[ti];
                const r = parseInt(baseColor.slice(1, 3), 16);
                const g = parseInt(baseColor.slice(3, 5), 16);
                const b = parseInt(baseColor.slice(5, 7), 16);
                return <div key={ti} className="flex-1 px-0.5"><div style={{ height: 26, borderRadius: 5, backgroundColor: intensity > 0 ? `rgba(${r}, ${g}, ${b}, ${Math.max(intensity * 0.85, 0.12)})` : '#3a3a3a', border: '1px solid rgba(255,255,255,0.04)' }} /></div>;
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Generate section */}
      <div style={{ background: '#404040', borderRadius: 16, padding: '22px 24px', border: '1px solid #505050' }}>
        <h3 className="mb-5" style={{ fontSize: 13, fontWeight: 700, color: '#e5e5e5' }}>Generate New Draft</h3>
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { label: 'Target Profile', type: 'select', options: ['@elonmusk', '@paulg', '@naval'] },
            { label: 'Response Type', type: 'select', options: ['Standard', 'Witty', 'Insightful', 'Supportive'] },
            { label: 'Tweet URL', type: 'input', placeholder: 'Paste tweet URL...' },
          ].map((field) => (
            <div key={field.label}>
              <label className="block mb-1.5" style={{ fontSize: 11, fontWeight: 600, color: '#cccccc' }}>{field.label}</label>
              {field.type === 'select' ? (
                <div className="relative">
                  <select className="w-full appearance-none focus:outline-none text-[#e5e5e5] cursor-pointer" style={{ background: '#353535', border: '1px solid #4a4a4a', borderRadius: 10, padding: '9px 14px', fontSize: 12 }}>
                    {field.options?.map((o) => <option key={o}>{o}</option>)}
                  </select>
                  <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#999999] pointer-events-none" />
                </div>
              ) : (
                <input type="text" placeholder={field.placeholder} className="w-full placeholder:text-[#777777] text-[#e5e5e5] focus:outline-none transition-colors" style={{ background: '#353535', border: '1px solid #4a4a4a', borderRadius: 10, padding: '9px 14px', fontSize: 12 }} onFocus={(e) => e.target.style.borderColor = '#d4a853'} onBlur={(e) => e.target.style.borderColor = '#4a4a4a'} />
              )}
            </div>
          ))}
        </div>
        <GhostButton variant="gold" size="lg" icon={<Sparkles size={14} strokeWidth={1.5} />}>
          Generate Draft
        </GhostButton>
      </div>
    </div>
  );
}
