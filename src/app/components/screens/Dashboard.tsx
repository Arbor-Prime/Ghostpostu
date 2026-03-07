import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Eye, Lightbulb, FileText, Send, Zap, TrendingUp, ArrowUpRight } from 'lucide-react';
import { GhostButton } from '../ui/GhostButton';

const stats = [
  { label: 'Tweets Scanned', value: '2,847', change: '+18%', up: true },
  { label: 'Opportunities Found', value: '142', change: '+9%', up: true },
  { label: 'Drafts Pending', value: '8', change: '-3%', up: false },
  { label: 'Replies Posted', value: '67', change: '+12%', up: true },
];
const chartData = [
  { day: 'Mon', scanned: 380, replies: 8 }, { day: 'Tue', scanned: 420, replies: 12 },
  { day: 'Wed', scanned: 510, replies: 15 }, { day: 'Thu', scanned: 390, replies: 9 },
  { day: 'Fri', scanned: 460, replies: 11 }, { day: 'Sat', scanned: 280, replies: 6 },
  { day: 'Sun', scanned: 350, replies: 8 },
];
const miniSparkline = [2, 5, 3, 7, 4, 8, 6, 9, 7, 11, 8, 10];
const recentActivity = [
  { icon: Eye, text: 'Scanned @elonmusk', time: '2m ago' },
  { icon: FileText, text: 'Draft generated for opportunity #47', time: '5m ago' },
  { icon: Send, text: 'Reply posted to @paulg', time: '12m ago' },
  { icon: Lightbulb, text: 'New opportunity from @naval', time: '18m ago' },
  { icon: Eye, text: 'Scanned @pmarca', time: '24m ago' },
  { icon: Send, text: 'Reply posted to @sama', time: '31m ago' },
];
const liveEvents = [
  { time: '14:32:01', text: 'WebSocket connected to scanner service' },
  { time: '14:32:05', text: 'Timeline scan cycle #847 started' },
  { time: '14:32:12', text: 'Processing 24 new tweets from tracked profiles' },
  { time: '14:32:18', text: 'Opportunity #148 scored 0.87 relevance' },
];

function MiniChart() {
  const max = Math.max(...miniSparkline);
  const pts = miniSparkline.map((v, i) => `${(i / (miniSparkline.length - 1)) * 80},${28 - (v / max) * 24}`).join(' ');
  return <svg width="80" height="28" viewBox="0 0 80 28"><polyline points={pts} fill="none" stroke="#d4a853" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

export function Dashboard() {
  return (
    <div className="space-y-4">
      {/* Stats */}
      <div style={{ background: '#383838', borderRadius: 16, padding: '22px 24px', border: '1px solid #4a4a4a' }}>
        <div className="flex items-center justify-between mb-1">
          <h2 style={{ fontSize: 15, fontWeight: 700, color: '#e5e5e5' }}>Outreach Intelligence</h2>
          <GhostButton variant="glass" size="sm" icon={<TrendingUp size={11} strokeWidth={1.5} />}>
            Filter
          </GhostButton>
        </div>
        <p style={{ fontSize: 12, color: '#999999', marginBottom: 14 }}>Real-time visibility into engagement — detect, compose, and act before the moment passes.</p>
        <div className="grid grid-cols-4 gap-3">
          {stats.map((stat) => (
            <div key={stat.label} style={{ background: '#2e2e2e', borderRadius: 14, padding: '16px 18px', border: '1px solid #444444' }}>
              <div className="flex items-start justify-between mb-3">
                <span style={{ fontSize: 12, fontWeight: 500, color: '#999999' }}>{stat.label}</span>
                <MiniChart />
              </div>
              <div className="flex items-end gap-2">
                <span style={{ fontSize: 24, fontWeight: 700, color: '#e5e5e5', letterSpacing: '-0.02em', lineHeight: 1 }}>{stat.value}</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: stat.up ? '#22c55e' : '#ef4444', marginBottom: 2 }}>{stat.change}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chart + sidebar */}
      <div className="grid grid-cols-[1fr_300px] gap-4">
        <div style={{ background: '#383838', borderRadius: 16, padding: '22px 22px 14px', border: '1px solid #4a4a4a' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 style={{ fontSize: 13, fontWeight: 700, color: '#e5e5e5' }}>Activity</h3>
            <GhostButton variant="outline" size="sm" icon={<ArrowUpRight size={11} strokeWidth={2} />}>
              View Report
            </GhostButton>
          </div>
          <ResponsiveContainer width="100%" height={210}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#4a4a4a" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#999999' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#999999' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#444444', border: '1px solid #555555', borderRadius: 10, fontSize: 12, color: '#e5e5e5', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }} />
              <Area key="scanned" type="monotone" dataKey="scanned" stroke="#d4a853" fill="#d4a853" fillOpacity={0.08} strokeWidth={2} />
              <Area key="replies" type="monotone" dataKey="replies" stroke="#4a90d9" fill="#4a90d9" fillOpacity={0.06} strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-3">
          <div style={{ background: '#383838', borderRadius: 14, padding: '14px 16px', border: '1px solid #4a4a4a' }}>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center" style={{ width: 34, height: 34, borderRadius: 10, background: '#b48ad6', border: 'none' }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'rgba(0,0,0,0.5)' }}>AP</span>
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#e5e5e5' }}>Afternoon Push</div>
                <div style={{ fontSize: 11, color: '#999999' }}>Efficient · Helpful · 65%</div>
              </div>
            </div>
          </div>

          <div style={{ background: '#383838', borderRadius: 14, padding: '14px 16px', border: '1px solid #4a4a4a' }}>
            <h3 className="mb-3" style={{ fontSize: 12, fontWeight: 700, color: '#e5e5e5' }}>Recent Activity</h3>
            <div className="space-y-2">
              {recentActivity.map((event, i) => {
                const Icon = event.icon;
                return (
                  <div key={i} className="flex items-center gap-2.5">
                    <div className="flex items-center justify-center shrink-0" style={{ width: 24, height: 24, borderRadius: 7, background: '#444444', border: '1px solid #505050' }}>
                      <Icon size={11} strokeWidth={1.5} className="text-[#999999]" />
                    </div>
                    <span className="flex-1 truncate" style={{ fontSize: 12, color: '#cccccc' }}>{event.text}</span>
                    <span className="shrink-0" style={{ fontSize: 10, color: '#888888' }}>{event.time}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Live Events */}
      <div style={{ background: '#383838', borderRadius: 14, padding: '16px 20px', border: '1px solid #4a4a4a' }}>
        <div className="flex items-center gap-2 mb-3">
          <Zap size={12} strokeWidth={1.5} className="text-[#d4a853]" />
          <h3 style={{ fontSize: 12, fontWeight: 700, color: '#e5e5e5' }}>Live Events</h3>
        </div>
        <div className="space-y-1.5">
          {liveEvents.map((event, i) => (
            <div key={i} className="flex items-center gap-3">
              <span style={{ fontSize: 11, fontWeight: 500, color: '#888888', fontVariantNumeric: 'tabular-nums' }}>{event.time}</span>
              <span style={{ fontSize: 12, color: '#aaaaaa' }}>{event.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
