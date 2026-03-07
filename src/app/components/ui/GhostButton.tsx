import React from 'react';

type Variant = 'gold' | 'glass' | 'danger' | 'success' | 'accent' | 'ghost' | 'outline';
type Size = 'sm' | 'md' | 'lg' | 'xl';

interface GhostButtonProps {
  children: React.ReactNode;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  accentColor?: string;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}

const sizeMap: Record<Size, { px: number; py: number; fontSize: number; iconGap: number; radius: number }> = {
  sm: { px: 12, py: 5, fontSize: 11, iconGap: 5, radius: 8 },
  md: { px: 16, py: 8, fontSize: 12, iconGap: 6, radius: 10 },
  lg: { px: 22, py: 10, fontSize: 13, iconGap: 8, radius: 12 },
  xl: { px: 28, py: 13, fontSize: 14, iconGap: 8, radius: 14 },
};

export function GhostButton({
  children,
  icon,
  iconRight,
  variant = 'gold',
  size = 'md',
  fullWidth = false,
  accentColor,
  onClick,
  className = '',
  disabled = false,
}: GhostButtonProps) {
  const s = sizeMap[size];

  const base: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: s.iconGap,
    padding: `${s.py}px ${s.px}px`,
    fontSize: s.fontSize,
    fontWeight: 700,
    fontFamily: 'inherit',
    letterSpacing: '-0.01em',
    borderRadius: s.radius,
    cursor: disabled ? 'not-allowed' : 'pointer',
    position: 'relative',
    overflow: 'hidden',
    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
    width: fullWidth ? '100%' : undefined,
    opacity: disabled ? 0.5 : 1,
    border: 'none',
    outline: 'none',
    textDecoration: 'none',
    lineHeight: 1.2,
  };

  const variants: Record<Variant, React.CSSProperties> = {
    gold: {
      ...base,
      background: 'linear-gradient(135deg, #e0b45c 0%, #d4a853 40%, #c49040 100%)',
      color: '#1a1a1a',
      boxShadow: '0 1px 2px rgba(0,0,0,0.3), 0 4px 16px rgba(212,168,83,0.25), inset 0 1px 0 rgba(255,255,255,0.25), inset 0 -1px 0 rgba(0,0,0,0.1)',
    },
    glass: {
      ...base,
      background: 'rgba(255,255,255,0.06)',
      color: '#e5e5e5',
      border: '1px solid rgba(255,255,255,0.1)',
      boxShadow: '0 1px 2px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.06)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
    },
    danger: {
      ...base,
      background: 'linear-gradient(135deg, rgba(239,68,68,0.15), rgba(220,38,38,0.08))',
      color: '#f87171',
      border: '1px solid rgba(239,68,68,0.2)',
      boxShadow: '0 1px 2px rgba(0,0,0,0.2), inset 0 1px 0 rgba(239,68,68,0.05)',
    },
    success: {
      ...base,
      background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
      color: '#ffffff',
      boxShadow: '0 1px 2px rgba(0,0,0,0.3), 0 4px 12px rgba(34,197,94,0.25), inset 0 1px 0 rgba(255,255,255,0.2)',
    },
    accent: {
      ...base,
      background: accentColor ? `linear-gradient(135deg, ${accentColor}20, ${accentColor}10)` : 'rgba(212,168,83,0.1)',
      color: accentColor || '#d4a853',
      border: `1px solid ${accentColor ? accentColor + '30' : 'rgba(212,168,83,0.2)'}`,
      boxShadow: '0 1px 2px rgba(0,0,0,0.15)',
    },
    ghost: {
      ...base,
      background: 'transparent',
      color: '#999999',
      border: '1px solid rgba(255,255,255,0.08)',
    },
    outline: {
      ...base,
      background: 'transparent',
      color: '#d4a853',
      border: '1px solid rgba(212,168,83,0.35)',
      boxShadow: '0 1px 2px rgba(0,0,0,0.15)',
    },
  };

  const style = variants[variant];

  return (
    <button
      onClick={disabled ? undefined : onClick}
      className={`group ${className}`}
      style={style}
    >
      {/* Shimmer effect for gold */}
      {variant === 'gold' && (
        <span
          style={{
            position: 'absolute',
            top: 0,
            left: '-100%',
            width: '60%',
            height: '100%',
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
            transition: 'left 0.6s ease',
            pointerEvents: 'none',
          }}
          className="group-hover:!left-[120%]"
        />
      )}
      {/* Hover overlay for non-gold */}
      {variant !== 'gold' && (
        <span
          style={{
            position: 'absolute',
            inset: 0,
            background: variant === 'danger' ? 'rgba(239,68,68,0.08)' : variant === 'success' ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.04)',
            opacity: 0,
            transition: 'opacity 0.2s ease',
            pointerEvents: 'none',
          }}
          className="group-hover:!opacity-100"
        />
      )}
      {/* Active press effect via scale */}
      <style>{`
        .group:active { transform: scale(0.97) !important; }
        .group:hover { transform: translateY(-1px); }
      `}</style>
      {icon && <span style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center' }}>{icon}</span>}
      <span style={{ position: 'relative', zIndex: 1 }}>{children}</span>
      {iconRight && <span style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center' }}>{iconRight}</span>}
    </button>
  );
}
