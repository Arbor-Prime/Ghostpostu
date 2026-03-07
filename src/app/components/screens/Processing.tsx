import { useState, useEffect } from 'react';
import { Check, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router';
import { GhostPostLogo } from '../layout/GhostPostLogo';

const steps = ['Transcribing your voice', 'Analysing vocabulary and patterns', 'Identifying topics and interests', 'Mapping communication style', 'Reading emotional range', 'Building your voice profile'];

export function Processing() {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    if (activeStep < steps.length) { const t = setTimeout(() => setActiveStep((s) => s + 1), 1800); return () => clearTimeout(t); }
    else { const t = setTimeout(() => navigate('/onboarding/voice-profile'), 1000); return () => clearTimeout(t); }
  }, [activeStep, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center p-8" style={{ background: '#2b2b2b' }}>
      <div className="w-full max-w-[440px] flex flex-col items-center" style={{ background: '#333333', borderRadius: 24, padding: '44px 36px', border: '1px solid #444444' }}>
        <div className="flex items-center gap-2.5 mb-12">
          <GhostPostLogo size={22} />
          <span style={{ fontWeight: 700, fontSize: 15, color: '#e5e5e5' }}>GhostPost</span>
        </div>
        <div className="w-full">
          <div className="space-y-3.5 mb-8">
            {steps.map((step, i) => {
              const isComplete = i < activeStep, isActive = i === activeStep, isPending = i > activeStep;
              return (
                <div key={step} className={`flex items-center gap-3.5 transition-opacity duration-500 ${isPending ? 'opacity-25' : 'opacity-100'}`}>
                  <div className="w-7 h-7 flex items-center justify-center shrink-0" style={{ borderRadius: 8, background: isComplete ? '#22c55e' : isActive ? '#d4a853' : '#444444', border: isPending ? '1px solid #505050' : 'none' }}>
                    {isComplete ? <Check size={13} strokeWidth={2.5} className="text-white" /> : isActive ? <Loader2 size={13} strokeWidth={2} className="text-white animate-spin" /> : <div className="w-1.5 h-1.5 rounded-full bg-[#888888]" />}
                  </div>
                  <span style={{ fontSize: 13, fontWeight: isActive ? 600 : 400, color: isPending ? '#777777' : '#e5e5e5' }}>{step}</span>
                </div>
              );
            })}
          </div>
          <div className="w-full h-1.5 overflow-hidden" style={{ borderRadius: 4, background: '#444444' }}>
            <div className="h-full transition-all duration-700" style={{ width: `${(activeStep / steps.length) * 100}%`, background: '#d4a853', borderRadius: 4 }} />
          </div>
        </div>
      </div>
    </div>
  );
}
