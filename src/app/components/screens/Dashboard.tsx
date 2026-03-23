import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { io } from 'socket.io-client';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Eye, Lightbulb, FileText, Send, Zap, TrendingUp, ArrowUpRight, MessageSquare, GitBranch, CheckCircle } from 'lucide-react';
import { GhostButton } from '../ui/GhostButton';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/auth-context';

const miniSparkline = [2, 5, 3, 7, 4, 8, 6, 9, 7, 11, 8, 10];

function MiniChart() {
  const max = Math.max(...miniSparkline);
  const pts = miniSparkline.map((v, i) => `${(i / (miniSparkline.length - 1)) * 80},${28 - (v / max) * 24}`).join(' ');
  return <svg width="80" height="28" viewBox="0 0 80 28"><polyline points={pts} fill="none" stroke="#d4a853" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

const DM_STATE_CONFIG: Record<string, { label: string; color: string }> = {
  cold_outreach: { label: 'Cold', color: '#4a90d9' },
  follow_up_1: { label: 'FU1', color: '#8b5cf6' },
  follow_up_2: { label: 'FU2', color: '#a855f7' },
  warming: { label: 'Warm', color: '#f59e0b' },
  rapport: { label: 'Rapport', color: '#d4a853' },
  value_signal: { label: 'Value', color: '#06b6d4' },
  soft_pitch: { label: 'Pitch', color: '#22c55e' },
  completed: { label: 'Done', color: '#22c55e' },
  rejected: { label: 'Rejected', color: '#ef4444' },
  dormant: { label: 'Dormant', color: '#555' },
};

export function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dashData, setDashData] = useState<any>(null);
  const [liveEvts, setLiveEvts] = useState<{ time: string; text: string }[]>([]);

  const [dmStats, setDmStats] = useState<any>(null);
  const [dmFunnel, setDmFunnel] = useState<any[]>([]);
  const [dmActivity, setDmActivity] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    api.get('/stats/dashboard').then(setDashData).catch(console.error);

    Promise.all([
      api.get('/results/stats').catch(() => null),
      api.get('/results/funnel').catch(() => []),
      api.get('/results/activity').catch(() => []),
    ]).then(([stats, funnel, activity]) => {
      setDmStats(stats);
      setDmFunnel(Array.isArray(funnel) ? funnel : []);
      setDmActivity(Array.isArray(activity) ? activity : []);
    });
  }, [user]);

  useEffect(() => {
    const socket = io({ path: '/socket.io' });
    socket.on('observer:tweet_found', (e: any) => {
      setLiveEvts((prev) => [{ time: new Date().toLocaleTimeString('en-GB'), text: `Scanned tweet from @${e.author || 'unknown'}` }, ...prev].slice(0, 10));
    });
    socket.on('draft:generated', (e: any) => {
      setLiveEvts((prev) => [{ time: new Date().toLocaleTimeString('en-GB'), text: `Draft generated for opportunity #${e.opportunityId || '?'}` }, ...prev].slice(0, 10));
    });
    socket.on('reply:posted', (e: any) => {
      setLiveEvts((prev) => [{ time: new Date().toLocaleTimeString('en-GB'), text: `Reply posted to @${e.author || 'unknown'}` }, ...prev].slice(0, 10));
    });
    socket.on('dm:draft_generated', (e: any) => {
      setLiveEvts((prev) => [{ time: new Date().toLocaleTimeString('en-GB'), text: `DM draft generated for conversation #${e.conversationId || '?'}` }, ...prev].slice(0, 10));
    });
    socket.on('dm:sent', (e: any) => {
      setLiveEvts((prev) => [{ time: new Date().toLocaleTimeString('en-GB'), text: `DM sent in conversation #${e.conversationId || '?'}` }, ...prev].slice(0, 10));
    });
    socket.on('dm:reply_received', (e: any) => {
      setLiveEvts((prev) => [{ time: new Date().toLocaleTimeString('en-GB'), text: `DM reply received in conversation #${e.conversationId || '?'}` }, ...prev].slice(0, 10));
    });
    return () => { socket.disconnect(); };
  }, []);

  const stats = dashData ? [
    { label: 'Tweets Scanned', value: dashData.stats.tweets_scanned.toLocaleString(), change: '', up: true },
    { label: 'Opportunities Found', value: dashData.stats.opportunities_found.toLocaleString(), change: '', up: true },
    { label: 'Drafts Pending', value: dashData.stats.drafts_pending.toLocaleString(), change: '', up: false },
    { label: 'Replies Posted', value: dashData.stats.replies_posted.toLocaleString(), change: '', up: true },
  ] : [
    { label: 'Tweets Scanned', value: '—', change: '', up: true },
    { label: 'Opportunities Found', value: '—', change: '', up: true },
    { label: 'Drafts Pending', value: '—', change: '', up: false },
    { label: 'Replies Posted', value: '—', change: '', up: true },
  ];

  const chartData = dashData?.chart || [];
  const recentActivity = liveEvts.length > 0 ? liveEvts.map((e) => ({ icon: Eye, text: e.text, time: e.time })) : [
    { icon: Eye, text: 'Waiting for activity...', time: '—' },
  ] as { icon: typeof Eye; text: string; time: string }[];
  const liveEvents = liveEvts.length > 0 ? liveEvts : [{ time: '—', text: 'Waiting for live events...' }];

  return (
    <div className="space-y-4">
      {/* X Stats */}
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

      {/* Instagram DM Stats */}
      <div style={{ background: '#383838', borderRadius: 16, padding: '22px 24px', border: '1px solid #4a4a4a' }}>
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <MessageSquare size={15} strokeWidth={1.5} style={{ color: '#d4a853' }} />
            <h2 style={{ fontSize: 15, fontWeight: 700, color: '#e5e5e5' }}>Instagram DM Pipeline</h2>
          </div>
          <div className="flex gap-2">
            <GhostButton variant="glass" size="sm" icon={<CheckCircle size={11} strokeWidth={1.5} />}
              onClick={() => navigate('/dm-approvals')}>
              Review Drafts
            </GhostButton>
            <GhostButton variant="outline" size="sm" icon={<GitBranch size={11} strokeWidth={1.5} />}
              onClick={() => navigate('/dm-conversations')}>
              Pipeline
            </GhostButton>
          </div>
        </div>
        <p style={{ fontSize: 12, color: '#999999', marginBottom: 14 }}>
          Autonomous Instagram DM outreach — conversations, approvals, and reply tracking.
        </p>

        {dmStats && (
          <div className="grid grid-cols-4 gap-3 mb-4">
            {[
              { label: 'Active Convos', value: dmStats.conversations?.active || 0, color: '#d4a853' },
              { label: 'DMs Sent', value: dmStats.messages?.dms_sent || 0, color: '#4a90d9' },
              { label: 'Replies In', value: dmStats.messages?.replies_received || 0, color: '#22c55e' },
              { label: 'Pending Approval', value: dmStats.messages?.pending_approval || 0, color: '#f59e0b' },
            ].map((s) => (
              <div key={s.label} style={{ background: '#2e2e2e', borderRadius: 14, padding: '14px 16px',
                border: '1px solid #444444' }}>
                <span style={{ fontSize: 11, fontWeight: 500, color: '#999' }}>{s.label}</span>
                <div style={{ fontSize: 22, fontWeight: 700, color: s.color, letterSpacing: '-0.02em',
                  marginTop: 6, fontFamily: 'JetBrains Mono, monospace' }}>
                  {s.value}
                </div>
              </div>
            ))}
          </div>
        )}

        {dmFunnel.length > 0 && (
          <div style={{ background: '#2e2e2e', borderRadius: 12, padding: '14px 18px',
            border: '1px solid #444', marginBottom: 14 }}>
            <h4 style={{ fontSize: 11, fontWeight: 700, color: '#999', marginBottom: 10 }}>
              Conversation Funnel
            </h4>
            <div style={{ display: 'flex', gap: 4, alignItems: 'flex-end', height: 44 }}>
              {dmFunnel.map((f: any) => {
                const cfg = DM_STATE_CONFIG[f.state] || { color: '#555', label: f.state };
                const maxCount = Math.max(...dmFunnel.map((x: any) => x.count), 1);
                const height = Math.max(6, (f.count / maxCount) * 36);
                return (
                  <div key={f.state} style={{ flex: 1, display: 'flex', flexDirection: 'column',
                    alignItems: 'center', gap: 3 }}>
                    <span style={{ fontSize: 10, fontWeight: 800, color: cfg.color,
                      fontFamily: 'JetBrains Mono, monospace' }}>{f.count}</span>
                    <div style={{ width: '100%', height, borderRadius: 3, background: `${cfg.color}50` }} />
                    <span style={{ fontSize: 7, fontWeight: 600, color: '#666', textAlign: 'center' }}>
                      {cfg.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {dmActivity.length > 0 && (
          <div>
            <h4 style={{ fontSize: 11, fontWeight: 700, color: '#999', marginBottom: 8 }}>Recent DM Activity</h4>
            <div className="space-y-1.5">
              {dmActivity.slice(0, 5).map((a: any, i: number) => (
                <div key={i} className="flex items-center gap-3">
                  <span style={{ fontSize: 10, color: '#666', fontFamily: 'JetBrains Mono, monospace', minWidth: 50 }}>
                    {a.created_at ? new Date(a.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : '—'}
                  </span>
                  <span style={{ fontSize: 10, fontWeight: 700, borderRadius: 4, padding: '1px 6px',
                    color: a.direction === 'outbound' ? '#4a90d9' : '#22c55e',
                    background: a.direction === 'outbound' ? 'rgba(74,144,217,0.1)' : 'rgba(34,197,94,0.1)' }}>
                    {a.direction === 'outbound' ? 'SENT' : 'RECV'}
                  </span>
                  <span style={{ fontSize: 11, color: '#aaa', flex: 1 }} className="truncate">
                    {a.content?.slice(0, 60)}{(a.content?.length || 0) > 60 ? '...' : ''}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {!dmStats && (
          <div style={{ textAlign: 'center', padding: 20 }}>
            <p style={{ fontSize: 12, color: '#666' }}>Connect your Instagram account in Settings to start DM outreach.</p>
            <GhostButton variant="glass" size="sm" onClick={() => navigate('/settings')}>
              Go to Settings
            </GhostButton>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-3">
        <div onClick={() => navigate('/dm-approvals')} className="cursor-pointer"
          style={{ background: '#383838', borderRadius: 14, padding: '16px 18px',
            border: '1px solid #4a4a4a' }}>
          <MessageSquare size={16} strokeWidth={1.5} style={{ color: '#d4a853', marginBottom: 8 }} />
          <span style={{ fontSize: 12, fontWeight: 600, color: '#e5e5e5', display: 'block' }}>Review DM Drafts</span>
          <span style={{ fontSize: 11, color: '#777' }}>Approve or edit pending messages</span>
        </div>
        <div onClick={() => navigate('/dm-conversations/new')} className="cursor-pointer"
          style={{ background: '#383838', borderRadius: 14, padding: '16px 18px',
            border: '1px solid #4a4a4a' }}>
          <Send size={16} strokeWidth={1.5} style={{ color: '#4a90d9', marginBottom: 8 }} />
          <span style={{ fontSize: 12, fontWeight: 600, color: '#e5e5e5', display: 'block' }}>New DM Conversation</span>
          <span style={{ fontSize: 11, color: '#777' }}>Target a prospect or pick a lead</span>
        </div>
        <div onClick={() => navigate('/dm-conversations')} className="cursor-pointer"
          style={{ background: '#383838', borderRadius: 14, padding: '16px 18px',
            border: '1px solid #4a4a4a' }}>
          <GitBranch size={16} strokeWidth={1.5} style={{ color: '#22c55e', marginBottom: 8 }} />
          <span style={{ fontSize: 12, fontWeight: 600, color: '#e5e5e5', display: 'block' }}>View Pipeline</span>
          <span style={{ fontSize: 11, color: '#777' }}>Track all conversations by stage</span>
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

      {/* System Status */}
      <div style={{ background: '#383838', borderRadius: 14, padding: '16px 20px', border: '1px solid #4a4a4a' }}>
        <h3 style={{ fontSize: 12, fontWeight: 700, color: '#e5e5e5', marginBottom: 10 }}>System Status</h3>
        <div className="grid grid-cols-3 gap-2">
          {[
            { name: 'Database', status: 'running' },
            { name: 'Redis', status: 'running' },
            { name: 'Ollama', status: 'running' },
            { name: 'Playwright', status: 'running' },
            { name: 'DM Scheduler', status: 'running' },
            { name: 'Reply Checker', status: 'running' },
          ].map((s) => (
            <div key={s.name} className="flex items-center gap-2"
              style={{ padding: '8px 12px', background: '#2e2e2e', borderRadius: 8, border: '1px solid #444' }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%',
                background: s.status === 'running' ? '#22c55e' : '#ef4444',
                boxShadow: s.status === 'running' ? '0 0 4px rgba(34,197,94,0.4)' : '0 0 4px rgba(239,68,68,0.4)' }} />
              <span style={{ fontSize: 11, color: '#aaa' }}>{s.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
