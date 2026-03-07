import { Search, Sparkles } from 'lucide-react';
import { GhostButton } from '../ui/GhostButton';

export function Header({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-between px-7 pt-7 pb-4">
      <h1 style={{ fontSize: 22, fontWeight: 700, color: '#e5e5e5', letterSpacing: '-0.02em' }}>{title}</h1>
      <div className="flex items-center gap-3">
        <div
          className="flex items-center gap-2 px-3.5 py-2 cursor-pointer hover:border-[#555555] transition-colors"
          style={{ background: '#3a3a3a', border: '1px solid #4a4a4a', borderRadius: 10, minWidth: 170 }}
        >
          <Search size={14} strokeWidth={1.5} className="text-[#888888]" />
          <span style={{ fontSize: 13, color: '#888888' }}>Search</span>
        </div>
        <GhostButton
          variant="gold"
          size="md"
          icon={<Sparkles size={13} strokeWidth={1.5} />}
        >
          Ask AI
        </GhostButton>
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer"
          style={{ background: 'linear-gradient(135deg, #d4a853, #c49a3e)' }}
        >
          <span style={{ fontSize: 11, fontWeight: 700, color: '#fff' }}>JD</span>
        </div>
      </div>
    </div>
  );
}
