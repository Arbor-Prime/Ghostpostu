import { Briefcase, Heart, MessageCircle, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router';
import { GhostPostLogo } from '../layout/GhostPostLogo';
import { GhostButton } from '../ui/GhostButton';

const cards = [
  { icon: Briefcase, title: 'What you do', description: 'Your work, your expertise, the things you build and care about professionally.' },
  { icon: Heart, title: 'What you care about', description: 'Your interests, passions, and the topics that light you up in conversation.' },
  { icon: MessageCircle, title: 'How you communicate', description: 'Your tone, your rhythm, the words you reach for and the ones you never use.' },
];

export function Welcome() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex items-center justify-center p-8" style={{ background: '#2b2b2b' }}>
      <div className="w-full max-w-[540px] flex flex-col items-center" style={{ background: '#333333', borderRadius: 24, padding: '44px 40px', border: '1px solid #444444' }}>
        <div className="flex items-center gap-2.5 mb-10">
          <GhostPostLogo size={28} />
          <span style={{ fontWeight: 700, fontSize: 17, color: '#e5e5e5', letterSpacing: '-0.02em' }}>GhostPost</span>
        </div>
        <h1 className="text-center mb-3" style={{ fontSize: 26, fontWeight: 800, color: '#e5e5e5', letterSpacing: '-0.03em', lineHeight: 1.25 }}>
          Before we set anything up, I need to{' '}<span className="text-[#d4a853]">get to know you</span>.
        </h1>
        <p className="text-center mb-8" style={{ fontSize: 14, color: '#aaaaaa', lineHeight: 1.65 }}>
          GhostPost learns how you communicate by listening to you talk naturally. A short voice recording is all it takes to capture your unique style.
        </p>
        <div className="w-full space-y-2.5 mb-8">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.title} className="flex items-start gap-4" style={{ background: '#3a3a3a', borderRadius: 14, padding: '16px 18px', border: '1px solid #4a4a4a' }}>
                <div className="mt-0.5 flex items-center justify-center shrink-0" style={{ width: 34, height: 34, borderRadius: 10, background: '#444444', border: '1px solid #505050' }}>
                  <Icon size={15} strokeWidth={1.5} className="text-[#999999]" />
                </div>
                <div>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: '#e5e5e5', marginBottom: 2 }}>{card.title}</h3>
                  <p style={{ fontSize: 13, color: '#aaaaaa', lineHeight: 1.5 }}>{card.description}</p>
                </div>
              </div>
            );
          })}
        </div>
        <GhostButton
          variant="gold"
          size="xl"
          fullWidth
          onClick={() => navigate('/onboarding/recording')}
          iconRight={<ArrowRight size={15} strokeWidth={2.5} />}
        >
          Let's begin
        </GhostButton>
      </div>
    </div>
  );
}
