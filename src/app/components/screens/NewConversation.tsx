import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ChevronLeft, Send, ArrowRight, Loader2 } from 'lucide-react';
import { GhostButton } from '../ui/GhostButton';
import { useAuth } from '../../lib/auth-context';
import { api } from '../../lib/api';

export function NewConversation() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mode, setMode] = useState<'manual' | 'lead'>('manual');

  const [handle, setHandle] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState('restaurant');
  const [classification, setClassification] = useState('dojo_and_reeveos');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [leads, setLeads] = useState<any[]>([]);
  const [leadsLoading, setLeadsLoading] = useState(false);
  const [startingLeadId, setStartingLeadId] = useState<number | null>(null);

  useEffect(() => {
    if (mode === 'lead' && user) {
      setLeadsLoading(true);
      api.get('/dm/bridge-leads')
        .then((data) => setLeads(Array.isArray(data) ? data : []))
        .catch(() => setLeads([]))
        .finally(() => setLeadsLoading(false));
    }
  }, [mode, user]);

  const handleManualCreate = async () => {
    if (!handle.trim()) return;
    setCreating(true);
    setError(null);
    try {
      await api.post('/dm/conversations/manual', {
        prospectHandle: handle.trim().replace(/^@/, ''),
        prospectBusinessName: businessName.trim() || null,
        prospectBusinessType: businessType,
        classification,
      });
      navigate('/dm-approvals');
    } catch (err: any) {
      setError(err.message || 'Failed to create conversation');
    } finally {
      setCreating(false);
    }
  };

  const handleLeadStart = async (leadId: number) => {
    setStartingLeadId(leadId);
    setError(null);
    try {
      await api.post('/dm/conversations/from-lead', { bridgeLeadId: leadId });
      navigate('/dm-approvals');
    } catch (err: any) {
      setError(err.message || 'Failed to create conversation from lead');
    } finally {
      setStartingLeadId(null);
    }
  };

  const classLabel = (cl: string) =>
    cl === 'dojo_only' ? 'Dojo' : cl === 'reeveos_only' ? 'ReeveOS' : 'Both';

  const inputStyle: React.CSSProperties = {
    width: '100%', background: '#353535', color: '#e5e5e5',
    border: '1px solid #444444', borderRadius: 10, padding: '10px 14px',
    fontSize: 13, fontFamily: 'DM Sans, sans-serif', outline: 'none', boxSizing: 'border-box',
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div onClick={() => navigate('/dm-conversations')} style={{ cursor: 'pointer', color: '#999' }}>
          <ChevronLeft size={20} />
        </div>
        <h1 style={{ fontSize: 18, fontWeight: 800, color: '#e5e5e5' }}>New Conversation</h1>
      </div>

      <div className="flex gap-2 mb-6">
        {[
          { id: 'manual' as const, label: 'Manual Target', desc: 'Enter an Instagram handle directly' },
          { id: 'lead' as const, label: 'Bridge Leads', desc: 'Pick from ReeveOS Growth Hub' },
        ].map((m) => (
          <div key={m.id} onClick={() => setMode(m.id)}
            style={{ flex: 1, padding: '14px 16px', borderRadius: 14, cursor: 'pointer',
              background: mode === m.id ? 'rgba(212,168,83,0.08)' : '#383838',
              border: `1px solid ${mode === m.id ? 'rgba(212,168,83,0.4)' : '#4a4a4a'}` }}>
            <span style={{ fontSize: 13, fontWeight: 600,
              color: mode === m.id ? '#e5e5e5' : '#999', display: 'block', marginBottom: 2 }}>
              {m.label}
            </span>
            <span style={{ fontSize: 11, color: '#777' }}>{m.desc}</span>
          </div>
        ))}
      </div>

      {error && (
        <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
          borderRadius: 10, padding: '10px 16px', marginBottom: 16 }}>
          <span style={{ fontSize: 12, color: '#f87171' }}>{error}</span>
        </div>
      )}

      {mode === 'manual' ? (
        <div style={{ background: '#383838', borderRadius: 16, padding: 24, border: '1px solid #4a4a4a' }}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#ccc', marginBottom: 6 }}>
              Instagram Handle *
            </label>
            <div className="flex">
              <span style={{ background: '#2a2a2a', color: '#777', padding: '10px 12px', fontSize: 13,
                borderRadius: '10px 0 0 10px', border: '1px solid #444', borderRight: 'none' }}>@</span>
              <input value={handle} onChange={(e) => setHandle(e.target.value)}
                placeholder="bellavistanotts"
                style={{ ...inputStyle, borderRadius: '0 10px 10px 0' }} />
            </div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#ccc', marginBottom: 6 }}>
              Business Name
            </label>
            <input value={businessName} onChange={(e) => setBusinessName(e.target.value)}
              placeholder="Bella Vista Ristorante" style={inputStyle} />
          </div>
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#ccc', marginBottom: 6 }}>
                Business Type
              </label>
              <select value={businessType} onChange={(e) => setBusinessType(e.target.value)}
                style={{ ...inputStyle, cursor: 'pointer' }}>
                {['restaurant', 'salon', 'bar', 'cafe', 'barber', 'beauty', 'pub', 'takeaway', 'spa'].map((t) => (
                  <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#ccc', marginBottom: 6 }}>
                Classification
              </label>
              <select value={classification} onChange={(e) => setClassification(e.target.value)}
                style={{ ...inputStyle, cursor: 'pointer' }}>
                <option value="dojo_only">Dojo (Card Machine)</option>
                <option value="reeveos_only">ReeveOS (Website + Booking)</option>
                <option value="dojo_and_reeveos">Both</option>
              </select>
            </div>
          </div>
          <GhostButton variant="gold" size="md" icon={creating ?
            <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> :
            <Send size={13} strokeWidth={2} />}
            onClick={handleManualCreate} fullWidth disabled={!handle.trim() || creating}>
            {creating ? 'Creating...' : 'Create and Generate First DM'}
          </GhostButton>
          <p style={{ fontSize: 11, color: '#777', marginTop: 10, textAlign: 'center' }}>
            A DM draft will be auto-generated for your approval. Nothing sends without your say-so.
          </p>
        </div>
      ) : (
        <div style={{ background: '#383838', borderRadius: 16, padding: 24, border: '1px solid #4a4a4a' }}>
          <p style={{ fontSize: 13, color: '#999', marginBottom: 16 }}>
            Unassigned leads from ReeveOS Growth Hub with Instagram handles
          </p>
          {leadsLoading ? (
            <div style={{ textAlign: 'center', padding: 20 }}>
              <Loader2 size={20} style={{ color: '#d4a853', animation: 'spin 1s linear infinite', margin: '0 auto' }} />
            </div>
          ) : leads.length === 0 ? (
            <p style={{ fontSize: 12, color: '#777', textAlign: 'center', padding: 20 }}>
              No unassigned leads with Instagram handles. Push leads from ReeveOS Growth Hub first.
            </p>
          ) : (
            <div className="space-y-2">
              {leads.map((lead: any) => (
                <div key={lead.id} className="flex items-center justify-between"
                  style={{ padding: '12px 16px', borderRadius: 12, border: '1px solid #444', background: '#333' }}>
                  <div>
                    <div className="flex items-center gap-2">
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#e5e5e5' }}>
                        {lead.business_name}
                      </span>
                      <span style={{ fontSize: 9, fontWeight: 700, color: '#d4a853',
                        background: 'rgba(212,168,83,0.08)', borderRadius: 10, padding: '2px 8px' }}>
                        {classLabel(lead.classification)}
                      </span>
                    </div>
                    <div className="flex gap-2 mt-1">
                      <span style={{ fontSize: 11, color: '#777' }}>@{lead.instagram_handle}</span>
                      <span style={{ fontSize: 10, color: '#555' }}>{lead.business_type}</span>
                      {(lead.website_score || lead.social_score) && (
                        <span style={{ fontSize: 10, color: '#555', fontFamily: 'JetBrains Mono, monospace' }}>
                          Web:{lead.website_score || 0} Soc:{lead.social_score || 0}
                        </span>
                      )}
                    </div>
                  </div>
                  <GhostButton variant="glass" size="sm"
                    icon={startingLeadId === lead.id ?
                      <Loader2 size={11} style={{ animation: 'spin 1s linear infinite' }} /> :
                      <ArrowRight size={11} />}
                    onClick={() => handleLeadStart(lead.id)}
                    disabled={startingLeadId !== null}>
                    Start DM
                  </GhostButton>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
