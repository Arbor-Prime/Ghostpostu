import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ChevronLeft, RefreshCw, Loader2 } from 'lucide-react';
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

const PIPE_STATES = ['cold_outreach', 'warming', 'rapport', 'value_signal', 'soft_pitch', 'completed'];
const ALL_STATES = ['cold_outreach', 'follow_up_1', 'follow_up_2', 'warming', 'rapport', 'value_signal', 'soft_pitch', 'completed'];

const classLabel = (cl: string) =>
  cl === 'dojo_only' ? 'Dojo' : cl === 'reeveos_only' ? 'ReeveOS' : 'Both';

export function DMConversationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [conversation, setConversation] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [genLoading, setGenLoading] = useState(false);
  const [stateMenuOpen, setStateMenuOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    if (!user || !id) return;
    setLoading(true);
    try {
      const [convs, msgs] = await Promise.all([
        api.get('/dm/conversations'),
        api.get(`/dm/conversations/${id}/messages`),
      ]);
      const conv = (Array.isArray(convs) ? convs : []).find((c: any) => c.id === Number(id));
      setConversation(conv || null);
      setMessages(Array.isArray(msgs) ? msgs : []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [user, id]);

  const handleGenerate = async () => {
    if (!id) return;
    setGenLoading(true);
    try {
      await api.post('/dm/generate', { conversationId: Number(id) });
      navigate('/dm-approvals');
    } catch (err: any) {
      setError(err.message || 'Generate failed');
    } finally {
      setGenLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 60 }}>
        <Loader2 size={24} style={{ color: '#d4a853', animation: 'spin 1s linear infinite', margin: '0 auto' }} />
      </div>
    );
  }

  if (!conversation) {
    return (
      <div style={{ padding: 40, color: '#999' }}>
        <p>Conversation not found.</p>
        <GhostButton variant="glass" size="sm" onClick={() => navigate('/dm-conversations')}>
          Back to Pipeline
        </GhostButton>
      </div>
    );
  }

  const si = STATE_CONFIG[conversation.state] || { label: conversation.state, color: '#999' };
  const stateIdx = ALL_STATES.indexOf(conversation.state);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="flex items-center gap-3 mb-4">
        <div onClick={() => navigate('/dm-conversations')} style={{ cursor: 'pointer', color: '#999' }}>
          <ChevronLeft size={20} />
        </div>
        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: '#555' }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: '#ccc' }}>
            {(conversation.prospect_handle || '?')[0].toUpperCase()}
          </span>
        </div>
        <div style={{ flex: 1 }}>
          <div className="flex items-center gap-2">
            <span style={{ fontSize: 16, fontWeight: 700, color: '#e5e5e5' }}>
              @{conversation.prospect_handle}
            </span>
            <span style={{ fontSize: 10, fontWeight: 700, color: '#d4a853',
              background: 'rgba(212,168,83,0.08)', borderRadius: 10, padding: '2px 8px' }}>
              {classLabel(conversation.classification)}
            </span>
            <div style={{ position: 'relative' }}>
              <div onClick={() => setStateMenuOpen(!stateMenuOpen)} style={{ cursor: 'pointer' }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: si.color,
                  background: `${si.color}18`, borderRadius: 20, padding: '3px 10px',
                  border: `1px solid ${si.color}30` }}>
                  {si.label}
                </span>
              </div>
              {stateMenuOpen && (
                <div style={{ position: 'absolute', top: 24, left: 0, background: '#383838',
                  border: '1px solid #4a4a4a', borderRadius: 10, padding: 6, zIndex: 50,
                  minWidth: 150 }}>
                  {Object.entries(STATE_CONFIG).map(([key, cfg]) => (
                    <div key={key} onClick={() => setStateMenuOpen(false)}
                      style={{ padding: '6px 10px', fontSize: 11, color: cfg.color,
                        cursor: 'pointer', borderRadius: 6 }}>
                      {cfg.label}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <span style={{ fontSize: 12, color: '#777' }}>
            {conversation.prospect_business_name} — {conversation.prospect_business_type}
          </span>
        </div>
        <GhostButton variant="glass" size="sm"
          icon={genLoading ?
            <Loader2 size={11} style={{ animation: 'spin 1s linear infinite' }} /> :
            <RefreshCw size={11} strokeWidth={1.5} />}
          onClick={handleGenerate} disabled={genLoading}>
          Generate Reply
        </GhostButton>
      </div>

      {error && (
        <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
          borderRadius: 10, padding: '8px 14px', marginBottom: 12 }}>
          <span style={{ fontSize: 11, color: '#f87171' }}>{error}</span>
        </div>
      )}

      <div style={{ display: 'flex', gap: 2, marginBottom: 20 }}>
        {PIPE_STATES.map((s) => {
          const cfg = STATE_CONFIG[s];
          const thisIdx = ALL_STATES.indexOf(s);
          const isPast = thisIdx <= stateIdx;
          const isCurrent = s === conversation.state ||
            (conversation.state.startsWith('follow_up') && s === 'cold_outreach');
          return (
            <div key={s} style={{ flex: 1, height: 4, borderRadius: 2,
              background: isPast ? cfg.color : `${cfg.color}20`, position: 'relative' }}>
              {isCurrent && (
                <div style={{ position: 'absolute', top: -3, left: '50%', transform: 'translateX(-50%)',
                  width: 10, height: 10, borderRadius: '50%', background: cfg.color,
                  boxShadow: `0 0 8px ${cfg.color}60` }} />
              )}
            </div>
          );
        })}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column',
        gap: 12, paddingBottom: 20 }}>
        {messages.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#777' }}>
            <p style={{ fontSize: 13 }}>No messages yet. Hit Generate Reply to create the first draft.</p>
          </div>
        ) : messages.map((msg: any) => (
          <div key={msg.id} style={{ display: 'flex',
            justifyContent: msg.direction === 'outbound' ? 'flex-end' : 'flex-start' }}>
            <div style={{ maxWidth: '70%', padding: '12px 16px', borderRadius: 16,
              background: msg.direction === 'outbound' ? 'rgba(212,168,83,0.12)' : '#383838',
              border: `1px solid ${msg.direction === 'outbound' ? 'rgba(212,168,83,0.2)' : '#4a4a4a'}`,
              borderBottomRightRadius: msg.direction === 'outbound' ? 4 : 16,
              borderBottomLeftRadius: msg.direction === 'inbound' ? 4 : 16 }}>
              <p style={{ fontSize: 13, color: '#e5e5e5', lineHeight: 1.6, margin: 0 }}>
                {msg.content}
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                <span style={{ fontSize: 10, color: '#777', fontFamily: 'JetBrains Mono, monospace' }}>
                  {msg.sent_at && new Date(msg.sent_at).toLocaleString('en-GB',
                    { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </span>
                {msg.direction === 'outbound' && (
                  <span style={{ fontSize: 10, marginLeft: 8,
                    color: msg.status === 'sent' ? '#22c55e' :
                           msg.status === 'failed' ? '#ef4444' : '#777' }}>
                    {msg.status === 'sent' ? 'Sent' :
                     msg.status === 'failed' ? 'Failed' : msg.status}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
