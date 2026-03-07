import { useState, useEffect } from 'react';
import { Check, X, Edit3, RefreshCw, Heart, MessageCircle, Repeat2 } from 'lucide-react';
import { GhostButton } from '../ui/GhostButton';
import { useAuth } from '../../lib/auth-context';
import { api } from '../../lib/api';

type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected';

const filterConfig: { key: StatusFilter; label: string; color: string }[] = [
  { key: 'all', label: 'All', color: '#e5e5e5' },
  { key: 'pending', label: 'Pending', color: '#d4a853' },
  { key: 'approved', label: 'Approved', color: '#22c55e' },
  { key: 'rejected', label: 'Rejected', color: '#ef4444' },
];

export function Approvals() {
  const { user } = useAuth();
  const [filter, setFilter] = useState<StatusFilter>('pending');
  const [drafts, setDrafts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDrafts = async () => {
    if (!user) return;
    try {
      const status = filter === 'all' ? 'pending' : filter;
      const data = await api.get(`/drafts?status=${status}`);
      setDrafts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch drafts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDrafts(); }, [user, filter]);

  const handleApprove = async (id: number) => { await api.post(`/drafts/${id}/approve`); fetchDrafts(); };
  const handleReject = async (id: number) => { await api.post(`/drafts/${id}/reject`); fetchDrafts(); };
  const handleRegenerate = async (id: number) => { await api.post(`/drafts/${id}/regenerate`); fetchDrafts(); };

  return (
    <div>
      <div className="flex gap-2 mb-5">
        {filterConfig.map((f) => {
          const isActive = filter === f.key;
          return (
            <div key={f.key} onClick={() => setFilter(f.key)} className="cursor-pointer transition-all"
              style={{ borderRadius: 20, padding: '6px 16px', fontSize: 12, fontWeight: 700, letterSpacing: '-0.01em',
                background: isActive ? `${f.color}18` : 'transparent', color: isActive ? f.color : '#777777',
                border: isActive ? `1px solid ${f.color}35` : '1px solid transparent',
                boxShadow: isActive ? `0 0 12px ${f.color}15` : 'none' }}>
              <span className="flex items-center gap-1.5">
                {isActive && <span style={{ width: 5, height: 5, borderRadius: '50%', background: f.color, display: 'inline-block', boxShadow: `0 0 6px ${f.color}` }} />}
                {f.label}
              </span>
            </div>
          );
        })}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>Loading drafts...</div>
      ) : drafts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>No drafts found for this filter.</div>
      ) : (
        <div className="space-y-3">
          {drafts.map((draft) => (
            <div key={draft.id} style={{ background: '#383838', borderRadius: 16, border: '1px solid #4a4a4a', overflow: 'hidden' }}>
              <div style={{ padding: '18px 20px', borderBottom: '1px solid #4a4a4a' }}>
                <div className="flex items-center gap-2.5 mb-2.5">
                  <div className="w-7 h-7 rounded-full" style={{ background: '#555555' }} />
                  <span style={{ fontSize: 12, fontWeight: 500, color: '#999999' }}>@{draft.author_handle}</span>
                </div>
                <p style={{ fontSize: 13, color: '#cccccc', lineHeight: 1.6 }}>{draft.tweet_content}</p>
                <div className="flex gap-4 mt-2.5">
                  {[
                    { Icon: Heart, val: draft.engagement_likes?.toLocaleString() || '—' },
                    { Icon: MessageCircle, val: draft.engagement_replies?.toLocaleString() || '—' },
                    { Icon: Repeat2, val: draft.engagement_retweets?.toLocaleString() || '—' },
                  ].map(({ Icon, val }, i) => (
                    <span key={i} className="flex items-center gap-1" style={{ fontSize: 11, color: '#999999' }}><Icon size={12} strokeWidth={1.5} /> {val}</span>
                  ))}
                </div>
              </div>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #4a4a4a', background: '#404040' }}>
                <p style={{ fontSize: 13, fontWeight: 500, color: '#e5e5e5', lineHeight: 1.6 }}>{draft.reply_text}</p>
                <div className="flex gap-3 mt-2.5">
                  {[
                    `Type: ${draft.response_type || '—'}`,
                    `${draft.actual_word_count || '?'} words`,
                    `Mood: ${draft.circadian_mood || '—'}`,
                    `Energy: ${draft.energy_level ? Math.round(draft.energy_level * 100) + '%' : '—'}`,
                  ].map((m, i) => <span key={i} style={{ fontSize: 11, color: '#999999' }}>{m}</span>)}
                </div>
              </div>
              <div style={{ padding: '10px 20px', background: '#404040' }} className="flex gap-2">
                <GhostButton variant="success" size="sm" icon={<Check size={11} strokeWidth={2.5} />} onClick={() => handleApprove(draft.id)}>Approve</GhostButton>
                <GhostButton variant="danger" size="sm" icon={<X size={11} strokeWidth={2.5} />} onClick={() => handleReject(draft.id)}>Reject</GhostButton>
                <GhostButton variant="glass" size="sm" icon={<Edit3 size={11} strokeWidth={1.5} />}>Edit</GhostButton>
                <GhostButton variant="accent" size="sm" icon={<RefreshCw size={11} strokeWidth={1.5} />} onClick={() => handleRegenerate(draft.id)}>Regenerate</GhostButton>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
