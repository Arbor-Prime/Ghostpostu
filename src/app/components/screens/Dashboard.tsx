import { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Eye, Lightbulb, FileText, Send, Zap, TrendingUp, ArrowUpRight } from 'lucide-react';
import { GhostButton } from '../ui/GhostButton';
import { useAuth } from '../../lib/auth-context';
import { api } from '../../lib/api';

function MiniChart({ data }: { data?: number[] }) {
  const d = data || [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  const max = Math.max(...d);
  if (max === 0) {
    return <svg width="80" height="28" viewBox="0 0 80 28"><line x1="0" y1="24" x2="80" y2="24" stroke="#555" strokeWidth="1.5" strokeLinecap="round" /></svg>;
  }
  const pts = d.map((v, i) => `${(i / (d.length - 1)) * 80},${28 - (v / max) * 24}`).join(' ');
  return <svg width="80" height="28" viewBox="0 0 80 28"><polyline points={pts} fill="none" stroke="#d4a853" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

export function Dashboard() {
  const { user } = useAuth();
  const [dashData, setDashData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    api.get('/stats/dashboard')
      .then(setDashData)
      .catch(() => {
        // Fallback: try individual endpoints
        Promise.all([
          api.get('/observer/stats').catch(() => ({})),
          api.get('/opportunities/stats').catch(() => ({})),
          api.get('/posted/stats').catch(() => ({})),
        ]).then(([obs, opps, posted]) => {
          setDashData({
            stats: {
              tweets_scanned: parseInt(obs.queue?.completed || '0'),
              opportunities_found: parseInt(opps.total || '0'),
              drafts_pending: parseInt(opps.drafted || '0'),
              replies_posted: parseInt(posted.total_posted || '0'),
            },
            chart: [],
          });
        });
      })
      .finally(() => setLoading(false));
  }, [user]);

  const stats = dashData ? [
    { label: 'Profiles Scanned', value: dashData.stats.tweets_scanned?.toLocaleString() || '0', icon: Eye },
    { label: 'Opportunities Found', value: dashData.stats.opportunities_found?.toLocaleString() || '0', icon: Lightbulb },
    { label: 'Drafts Pending', value: dashData.stats.drafts_pending?.toLocaleString() || '0', icon: FileText },
    { label: 'Messages Sent', value: dashData.stats.replies_posted?.toLocaleString() || '0', icon: Send },
  ] : [
    { label: 'Profiles Scanned', value: loading ? '...' : '0', icon: Eye },
    { label: 'Opportunities Found', value: loading ? '...' : '0', icon: Lightbulb },
    { label: 'Drafts Pending', value: loading ? '...' : '0', icon: FileText },
    { label: 'Messages Sent', value: loading ? '...' : '0', icon: Send },
  ];

  const chartData = dashData?.chart?.length ? dashData.chart : [
    { day: 'Mon', scanned: 0, replies: 0 }, { day: 'Tue', scanned: 0, replies: 0 },
    { day: 'Wed', scanned: 0, replies: 0 }, { day: 'Thu', scanned: 0, replies: 0 },
    { day: 'Fri', scanned: 0, replies: 0 }, { day: 'Sat', scanned: 0, replies: 0 },
    { day: 'Sun', scanned: 0, replies: 0 },
  ];

  return (
    <div className="space-y-4">
      <div style={{ background: '#383838', borderRadius: 16, padding: '22px 24px', border: '1px solid #4a4a4a' }}>
        <div className="flex items-center justify-between mb-1">
          <h2 style={{ fontSize: 15, fontWeight: 700, color: '#e5e5e5' }}>Outreach Intelligence</h2>
          <GhostButton variant="glass" size="sm" icon={<TrendingUp size={11} strokeWidth={1.5} />}>Filter</GhostButton>
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
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-[1fr_300px] gap-4">
        <div style={{ background: '#383838', borderRadius: 16, padding: '22px 22px 14px', border: '1px solid #4a4a4a' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 style={{ fontSize: 13, fontWeight: 700, color: '#e5e5e5' }}>Activity</h3>
            <GhostButton variant="outline" size="sm" icon={<ArrowUpRight size={11} strokeWidth={2} />}>View Report</GhostButton>
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
            <h3 className="mb-3" style={{ fontSize: 12, fontWeight: 700, color: '#e5e5e5' }}>System Status</h3>
            <div className="flex items-center gap-2.5">
              <div className="w-2 h-2 rounded-full" style={{ background: '#22c55e', boxShadow: '0 0 6px rgba(34,197,94,0.4)' }} />
              <span style={{ fontSize: 12, color: '#22c55e', fontWeight: 500 }}>All systems operational</span>
            </div>
          </div>

          <div style={{ background: '#383838', borderRadius: 14, padding: '14px 16px', border: '1px solid #4a4a4a' }}>
            <div className="flex items-center gap-2 mb-3">
              <Zap size={12} strokeWidth={1.5} style={{ color: '#d4a853' }} />
              <h3 style={{ fontSize: 12, fontWeight: 700, color: '#e5e5e5' }}>Quick Actions</h3>
            </div>
            <div className="space-y-2">
              <GhostButton variant="glass" size="sm" fullWidth onClick={() => window.location.href='/browser'}>Open Browser</GhostButton>
              <GhostButton variant="glass" size="sm" fullWidth onClick={() => window.location.href='/approvals'}>Review Drafts</GhostButton>
              <GhostButton variant="glass" size="sm" fullWidth onClick={() => window.location.href='/tracked-profiles'}>Manage Profiles</GhostButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
