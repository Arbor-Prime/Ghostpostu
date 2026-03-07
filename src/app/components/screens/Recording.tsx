import { useState, useEffect, useRef } from 'react';
import { Mic, Pause, Square, Check } from 'lucide-react';
import { useNavigate } from 'react-router';
import { GhostPostLogo } from '../layout/GhostPostLogo';
import { GhostButton } from '../ui/GhostButton';

const prompts = ['Tell me about yourself...', 'What do you do for work?', 'What are you passionate about?', 'How do you talk to friends?', 'What topics get you excited?', 'Describe your communication style...'];

export function Recording() {
  const navigate = useNavigate();
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [promptIndex, setPromptIndex] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isRecording && !isPaused) { intervalRef.current = setInterval(() => setSeconds((s) => s + 1), 1000); }
    else { if (intervalRef.current) clearInterval(intervalRef.current); }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isRecording, isPaused]);

  useEffect(() => { const t = setInterval(() => setPromptIndex((i) => (i + 1) % prompts.length), 4000); return () => clearInterval(t); }, []);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  return (
    <div className="min-h-screen flex items-center justify-center p-8" style={{ background: '#2b2b2b' }}>
      <div className="w-full max-w-[460px] flex flex-col items-center" style={{ background: '#333333', borderRadius: 24, padding: '44px 40px', border: '1px solid #444444' }}>
        <div className="flex items-center gap-2.5 mb-12">
          <GhostPostLogo size={22} />
          <span style={{ fontWeight: 700, fontSize: 15, color: '#e5e5e5' }}>GhostPost</span>
        </div>
        <p className="mb-8 transition-opacity duration-500" style={{ fontSize: 15, color: '#aaaaaa', fontWeight: 500 }}>{prompts[promptIndex]}</p>
        <div className="relative mb-6">
          {isRecording && !isPaused && <div className="absolute inset-[-8px] rounded-full animate-ping opacity-20" style={{ border: '2px solid #d4a853' }} />}
          <div className="flex items-center justify-center" style={{ width: 110, height: 110, borderRadius: '50%', border: isRecording ? '2px solid #d4a853' : '2px solid #505050', background: isRecording ? 'rgba(212,168,83,0.04)' : '#3a3a3a' }}>
            <Mic size={34} strokeWidth={1.5} className={isRecording ? 'text-[#d4a853]' : 'text-[#999999]'} />
          </div>
        </div>
        <div className="mb-6" style={{ fontSize: 32, fontWeight: 700, color: '#e5e5e5', letterSpacing: '-0.02em' }}>{formatTime(seconds)}</div>
        <div className="flex items-center gap-3">
          {!isRecording ? (
            <GhostButton variant="gold" size="lg" onClick={() => setIsRecording(true)} icon={<Mic size={18} strokeWidth={2} />}>
              Record
            </GhostButton>
          ) : (
            <>
              <GhostButton variant="glass" size="md" onClick={() => setIsPaused(!isPaused)} icon={<Pause size={15} strokeWidth={1.5} />}>
                {isPaused ? 'Resume' : 'Pause'}
              </GhostButton>
              <GhostButton variant="danger" size="md" onClick={() => { setIsRecording(false); setIsPaused(false); }} icon={<Square size={14} strokeWidth={2} />}>
                Stop
              </GhostButton>
            </>
          )}
          {seconds >= 10 && (
            <GhostButton variant="success" size="md" onClick={() => navigate('/onboarding/processing')} icon={<Check size={14} strokeWidth={2.5} />}>
              Done
            </GhostButton>
          )}
        </div>
      </div>
    </div>
  );
}
