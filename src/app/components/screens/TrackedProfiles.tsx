import { useState } from 'react';
import { Plus, Search, Play, MoreVertical } from 'lucide-react';
import { GhostButton } from '../ui/GhostButton';

const profiles = [
  { handle: '@elonmusk', scanned: 847, opportunities: 23, lastScanned: '2m ago', priority: 'high' },
  { handle: '@paulg', scanned: 612, opportunities: 18, lastScanned: '5m ago', priority: 'high' },
  { handle: '@naval', scanned: 534, opportunities: 15, lastScanned: '8m ago', priority: 'high' },
  { handle: '@sama', scanned: 423, opportunities: 12, lastScanned: '12m ago', priority: 'normal' },
  { handle: '@pmarca', scanned: 389, opportunities: 11, lastScanned: '15m ago', priority: 'normal' },
  { handle: '@levelsio', scanned: 312, opportunities: 9, lastScanned: '20m ago', priority: 'normal' },
  { handle: '@dhaborat', scanned: 245, opportunities: 7, lastScanned: '25m ago', priority: 'normal' },
  { handle: '@rauchg', scanned: 198, opportunities: 5, lastScanned: '30m ago', priority: 'normal' },
  { handle: '@balajis', scanned: 156, opportunities: 4, lastScanned: '35m ago', priority: 'normal' },
];

export function TrackedProfiles() {
  const [search, setSearch] = useState('');
  const filtered = profiles.filter((p) => p.handle.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div className="flex items-center gap-3 mb-5">
        <GhostButton variant="gold" size="md" icon={<Plus size={14} strokeWidth={2.5} />}>
          Add Profile
        </GhostButton>
        <div className="flex-1 max-w-xs relative">
          <Search size={14} strokeWidth={1.5} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#888888]" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search profiles..."
            className="w-full placeholder:text-[#777777] text-[#e5e5e5] focus:outline-none transition-colors"
            style={{ background: '#3a3a3a', border: '1px solid #4a4a4a', borderRadius: 10, paddingLeft: 34, paddingRight: 14, paddingTop: 8, paddingBottom: 8, fontSize: 12 }}
            onFocus={(e) => e.target.style.borderColor = '#d4a853'} onBlur={(e) => e.target.style.borderColor = '#4a4a4a'} />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {filtered.map((p) => (
          <div key={p.handle} className="relative" style={{ background: '#383838', borderRadius: 16, padding: '18px 18px 16px', border: '1px solid #4a4a4a' }}>
            <div className="absolute top-4 right-4 p-1 rounded-lg hover:bg-[#444444] cursor-pointer transition-colors">
              <MoreVertical size={14} strokeWidth={1.5} className="text-[#999999]" />
            </div>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center" style={{ width: 38, height: 38, borderRadius: 11, background: '#444444', border: '1px solid #505050' }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#aaaaaa' }}>{p.handle.slice(1, 3).toUpperCase()}</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#e5e5e5' }}>{p.handle}</span>
                  <div className="rounded-full" style={{ width: 7, height: 7, background: p.priority === 'high' ? '#d4a853' : '#555555' }} />
                </div>
                <span style={{ fontSize: 11, color: '#999999' }}>𝕏</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div><div style={{ fontSize: 20, fontWeight: 700, color: '#e5e5e5', lineHeight: 1 }}>{p.scanned}</div><div style={{ fontSize: 10, color: '#999999', fontWeight: 500, marginTop: 2 }}>Scanned</div></div>
              <div><div style={{ fontSize: 20, fontWeight: 700, color: '#e5e5e5', lineHeight: 1 }}>{p.opportunities}</div><div style={{ fontSize: 10, color: '#999999', fontWeight: 500, marginTop: 2 }}>Opportunities</div></div>
            </div>
            <div className="flex items-center justify-between">
              <span style={{ fontSize: 11, color: '#999999' }}>Last: {p.lastScanned}</span>
              <GhostButton variant="gold" size="sm" icon={<Play size={9} strokeWidth={2.5} fill="currentColor" />}>
                Scan
              </GhostButton>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
