import { MapPin, Phone, Star, Building2, Clock, Calendar, CheckCircle, XCircle, Stethoscope } from 'lucide-react';

const DAY_ABBR = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

function isNowInSlot(slot) {
  const now  = new Date();
  const day  = DAY_ABBR[now.getDay()];
  if (!slot.days?.includes(day)) return false;
  const cur  = now.getHours() * 60 + now.getMinutes();
  const [fH, fM] = (slot.time_from || '00:00').split(':').map(Number);
  const [tH, tM] = (slot.time_to   || '23:59').split(':').map(Number);
  return cur >= fH * 60 + fM && cur <= tH * 60 + tM;
}

function ScheduleRow({ aff }) {
  const isActive = aff.schedule?.some(isNowInSlot);

  return (
    <div style={{
      padding: '0.85rem 1rem',
      borderRadius: 'var(--radius)',
      background: 'var(--bg-raised)',
      border: `1px solid ${isActive ? 'rgba(34,197,94,0.2)' : 'var(--border-subtle)'}`,
      transition: 'all 0.18s',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Building2 size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>
            {aff.hospital_id?.name || aff.hospital_name}
          </span>
        </div>
        <span className={`badge ${isActive ? 'badge-green' : 'badge-red'}`} style={{ fontSize: '0.65rem' }}>
          {isActive ? 'Here Now' : 'Not Here'}
        </span>
      </div>

      {aff.hospital_address && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          <MapPin size={11} />
          {aff.hospital_id?.address || aff.hospital_address}
        </div>
      )}

      {/* Schedule slots */}
      {aff.schedule?.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
          {aff.schedule.map((slot, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              <Calendar size={11} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
              <span style={{ color: 'var(--text-muted)' }}>{slot.days?.join(', ')}</span>
              <Clock size={11} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
              <span>{slot.time_from} – {slot.time_to}</span>
              {isNowInSlot(slot) && (
                <span className="badge badge-green" style={{ fontSize: '0.6rem', padding: '0.1rem 0.4rem' }}>Now</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function DoctorCard({ doctor, showSchedule = true }) {
  const {
    name, specialty, qualifications = [], experience_years,
    phone, bio, rating = 5,
    hospital_affiliations = [],
    is_available, on_schedule_now,
    nearest_hospital, distance_km,
  } = doctor;

  const isLive = is_available || on_schedule_now;

  return (
    <div className="h-card fade-in">
      {/* Accent bar */}
      <div className="h-card-accent" style={{ background: isLive ? 'var(--green)' : 'var(--text-muted)' }} />

      <div className="h-card-body">
        {/* Row 1 — Name + Status */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '0.75rem' }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>{name}</h3>
              <span className={`badge ${isLive ? 'badge-green' : 'badge-red'}`}>
                <span className={`status-dot ${isLive ? 'dot-green' : 'dot-red'}`} />
                {is_available ? 'On Duty' : on_schedule_now ? 'Scheduled Now' : 'Unavailable'}
              </span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              <span className="badge badge-blue">{specialty}</span>
              {qualifications.map(q => (
                <span key={q} className="badge" style={{ background: 'var(--bg-raised)', color: 'var(--text-secondary)', fontSize: '0.65rem' }}>{q}</span>
              ))}
            </div>
          </div>

          {/* Rating */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Star size={13} style={{ color: '#f59e0b', fill: '#f59e0b' }} />
              <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{rating?.toFixed(1)}</span>
            </div>
            {experience_years > 0 && (
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{experience_years} yrs exp</span>
            )}
          </div>
        </div>

        {/* Bio */}
        {bio && (
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '0.85rem' }}>
            {bio}
          </p>
        )}

        {/* Contact + Distance */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '0.85rem' }}>
          {phone && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              <Phone size={13} style={{ color: 'var(--text-muted)' }} />
              {phone}
            </div>
          )}
          {distance_km != null && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              <MapPin size={13} style={{ color: 'var(--text-muted)' }} />
              {distance_km.toFixed(1)} km away
            </div>
          )}
          {nearest_hospital && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              <Stethoscope size={13} style={{ color: 'var(--text-muted)' }} />
              Nearest at {nearest_hospital.name}
            </div>
          )}
        </div>

        {/* Schedule */}
        {showSchedule && hospital_affiliations.length > 0 && (
          <>
            <div className="divider" style={{ margin: '0 0 0.85rem' }} />
            <p className="section-label" style={{ marginBottom: '0.6rem' }}>Hospital Schedule</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {hospital_affiliations.map((aff, i) => (
                <ScheduleRow key={aff._id || i} aff={aff} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
