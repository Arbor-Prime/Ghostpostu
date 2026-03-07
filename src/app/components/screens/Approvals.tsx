import { useState } from 'react';
import { Check, X, Edit3, RefreshCw, Heart, MessageCircle, Repeat2 } from 'lucide-react';
import { GhostButton } from '../ui/GhostButton';

type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected';

const drafts = [
  { id: 1, author: '@elonmusk', tweet: 'The future of AI is not about replacing humans, it\'s about augmenting human capability. We need to build tools that make people more effective, not less relevant.', likes: '12.4k', replies: '2.3k', retweets: '5.1k', reply: 'Completely agree — the best AI tools I\'ve seen lately are the ones that amplify what someone already does well, rather than trying to do it for them. Ship more of that.', type: 'standard', wordCount: 28, mood: 'Afternoon Push', energy: 65, status: 'pending' as const },
  { id: 2, author: '@paulg', tweet: 'Most startups fail because they build something nobody wants. The solution is embarrassingly simple: talk to your users before you build anything.', likes: '8.7k', replies: '1.1k', retweets: '3.2k', reply: 'Honestly this is the thing I keep seeing founders get wrong. They\'ll spend 6 months building in a cave and then wonder why no one cares. Talk to people first, mate.', type: 'standard', wordCount: 32, mood: 'Evening Social', energy: 70, status: 'pending' as const },
  { id: 3, author: '@naval', tweet: 'Specific knowledge is found by pursuing your genuine curiosity and passion rather than whatever is hot right now.', likes: '15.2k', replies: '987', retweets: '6.8k', reply: 'This is why I stopped chasing trends and doubled down on what I was already good at. The returns compound differently when you actually care about the work.', type: 'standard', wordCount: 27, mood: 'Work Mode', energy: 80, status: 'approved' as const },
];

const filterConfig: { key: StatusFilter; label: string; color: string }[] = [
  { key: 'all', label: 'All', color: '#e5e5e5' },
  { key: 'pending', label: 'Pending', color: '#d4a853' },
  { key: 'approved', label: 'Approved', color: '#22c55e' },
  { key: 'rejected', label: 'Rejected', color: '#ef4444' },
];

export function Approvals() {
  const [filter, setFilter] = useState<StatusFilter>('all');
  const filtered = filter === 'all' ? drafts : drafts.filter((d) => d.status === filter);

  return (
    <div>
      <div className="flex gap-2 mb-5">
        {filterConfig.map((f) => {
          const isActive = filter === f.key;
          return (
            <div
              key={f.key}
              onClick={() => setFilter(f.key)}
              className="cursor-pointer transition-all"
              style={{
                borderRadius: 20,
                padding: '6px 16px',
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: '-0.01em',
                background: isActive ? `${f.color}18` : 'transparent',
                color: isActive ? f.color : '#777777',
                border: isActive ? `1px solid ${f.color}35` : '1px solid transparent',
                boxShadow: isActive ? `0 0 12px ${f.color}15` : 'none',
              }}
            >
              <span className="flex items-center gap-1.5">
                {isActive && <span style={{ width: 5, height: 5, borderRadius: '50%', background: f.color, display: 'inline-block', boxShadow: `0 0 6px ${f.color}` }} />}
                {f.label}
              </span>
            </div>
          );
        })}
      </div>
      <div className="space-y-3">
        {filtered.map((draft) => (
          <div key={draft.id} style={{ background: '#383838', borderRadius: 16, border: '1px solid #4a4a4a', overflow: 'hidden' }}>
            <div style={{ padding: '18px 20px', borderBottom: '1px solid #4a4a4a' }}>
              <div className="flex items-center gap-2.5 mb-2.5">
                <div className="w-7 h-7 rounded-full" style={{ background: '#555555' }} />
                <span style={{ fontSize: 12, fontWeight: 500, color: '#999999' }}>{draft.author}</span>
              </div>
              <p style={{ fontSize: 13, color: '#cccccc', lineHeight: 1.6 }}>{draft.tweet}</p>
              <div className="flex gap-4 mt-2.5">
                {[{ Icon: Heart, val: draft.likes }, { Icon: MessageCircle, val: draft.replies }, { Icon: Repeat2, val: draft.retweets }].map(({ Icon, val }, i) => (
                  <span key={i} className="flex items-center gap-1" style={{ fontSize: 11, color: '#999999' }}><Icon size={12} strokeWidth={1.5} /> {val}</span>
                ))}
              </div>
            </div>
            {/* Reply section */}
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #4a4a4a', background: '#404040' }}>
              <p style={{ fontSize: 13, fontWeight: 500, color: '#e5e5e5', lineHeight: 1.6 }}>{draft.reply}</p>
              <div className="flex gap-3 mt-2.5">
                {[`Type: ${draft.type}`, `${draft.wordCount} words`, `Mood: ${draft.mood}`, `Energy: ${draft.energy}%`].map((m, i) => <span key={i} style={{ fontSize: 11, color: '#999999' }}>{m}</span>)}
              </div>
            </div>
            <div style={{ padding: '10px 20px', background: '#404040' }} className="flex gap-2">
              <GhostButton variant="success" size="sm" icon={<Check size={11} strokeWidth={2.5} />}>Approve</GhostButton>
              <GhostButton variant="danger" size="sm" icon={<X size={11} strokeWidth={2.5} />}>Reject</GhostButton>
              <GhostButton variant="glass" size="sm" icon={<Edit3 size={11} strokeWidth={1.5} />}>Edit</GhostButton>
              <GhostButton variant="accent" size="sm" icon={<RefreshCw size={11} strokeWidth={1.5} />}>Regenerate</GhostButton>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
