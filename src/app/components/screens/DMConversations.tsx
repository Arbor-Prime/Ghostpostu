import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Plus, ChevronRight, Loader2 } from 'lucide-react';
import { GhostButton } from '../ui/GhostButton';
import { useAuth } from '../../lib/auth-context';
import { api } from '../../lib/api';

const STATE_CONFIG: Record<string, { label: string; color: string }> = {
  cold_outreach: { label: 'Cold Outreach', color: '#4a90d9' },
  follow_up_1: { label: 'Follow-up 1', color: '#8b5cf6' },
  follow_up_2: { label: 'Follow-up 2', color: '#a855f7' },
  warming: { label: 'Warming', color: '#f59e0b' },
  rapport: { label: 'Rapport', color: '#d4a853' },
  value_signal: { label: 'Value Signal', color: '#06b6d4' },
  soft_pitch: { label: 'Soft Pitch', color: '#22c55e' },
  completed: { label: 'Completed', color: '#22c55e' },
  rejected: { label: 'Rejected', color: '#ef4444' },
  dormant: { label: 'Dormant', color: '#555555' },
};

const classLabel = (cl: string) =>
  cl === 'dojo_only' ? 'Dojo' : cl === 'reeveos_only' ? 'ReeveOS' : 'Both';

export function DMConversations() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [funnel, setFunnel] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    Promise.all([
      api.get('/dm/conversations').catch(() => []),
      api.get('/results/stats').catch(() => null),
      api.get('/results/funnel').catch(() => []),
    ]).then(([convs, statsData, funnelData]) => {
      setConversations(Array.isArray(convs) ? convs : []);
      setStats(statsData);
      setFunnel(Array.isArray(funnelData) ? funnelData : []);
    }).finally(() => setLoading(false));
  }, [user]);

  const filtered = activeFilter
    ? conversations.filter((c: any) => c.state === activeFilter)
    : conversations;

  const getStateCount = (state: string) =>
    conversations.filter((c: any) => c.state === state).length;

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 60 }}>
        <Loader2 size={24} style={{ color: '#d4a853', animation: 'spin 1s linear infinite', margin: '0 auto' }} />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 800, color: '#e5e5e5', letterSpacing: '-0.02em' }}>
            DM Pipeline
          </h1>
          <p style={{ fontSize: 12, color: '#999999', marginTop: 2 }}>
            {conversations.length} conversation{conversations.length !== 1 ? 's' : ''} across all stages
          </p>
        </div>
        <GhostButton variant="gold" size="sm" icon={<Plus size={11} strokeWidth={2.5} />}
          onClick={() => navigate('/dm-conversations/new')}>
          New Conversation
        </GhostButton>
      </div>

      {stats && (
        <div className="grid grid-cols-4 gap-3 mb-5">
          {[
            { label: 'Active', value: stats.conversations?.active || 0, color: '#d4a853' },
            { label: 'DMs Sent', value: stats.messages?.dms_sent || 0, color: '#4a90d9' },
            { label: 'Replies', value: stats.messages?.replies_received || 0, color: '#22c55e' },
            { label: 'Pending', value: stats.messages?.pending_approval || 0, color: '#f59e0b' },
          ].map((s) => (
            <div key={s.label} style={{ background: '#2e2e2e', borderRadius: 14, padding: '16px 18px',
              border: '1px solid #444444' }}>
              <span style={{ fontSize: 12, fontWeight: 500, color: '#999' }}>{s.label}</span>
              <div style={{ fontSize: 24, fontWeight: 700, color: s.color, letterSpacing: '-0.02em',
                marginTop: 8, fontFamily: 'JetBrains Mono, monospace' }}>
                {s.value}
              </div>
            </div>
          ))}
        </div>
      )}

      {funnel.length > 0 && (
        <div style={{ background: '#383838', borderRadius: 14, padding: '16px 20px',
          border: '1px solid #4a4a4a', marginBottom: 20 }}>
          <h3 style={{ fontSize: 12, fontWeight: 700, color: '#e5e5e5', marginBottom: 12 }}>
            Conversion Funnel
          </h3>
          <div style={{ display: 'flex', gap: 4, alignItems: 'flex-end', height: 60 }}>
            {funnel.map((f: any) => {
              const cfg = STATE_CONFIG[f.state] || { color: '#555', label: f.state };
              const maxCount = Math.max(...funnel.map((x: any) => x.count));
              const height = maxCount > 0 ? Math.max(8, (f.count / maxCount) * 50) : 8;
              const isActive = activeFilter === f.state;
              return (
                <div key={f.state} style={{ flex: 1, display: 'flex', flexDirection: 'column',
                  alignItems: 'center', gap: 4, cursor: 'pointer' }}
                  onClick={() => setActiveFilter(isActive ? null : f.state)}>
                  <span style={{ fontSize: 12, fontWeight: 800, color: cfg.color,
                    fontFamily: 'JetBrains Mono, monospace' }}>{f.count}</span>
                  <div style={{ width: '100%', height, borderRadius: 4,
                    background: isActive ? cfg.color : `${cfg.color}40` }} />
                  <span style={{ fontSize: 7, fontWeight: 600, color: '#777',
                    textAlign: 'center', lineHeight: 1.1 }}>{cfg.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
        <div onClick={() => setActiveFilter(null)}
          style={{ borderRadius: 20, padding: '5px 14px', fontSize: 11, fontWeight: 700,
            cursor: 'pointer', background: !activeFilter ? 'rgba(229,229,229,0.1)' : 'transparent',
            color: !activeFilter ? '#e5e5e5' : '#777' }}>
          All ({conversations.length})
        </div>
        {Object.entries(STATE_CONFIG).map(([key, cfg]) => {
          const count = getStateCount(key);
          if (count === 0) return null;
          const isActive = activeFilter === key;
          return (
            <div key={key} onClick={() => setActiveFilter(isActive ? null : key)}
              style={{ borderRadius: 20, padding: '5px 14px', fontSize: 11, fontWeight: 700,
                cursor: 'pointer', background: isActive ? `${cfg.color}18` : 'transparent',
                color: isActive ? cfg.color : '#777' }}>
              {cfg.label} ({count})
            </div>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#777' }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: '#999', marginBottom: 8 }}>
            No conversations yet
          </p>
          <GhostButton variant="glass" size="md" icon={<Plus size={13} strokeWidth={2} />}
            onClick={() => navigate('/dm-conversations/new')}>
            Start First Conversation
          </GhostButton>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((conv: any) => {
            const si = STATE_CONFIG[conv.state] || { label: conv.state, color: '#999' };
            return (
              <div key={conv.id} onClick={() => navigate(`/dm-conversations/${conv.id}`)}
                className="cursor-pointer transition-all"
                style={{ background: '#383838', borderRadius: 14, padding: '14px 18px',
                  border: '1px solid #4a4a4a' }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center"
                      style={{ background: '#555' }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#ccc' }}>
                        {(conv.prospect_handle || '?')[0].toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#e5e5e5' }}>
                          @{conv.prospect_handle}
                        </span>
                        <span style={{ fontSize: 9, fontWeight: 700, color: '#d4a853',
                          background: 'rgba(212,168,83,0.08)', borderRadius: 10, padding: '2px 8px' }}>
                          {classLabel(conv.classification)}
                        </span>
                      </div>
                      <span style={{ fontSize: 11, color: '#777' }}>
                        {conv.prospect_business_name}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span style={{ fontSize: 11, color: '#777',
                      fontFamily: 'JetBrains Mono, monospace' }}>
                      {conv.messages_sent || 0}s {conv.messages_received || 0}r
                    </span>
                    <span style={{ fontSize: 10, fontWeight: 700, color: si.color,
                      background: `${si.color}15`, borderRadius: 20, padding: '4px 12px',
                      border: `1px solid ${si.color}25` }}>
                      {si.label}
                    </span>
                    <ChevronRight size={14} style={{ color: '#777' }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
