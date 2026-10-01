export default function ReliabilityRing({ score }) {
  const r = 20;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color =
    score >= 80 ? 'var(--green)' :
    score >= 55 ? 'var(--amber)' :
    'var(--red)';

  return (
    <div style={{ position: 'relative', width: 52, height: 52, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg
        width="52" height="52" viewBox="0 0 52 52"
        style={{ position: 'absolute', transform: 'rotate(-90deg)' }}
      >
        {/* Track */}
        <circle
          cx="26" cy="26" r={r}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="3"
        />
        {/* Progress */}
        <circle
          cx="26" cy="26" r={r}
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
        />
      </svg>
      <span style={{ fontSize: '0.7rem', fontWeight: 700, color, zIndex: 1, lineHeight: 1 }}>
        {score}
      </span>
    </div>
  );
}
