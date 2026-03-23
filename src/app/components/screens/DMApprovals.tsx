import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Check, XCircle, Edit3, RefreshCw, Plus, CheckCircle, Loader2 } from 'lucide-react';
import { GhostButton } from '../ui/GhostButton';
import { useAuth } from '../../lib/auth-context';
import { api } from '../../lib/api';

export function DMApprovals() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState('');
  const [error, setError] = useState<string | null>(null);

  const fetchPending = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.get('/dm/pending');
      setMessages(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error('Failed to fetch pending DMs:', err);
      setError(err.message || 'Failed to load pending DMs');
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPending(); }, [user]);

  const handleApprove = async (id: number) => {
    setActionLoading(`approve-${id}`);
    try {
      await api.post(`/dm/${id}/approve`);
      fetchPending();
    } catch (err: any) {
      setError(err.message || 'Approve failed');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: number) => {
    setActionLoading(`reject-${id}`);
    try {
      await api.post(`/dm/${id}/reject`);
      fetchPending();
    } catch (err: any) {
      setError(err.message || 'Reject failed');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRegenerate = async (id: number) => {
    setActionLoading(`regen-${id}`);
    try {
      await api.post(`/dm/${id}/regenerate`);
      fetchPending();
    } catch (err: any) {
      setError(err.message || 'Regenerate failed');
    } finally {
      setActionLoading(null);
    }
  };

  const handleEdit = async (id: number) => {
    if (editingId === id && editText.trim()) {
      setActionLoading(`edit-${id}`);
      try {
        await api.post(`/dm/${id}/edit`, { editedText: editText.trim() });
        setEditingId(null);
        setEditText('');
        fetchPending();
      } catch (err: any) {
        setError(err.message || 'Edit failed');
      } finally {
        setActionLoading(null);
      }
    } else {
      const msg = messages.find(m => m.id === id);
      setEditingId(id);
      setEditText(msg?.content || '');
    }
  };

  const stateLabels: Record<string, { label: string; color: string }> = {
    cold_outreach: { label: 'Cold Outreach', color: '#4a90d9' },
    follow_up_1: { label: 'Follow-up 1', color: '#8b5cf6' },
    follow_up_2: { label: 'Follow-up 2', color: '#a855f7' },
    warming: { label: 'Warming', color: '#f59e0b' },
    rapport: { label: 'Rapport', color: '#d4a853' },
    value_signal: { label: 'Value Signal', color: '#06b6d4' },
    soft_pitch: { label: 'Soft Pitch', color: '#22c55e' },
  };

  const classLabel = (cl: string) =>
    cl === 'dojo_only' ? 'Dojo' :
    cl === 'reeveos_only' ? 'ReeveOS' :
    cl === 'dojo_and_reeveos' ? 'Both' : null;

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 800, color: '#e5e5e5', letterSpacing: '-0.02em' }}>
            Instagram DM Approvals
          </h1>
          <p style={{ fontSize: 12, color: '#999999', marginTop: 2 }}>
            Review and approve DM drafts before they are sent
          </p>
        </div>
        <GhostButton variant="gold" size="sm" icon={<Plus size={11} strokeWidth={2.5} />}
          onClick={() => navigate('/dm-conversations/new')}>
          New Conversation
        </GhostButton>
      </div>

      {error && (
        <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
          borderRadius: 10, padding: '10px 16px', marginBottom: 16 }}>
          <span style={{ fontSize: 12, color: '#f87171' }}>{error}</span>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <Loader2 size={24} style={{ color: '#d4a853', animation: 'spin 1s linear infinite', margin: '0 auto' }} />
          <p style={{ fontSize: 12, color: '#999', marginTop: 8 }}>Loading pending DMs...</p>
        </div>
      ) : messages.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60 }}>
          <CheckCircle size={32} strokeWidth={1} style={{ margin: '0 auto 12px', color: '#22c55e' }} />
          <p style={{ fontSize: 14, fontWeight: 600, color: '#999999' }}>All caught up</p>
          <p style={{ fontSize: 12, color: '#777777', marginTop: 4 }}>No pending DMs to review.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {messages.map((msg) => {
            const si = stateLabels[msg.state] || { label: msg.state, color: '#999' };
            const cl = classLabel(msg.classification);
            return (
              <div key={msg.id} style={{ background: '#383838', borderRadius: 16,
                border: '1px solid #4a4a4a', overflow: 'hidden' }}>
                <div style={{ padding: '14px 20px', borderBottom: '1px solid #4a4a4a' }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center"
                        style={{ background: '#555555' }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: '#ccc' }}>
                          {(msg.prospect_handle || '?')[0].toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#e5e5e5' }}>
                          @{msg.prospect_handle}
                        </span>
                        {msg.prospect_business_name && (
                          <span style={{ fontSize: 11, color: '#999', marginLeft: 8 }}>
                            {msg.prospect_business_name}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1.5">
                      {cl && (
                        <span style={{ fontSize: 10, fontWeight: 700, color: '#d4a853',
                          background: 'rgba(212,168,83,0.1)', borderRadius: 20, padding: '3px 10px' }}>
                          {cl}
                        </span>
                      )}
                      <span style={{ fontSize: 10, fontWeight: 700, color: si.color,
                        background: `${si.color}18`, borderRadius: 20, padding: '3px 10px',
                        border: `1px solid ${si.color}30` }}>
                        {si.label}
                      </span>
                    </div>
                  </div>
                </div>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid #4a4a4a', background: '#404040' }}>
                  {editingId === msg.id ? (
                    <textarea value={editText} onChange={(e) => setEditText(e.target.value)}
                      style={{ width: '100%', minHeight: 80, background: '#353535', color: '#e5e5e5',
                        border: '1px solid #d4a853', borderRadius: 10, padding: '10px 14px',
                        fontSize: 13, fontFamily: 'DM Sans, sans-serif', resize: 'vertical',
                        outline: 'none', boxSizing: 'border-box' }} />
                  ) : (
                    <p style={{ fontSize: 13, fontWeight: 500, color: '#e5e5e5', lineHeight: 1.6, margin: 0 }}>
                      {msg.content}
                    </p>
                  )}
                  <div className="flex gap-3 mt-2.5">
                    <span style={{ fontSize: 11, color: '#999', fontFamily: 'JetBrains Mono, monospace' }}>
                      Stage: {msg.state_at_send || msg.state}
                    </span>
                    {msg.created_at && (
                      <span style={{ fontSize: 11, color: '#777', fontFamily: 'JetBrains Mono, monospace' }}>
                        {new Date(msg.created_at).toLocaleString('en-GB',
                          { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ padding: '10px 20px', background: '#404040' }} className="flex gap-2">
                  <GhostButton variant="success" size="sm"
                    icon={actionLoading === `approve-${msg.id}` ?
                      <Loader2 size={11} style={{ animation: 'spin 1s linear infinite' }} /> :
                      <Check size={11} strokeWidth={2.5} />}
                    onClick={() => handleApprove(msg.id)}
                    disabled={actionLoading !== null}>
                    Approve
                  </GhostButton>
                  <GhostButton variant="danger" size="sm"
                    icon={<XCircle size={11} strokeWidth={2} />}
                    onClick={() => handleReject(msg.id)}
                    disabled={actionLoading !== null}>
                    Reject
                  </GhostButton>
                  <GhostButton variant="glass" size="sm"
                    icon={<Edit3 size={11} strokeWidth={1.5} />}
                    onClick={() => handleEdit(msg.id)}>
                    {editingId === msg.id ? 'Save and Send' : 'Edit'}
                  </GhostButton>
                  <GhostButton variant="accent" size="sm"
                    icon={actionLoading === `regen-${msg.id}` ?
                      <Loader2 size={11} style={{ animation: 'spin 1s linear infinite' }} /> :
                      <RefreshCw size={11} strokeWidth={1.5} />}
                    onClick={() => handleRegenerate(msg.id)}
                    disabled={actionLoading !== null}>
                    Regenerate
                  </GhostButton>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
