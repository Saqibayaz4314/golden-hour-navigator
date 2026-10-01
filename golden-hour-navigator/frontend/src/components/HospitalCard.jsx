import { MapPin, Phone, Bed, Zap, Clock, Navigation2, AlertTriangle, UserCheck } from 'lucide-react';
import ReliabilityRing from './ReliabilityRing';

const STATUS_LABEL = { green: 'Available', yellow: 'Near Full', red: 'Full' };
const STATUS_DOT   = { green: 'dot-green', yellow: 'dot-amber', red: 'dot-red' };
const STATUS_BADGE = { green: 'badge-green', yellow: 'badge-amber', red: 'badge-red' };

export default function HospitalCard({ hospital, rank, onNavigate, onReport }) {
  const {
    name, type, address, phone,
    resources, distance_km,
    reliability_score = 100,
    available_doctors = [],
  } = hospital;

  const beds   = resources?.beds_status   || 'green';
  const oxygen = resources?.oxygen_status || 'green';
  const etaMins = distance_km ? Math.max(1, Math.round((distance_km / 40) * 60)) : null;

  return (
    <div className="h-card fade-in">
      {/* Top accent line */}
      <div className={`h-card-accent ${beds === 'green' ? '' : `status-${beds}`}`} />

      <div className="h-card-body">
        {/* Row 1 — Name + Rank + Reliability */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem', gap: '1rem' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              {rank && (
                <span style={{
                  fontSize: '0.65rem', fontWeight: 700,
                  background: 'var(--bg-raised)', border: '1px solid var(--border-default)',
                  color: 'var(--text-muted)', padding: '0.15rem 0.45rem',
                  borderRadius: '999px', letterSpacing: '0.05em', flexShrink: 0,
                }}>
                  #{rank}
                </span>
              )}
              <h3 style={{ fontSize: '1rem', fontWeight: 700, letterSpacing: '-0.01em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {name}
              </h3>
            </div>
            <span className={`badge ${type === 'Public' ? 'badge-blue' : 'badge-violet'}`}>
              {type}
            </span>
          </div>

          {/* Reliability ring */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem', flexShrink: 0 }}>
            <ReliabilityRing score={reliability_score} />
            <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Trust
            </span>
          </div>
        </div>

        {/* Row 2 — Address / Phone */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', marginBottom: '1rem' }}>
          {address && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              <MapPin size={13} style={{ flexShrink: 0, color: 'var(--text-muted)' }} />
              {address}
            </div>
          )}
          {phone && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              <Phone size={13} style={{ flexShrink: 0, color: 'var(--text-muted)' }} />
              {phone}
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="divider" style={{ margin: '0 0 1rem' }} />

        {/* Row 3 — Status pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.85rem' }}>
          <span className={`badge ${STATUS_BADGE[beds]}`}>
            <span className={`status-dot ${STATUS_DOT[beds]}`} />
            <Bed size={11} />
            Beds: {STATUS_LABEL[beds]}
            {resources?.beds_available != null && ` (${resources.beds_available})`}
          </span>

          <span className={`badge ${STATUS_BADGE[oxygen]}`}>
            <span className={`status-dot ${STATUS_DOT[oxygen]}`} />
            <Zap size={11} />
            O₂: {STATUS_LABEL[oxygen]}
          </span>

          {resources?.icu_available && (
            <span className="badge badge-green">ICU</span>
          )}
        </div>

        {/* Doctors on duty */}
        {available_doctors.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '1rem' }}>
            {available_doctors.map((d) => (
              <span key={d._id} className="badge badge-green" style={{ gap: '0.3rem' }}>
                <UserCheck size={10} />
                Dr. {d.name}
              </span>
            ))}
          </div>
        )}

        {/* Divider */}
        <div className="divider" style={{ margin: '0 0 1rem' }} />

        {/* Row 4 — ETA + Actions */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          {/* ETA */}
          <div style={{ display: 'flex', align: 'center', gap: '1.25rem' }}>
            {etaMins && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Clock size={14} style={{ color: 'var(--text-muted)' }} />
                <span style={{
                  fontSize: '0.9rem', fontWeight: 700,
                  color: etaMins <= 10 ? 'var(--green)' : etaMins <= 20 ? 'var(--amber)' : 'var(--red)',
                }}>
                  {etaMins} min
                </span>
              </div>
            )}
            {distance_km != null && (
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                {distance_km.toFixed(1)} km away
              </span>
            )}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {onReport && (
              <button
                className="btn btn-outline btn-sm"
                style={{ color: 'var(--red)', borderColor: 'var(--red-dim)' }}
                onClick={() => onReport(hospital)}
                id={`report-${hospital._id}`}
              >
                <AlertTriangle size={13} />
                Turned Away
              </button>
            )}
            {onNavigate && (
              <button
                className="btn btn-primary btn-sm"
                onClick={() => onNavigate(hospital)}
                id={`navigate-${hospital._id}`}
              >
                <Navigation2 size={13} />
                Navigate
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
