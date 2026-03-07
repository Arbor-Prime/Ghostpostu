export function GhostPostLogo({ size = 24 }: { size?: number }) {
  return (
    <div
      className="flex items-center justify-center"
      style={{
        width: size,
        height: size,
        background: 'linear-gradient(135deg, #d4a853, #c49a3e)',
        borderRadius: size * 0.3,
      }}
    >
      <span
        className="text-white"
        style={{ fontSize: size * 0.55, fontWeight: 800, lineHeight: 1 }}
      >
        G
      </span>
    </div>
  );
}
