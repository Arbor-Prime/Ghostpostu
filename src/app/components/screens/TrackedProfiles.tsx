import { useState, useEffect } from 'react';
import { Plus, Search, Play, MoreVertical } from 'lucide-react';
import { GhostButton } from '../ui/GhostButton';
import { useAuth } from '../../lib/auth-context';
import { api } from '../../lib/api';

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return 'Never';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function TrackedProfiles() {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchProfiles = async () => {
    if (!user) return;
    try {
      const data = await api.get('/tracked-profiles');
      setProfiles(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch profiles:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProfiles(); }, [user]);

  const [showAdd, setShowAdd] = useState(false);
  const [newHandle, setNewHandle] = useState('');
  const [adding, setAdding] = useState(false);

  const handleAdd = async () => {
    if (!newHandle.trim() || !user) return;
    setAdding(true);
    try {
      await api.post('/tracked-profiles', { x_handle: newHandle.trim().replace('@', '') });
      setNewHandle('');
      setShowAdd(false);
      fetchProfiles();
    } catch (err) {
      console.error('Failed to add profile:', err);
    } finally {
      setAdding(false);
    }
  };

  const handleScan = async (id: number) => {
    await api.post(`/tracked-profiles/${id}/scan`);
    fetchProfiles();
  };

  const filtered = profiles.filter((p) => p.x_handle?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div className="flex items-center gap-3 mb-5">
        <GhostButton variant="gold" size="md" icon={<Plus size={14} strokeWidth={2.5} />} onClick={() => setShowAdd(!showAdd)}>
          Add Profile
        </GhostButton>
        {showAdd && (
          <div className="flex items-center gap-2">
            <span style={{ fontSize: 12, color: '#999' }}>@</span>
            <input
              type="text"
              value={newHandle}
              onChange={(e) => setNewHandle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              placeholder="handle"
              autoFocus
              className="placeholder:text-[#777] text-[#e5e5e5] focus:outline-none"
              style={{ background: '#3a3a3a', border: '1px solid #4a4a4a', borderRadius: 8, padding: '6px 12px', fontSize: 12, width: 160 }}
              onFocus={(e) => e.target.style.borderColor = '#d4a853'}
              onBlur={(e) => e.target.style.borderColor = '#4a4a4a'}
            />
            <GhostButton variant="gold" size="sm" onClick={handleAdd} disabled={adding || !newHandle.trim()}>
              {adding ? '...' : 'Add'}
            </GhostButton>
            <GhostButton variant="glass" size="sm" onClick={() => { setShowAdd(false); setNewHandle(''); }}>
              Cancel
            </GhostButton>
          </div>
        )}
        <div className="flex-1 max-w-xs relative">
          <Search size={14} strokeWidth={1.5} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#888888]" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search profiles..."
            className="w-full placeholder:text-[#777777] text-[#e5e5e5] focus:outline-none transition-colors"
            style={{ background: '#3a3a3a', border: '1px solid #4a4a4a', borderRadius: 10, paddingLeft: 34, paddingRight: 14, paddingTop: 8, paddingBottom: 8, fontSize: 12 }}
            onFocus={(e) => (e.target.style.borderColor = '#d4a853')} onBlur={(e) => (e.target.style.borderColor = '#4a4a4a')} />
        </div>
      </div>
      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>Loading profiles...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>No tracked profiles yet. Add one to get started.</div>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          {filtered.map((p) => (
            <div key={p.id} className="relative" style={{ background: '#383838', borderRadius: 16, padding: '18px 18px 16px', border: '1px solid #4a4a4a' }}>
              <div className="absolute top-4 right-4 p-1 rounded-lg cursor-pointer transition-colors" style={{ background: 'transparent' }}>
                <MoreVertical size={14} strokeWidth={1.5} style={{ color: '#999999' }} />
              </div>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center" style={{ width: 38, height: 38, borderRadius: 11, background: '#444444', border: '1px solid #505050' }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#aaaaaa' }}>{(p.x_handle || '??').slice(0, 2).toUpperCase()}</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#e5e5e5' }}>@{p.x_handle}</span>
                    <div className="rounded-full" style={{ width: 7, height: 7, background: p.priority <= 3 ? '#d4a853' : '#555555' }} />
                  </div>
                  <span style={{ fontSize: 11, color: '#999999' }}>Priority {p.priority}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div><div style={{ fontSize: 20, fontWeight: 700, color: '#e5e5e5', lineHeight: 1 }}>{parseInt(p.tweet_count || '0').toLocaleString()}</div><div style={{ fontSize: 10, color: '#999999', fontWeight: 500, marginTop: 2 }}>Scanned</div></div>
                <div><div style={{ fontSize: 20, fontWeight: 700, color: '#e5e5e5', lineHeight: 1 }}>{parseInt(p.pending_opportunities || '0').toLocaleString()}</div><div style={{ fontSize: 10, color: '#999999', fontWeight: 500, marginTop: 2 }}>Opportunities</div></div>
              </div>
              <div className="flex items-center justify-between">
                <span style={{ fontSize: 11, color: '#999999' }}>Last: {timeAgo(p.last_scanned_at || p.added_at)}</span>
                <GhostButton variant="gold" size="sm" icon={<Play size={9} strokeWidth={2.5} />} onClick={() => handleScan(p.id)}>
                  Scan
                </GhostButton>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
