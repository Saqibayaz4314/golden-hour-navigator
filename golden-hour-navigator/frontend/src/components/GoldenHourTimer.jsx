import { useState, useEffect } from 'react';
import { Timer, AlertTriangle } from 'lucide-react';

export default function GoldenHourTimer({ startTime }) {
  const [timeLeft, setTimeLeft] = useState(60 * 60); // 60 minutes in seconds

  useEffect(() => {
    if (!startTime) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = Math.floor((now - startTime) / 1000);
      const remaining = Math.max(0, 60 * 60 - elapsed);
      setTimeLeft(remaining);
      
      if (remaining === 0) clearInterval(interval);
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  if (!startTime) return null;

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const isCritical = timeLeft < 15 * 60; // Less than 15 mins

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0.85rem 1.25rem',
      background: isCritical ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)',
      border: `1px solid ${isCritical ? 'var(--red)' : 'var(--green)'}`,
      borderRadius: 'var(--radius-lg)',
      marginBottom: '1.5rem',
      animation: isCritical ? 'pulse 2s infinite' : 'none',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <Timer size={24} style={{ color: isCritical ? 'var(--red)' : 'var(--green)' }} />
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: isCritical ? 'var(--red)' : 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {isCritical ? 'Critical Time Remaining' : 'Golden Hour Active'}
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'monospace', color: 'var(--text-primary)' }}>
            {mins.toString().padStart(2, '0')}:{secs.toString().padStart(2, '0')}
          </div>
        </div>
      </div>
      {isCritical && <AlertTriangle size={24} style={{ color: 'var(--red)' }} />}
    </div>
  );
}
