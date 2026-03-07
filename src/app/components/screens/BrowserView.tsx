import { ChevronLeft, ChevronRight, RotateCw, Paperclip, Check, ExternalLink } from 'lucide-react';
import { GhostPostLogo } from '../layout/GhostPostLogo';
import { GhostButton } from '../ui/GhostButton';

const actionLog = [
  { icon: '✎', text: 'Editing file todos.md', type: 'action' as const },
  { text: 'Updated task list with 3 new leads', type: 'status' as const },
  { icon: '◎', text: 'Browsing instagram.com/nottingham_bites/', type: 'action' as const },
  { text: 'Scrolling down', type: 'status' as const },
  { text: 'Viewing the page', type: 'status' as const },
  { icon: '◻', text: 'Creating file leads/nottingham_bites.md', type: 'action' as const },
  { icon: '✎', text: 'Typing personalised message...', type: 'action' as const },
  { text: 'Message crafted based on voice profile', type: 'status' as const },
  { icon: '✓', text: 'DM sent to @nottingham_bites', type: 'success' as const },
  { icon: '◎', text: 'Browsing instagram.com/foodie_notts/', type: 'action' as const },
  { text: 'Scrolling down', type: 'status' as const },
  { text: 'Viewing profile highlights', type: 'status' as const },
];

export function BrowserView() {
  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 flex min-h-0">
        {/* Left chat/process panel */}
        <div className="w-[35%] flex flex-col min-h-0" style={{ borderRight: '1px solid #444444' }}>
          <div style={{ padding: '16px 18px', borderBottom: '1px solid #444444' }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: '#e5e5e5' }}>Outreach: Dojo Cards — Nottingham Restaurants</h3>
          </div>
          <div className="flex-1 overflow-auto" style={{ padding: '14px 18px' }}>
            <div className="space-y-2">
              {actionLog.map((entry, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  {(entry.type === 'action' || entry.type === 'success') && (
                    <div className="flex items-center justify-center shrink-0 mt-0.5" style={{
                      width: 22, height: 22, borderRadius: 7,
                      background: entry.type === 'success' ? 'rgba(34,197,94,0.12)' : '#444444',
                      border: entry.type === 'success' ? '1px solid rgba(34,197,94,0.2)' : '1px solid #505050',
                    }}>
                      {entry.type === 'success' ? <Check size={10} strokeWidth={2.5} className="text-[#22c55e]" /> : <span style={{ fontSize: 9, color: '#999999' }}>{entry.icon}</span>}
                    </div>
                  )}
                  <span style={{
                    fontSize: 12,
                    color: entry.type === 'success' ? '#22c55e' : entry.type === 'status' ? '#888888' : '#cccccc',
                    fontWeight: entry.type === 'success' ? 600 : 400,
                    marginLeft: entry.type === 'status' ? 32 : 0,
                    lineHeight: 1.5,
                  }}>{entry.text}</span>
                </div>
              ))}
              <div className="flex items-center gap-2 pt-2">
                <div className="w-2 h-2 rounded-full bg-[#4a90d9] animate-pulse" />
                <span style={{ fontSize: 12, color: '#4a90d9', fontWeight: 500 }}>Thinking</span>
              </div>
            </div>
          </div>
          <div style={{ padding: '12px 18px', borderTop: '1px solid #444444' }}>
            <div className="flex items-center gap-2" style={{ background: '#383838', borderRadius: 10, padding: '10px 14px', border: '1px solid #4a4a4a' }}>
              <Paperclip size={14} strokeWidth={1.5} className="text-[#888888]" />
              <input type="text" placeholder="Message GhostPost" className="flex-1 bg-transparent border-none outline-none placeholder:text-[#777777] text-[#e5e5e5]" style={{ fontSize: 13 }} />
            </div>
          </div>
        </div>

        {/* Right "Computer" panel */}
        <div className="flex-1 flex flex-col min-h-0" style={{ background: '#3d3d3d' }}>
          <div style={{ padding: '12px 18px', borderBottom: '1px solid #505050' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <GhostPostLogo size={18} />
                <div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#e5e5e5' }}>GhostPost's Computer</span>
                  <span className="block" style={{ fontSize: 10, color: '#999999' }}>GhostPost is using Browser</span>
                </div>
              </div>
              <GhostButton variant="glass" size="sm" icon={<ExternalLink size={11} strokeWidth={1.5} />}>
                Take Control
              </GhostButton>
            </div>
          </div>
          {/* Browser toolbar */}
          <div className="flex items-center gap-2" style={{ padding: '8px 18px', borderBottom: '1px solid #505050' }}>
            <div className="flex items-center gap-1">
              {[ChevronLeft, ChevronRight, RotateCw].map((Icon, i) => (
                <div key={i} className="flex items-center justify-center cursor-pointer hover:bg-[#555555] transition-colors" style={{ width: 24, height: 24, borderRadius: 6, background: '#4a4a4a', border: '1px solid #555555' }}>
                  <Icon size={12} strokeWidth={1.5} className="text-[#999999]" />
                </div>
              ))}
            </div>
            <div className="flex-1" style={{ background: '#4a4a4a', border: '1px solid #555555', borderRadius: 6, padding: '5px 12px' }}>
              <span style={{ fontSize: 12, color: '#999999' }}>instagram.com/foodie_notts/</span>
            </div>
          </div>
          {/* Browser viewport */}
          <div className="flex-1 bg-white m-3 overflow-hidden" style={{ borderRadius: 12, border: '1px solid #555555' }}>
            <div className="p-6">
              <div className="max-w-[420px] mx-auto">
                <div className="flex items-start gap-5 mb-5">
                  <div className="w-16 h-16 rounded-full p-0.5" style={{ background: 'linear-gradient(135deg, #f58529, #dd2a7b)' }}>
                    <div className="w-full h-full rounded-full bg-white p-0.5">
                      <div className="w-full h-full rounded-full flex items-center justify-center" style={{ background: '#f0f0f0' }}>
                        <span style={{ fontSize: 20, fontWeight: 700, color: '#888888' }}>FN</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: '#222222' }}>foodie_notts</h3>
                    <p style={{ fontSize: 12, color: '#888888', marginTop: 3 }}>Nottingham's best food & restaurant reviews</p>
                    <div className="flex gap-5 mt-2.5">
                      <span style={{ fontSize: 12, color: '#222222' }}><strong>1,247</strong> <span style={{ color: '#aaaaaa' }}>posts</span></span>
                      <span style={{ fontSize: 12, color: '#222222' }}><strong>23.4k</strong> <span style={{ color: '#aaaaaa' }}>followers</span></span>
                      <span style={{ fontSize: 12, color: '#222222' }}><strong>892</strong> <span style={{ color: '#aaaaaa' }}>following</span></span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {Array.from({ length: 9 }).map((_, i) => <div key={i} className="aspect-square" style={{ background: '#f0f0f0', borderRadius: 6 }} />)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom status bar */}
      <div style={{ padding: '10px 18px', borderTop: '1px solid #444444' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-2 h-2 rounded-full bg-[#4a90d9] animate-pulse" />
            <span style={{ fontSize: 12, color: '#aaaaaa' }}>GhostPost is working: <span style={{ fontWeight: 600, color: '#e5e5e5' }}>DMing restaurants in Nottingham</span></span>
          </div>
          <div className="flex items-center gap-3">
            <span style={{ fontSize: 12, fontWeight: 500, color: '#888888' }}>2 / 5</span>
            <span style={{ fontSize: 10, fontWeight: 700, color: '#22c55e', background: 'rgba(34,197,94,0.1)', borderRadius: 20, padding: '3px 8px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>live</span>
          </div>
        </div>
        <div className="w-full h-1 mt-2" style={{ borderRadius: 2, background: '#444444' }}>
          <div className="h-full" style={{ width: '40%', background: '#d4a853', borderRadius: 2 }} />
        </div>
      </div>
    </div>
  );
}
