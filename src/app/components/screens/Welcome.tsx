import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { GhostPostLogo } from '../layout/GhostPostLogo';

export function Welcome() {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [phase, setPhase] = useState(0);
  const [orbScale, setOrbScale] = useState(0);

  // Particle canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: { x: number; y: number; vx: number; vy: number; size: number; alpha: number; life: number }[] = [];
    const centerX = canvas.width / 2;
    const centerY = canvas.height * 0.35;

    let animId: number;
    let frame = 0;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      frame++;

      if (frame % 3 === 0 && particles.length < 60) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 0.2 + Math.random() * 0.6;
        particles.push({
          x: centerX + (Math.random() - 0.5) * 50,
          y: centerY + (Math.random() - 0.5) * 50,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 0.15,
          size: 1 + Math.random() * 2,
          alpha: 0.2 + Math.random() * 0.3,
          life: 100 + Math.random() * 60,
        });
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life--;
        p.alpha *= 0.994;
        if (p.life <= 0 || p.alpha < 0.01) { particles.splice(i, 1); continue; }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(212, 168, 83, ${p.alpha})`;
        ctx.fill();
      }

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 70) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(212, 168, 83, ${0.05 * (1 - dist / 70)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      animId = requestAnimationFrame(animate);
    };
    animate();
    const hr = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    window.addEventListener('resize', hr);
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', hr); };
  }, []);

  // Phase sequencing
  useEffect(() => {
    const t1 = setTimeout(() => setOrbScale(1), 300);
    const t2 = setTimeout(() => setPhase(1), 800);
    const t3 = setTimeout(() => setPhase(2), 2000);
    const t4 = setTimeout(() => setPhase(3), 3200);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, []);

  const handleBegin = () => {
    setOrbScale(1.5);
    setPhase(4);
    setTimeout(() => navigate('/onboarding/recording'), 600);
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center" style={{ background: '#1a1a1a' }}>
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }} />

      {/* Ambient glow */}
      <div className="absolute pointer-events-none" style={{
        top: '28%', left: '50%', transform: 'translate(-50%, -50%)',
        width: 500, height: 500, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(212,168,83,0.08) 0%, rgba(212,168,83,0.02) 40%, transparent 70%)',
        filter: 'blur(40px)',
      }} />

      <div className="relative z-10 flex flex-col items-center px-6" style={{ maxWidth: 460 }}>

        {/* Breathing Voice Orb */}
        <div className="relative flex items-center justify-center mb-10" style={{
          width: 120, height: 120,
          transform: `scale(${phase === 4 ? 0 : orbScale})`,
          opacity: phase === 4 ? 0 : 1,
          transition: 'all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}>
          <div className="absolute inset-0 rounded-full" style={{
            border: '1px solid rgba(212,168,83,0.12)',
            animation: 'orbPulse 3s ease-in-out infinite',
          }} />
          <div className="absolute rounded-full" style={{
            inset: 12, border: '1px solid rgba(212,168,83,0.2)',
            animation: 'orbPulse 3s ease-in-out infinite 0.5s',
          }} />
          <div className="rounded-full flex items-center justify-center" style={{
            width: 76, height: 76,
            background: 'radial-gradient(circle at 40% 40%, rgba(212,168,83,0.2) 0%, rgba(212,168,83,0.06) 60%, transparent 100%)',
            border: '2px solid rgba(212,168,83,0.35)',
            animation: 'orbBreathe 4s ease-in-out infinite',
            boxShadow: '0 0 40px rgba(212,168,83,0.12), inset 0 0 30px rgba(212,168,83,0.08)',
          }}>
            <GhostPostLogo size={26} />
          </div>
        </div>

        {/* Headline */}
        <h1 className="text-center mb-3" style={{
          fontSize: 30, fontWeight: 800, color: '#e5e5e5',
          letterSpacing: '-0.03em', lineHeight: 1.25,
          opacity: phase >= 1 ? 1 : 0,
          transform: phase >= 1 ? 'translateY(0)' : 'translateY(24px)',
          transition: 'all 0.9s cubic-bezier(0.22, 1, 0.36, 1)',
        }}>
          I learn by <span style={{ color: '#d4a853' }}>listening</span>.
        </h1>

        <p className="text-center mb-10" style={{
          fontSize: 14, color: '#888', lineHeight: 1.7, maxWidth: 340,
          opacity: phase >= 1 ? 1 : 0,
          transform: phase >= 1 ? 'translateY(0)' : 'translateY(16px)',
          transition: 'all 0.9s cubic-bezier(0.22, 1, 0.36, 1) 0.15s',
        }}>
          Talk to me like you'd talk to a mate. I'll pick up your words, your rhythm, your style.
        </p>

        {/* Animated signal cards */}
        <div className="w-full space-y-3 mb-10" style={{ maxWidth: 380 }}>
          {[
            { delay: 0, label: 'Your vocabulary', sub: 'The words you reach for — and the ones you never touch' },
            { delay: 0.15, label: 'Your rhythm', sub: 'Fast bursts or slow builds. Pauses or non-stop flow.' },
            { delay: 0.3, label: 'Your personality', sub: 'Humour, passion, sarcasm — the things that make you, you' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-4" style={{
              background: 'rgba(255,255,255,0.025)',
              borderRadius: 14, padding: '14px 18px',
              border: '1px solid rgba(255,255,255,0.05)',
              opacity: phase >= 2 ? 1 : 0,
              transform: phase >= 2 ? 'translateX(0)' : 'translateX(-30px)',
              transition: `all 0.7s cubic-bezier(0.22, 1, 0.36, 1) ${item.delay + 0.1}s`,
            }}>
              <div className="flex items-end gap-px shrink-0" style={{ width: 22, height: 22 }}>
                {[0, 1, 2, 3].map(j => (
                  <div key={j} style={{
                    width: 3, borderRadius: 2, background: '#d4a853', opacity: 0.5,
                    animation: `waveBar 1.2s ease-in-out infinite ${j * 0.15 + i * 0.3}s`,
                  }} />
                ))}
              </div>
              <div>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#e5e5e5', display: 'block', marginBottom: 2 }}>{item.label}</span>
                <span style={{ fontSize: 11, color: '#666', lineHeight: 1.5 }}>{item.sub}</span>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{
          opacity: phase >= 3 ? 1 : 0,
          transform: phase >= 3 ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.9)',
          transition: 'all 0.7s cubic-bezier(0.22, 1, 0.36, 1)',
        }}>
          <button onClick={handleBegin} style={{
            background: 'linear-gradient(135deg, #d4a853 0%, #c49a48 100%)',
            color: '#1a1a1a', fontWeight: 700, fontSize: 15,
            padding: '16px 52px', borderRadius: 14, border: 'none',
            cursor: 'pointer', letterSpacing: '-0.01em',
            boxShadow: '0 4px 24px rgba(212,168,83,0.3), 0 0 50px rgba(212,168,83,0.08)',
            transition: 'all 0.3s ease',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = '0 6px 30px rgba(212,168,83,0.4), 0 0 60px rgba(212,168,83,0.15)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 24px rgba(212,168,83,0.3), 0 0 50px rgba(212,168,83,0.08)'; }}
          >
            Start talking →
          </button>
          <p className="text-center mt-4" style={{ fontSize: 11, color: '#555' }}>
            Takes about 2 minutes. Just speak naturally.
          </p>
        </div>
      </div>

      <style>{`
        @keyframes orbPulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.18); opacity: 0.4; }
        }
        @keyframes orbBreathe {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.07); }
        }
        @keyframes waveBar {
          0%, 100% { height: 3px; }
          50% { height: 18px; }
        }
      `}</style>
    </div>
  );
}
