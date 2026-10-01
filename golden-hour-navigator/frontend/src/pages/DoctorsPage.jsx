import { useState, useEffect } from 'react';
import { getDoctors } from '../services/api';
import { Users, Stethoscope, Building2 } from 'lucide-react';

const SPECIALTIES = ['All', 'Cardiac', 'Trauma', 'Burns', 'Maternity', 'Neurology', 'General'];

export default function DoctorsPage() {
  const [all, setAll]         = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [spec, setSpec]       = useState('All');

  useEffect(() => {
    getDoctors()
      .then(({ data }) => { setAll(data); setFiltered(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setFiltered(spec === 'All' ? all : all.filter(d => d.specialty === spec));
  }, [spec, all]);

  const onDuty  = all.filter(d => d.is_available).length;
  const offDuty = all.length - onDuty;

  return (
    <div style={{ minHeight: 'calc(100vh - 60px)' }}>
      {/* Header */}
      <div style={{ borderBottom: '1px solid var(--border-subtle)', padding: '2rem 1.5rem 1.5rem' }}>
        <div className="page" style={{ paddingTop: 0, paddingBottom: 0 }}>
          <p className="section-label">Transparency</p>
          <h1 style={{ fontSize: '1.6rem', marginBottom: '0.35rem' }}>Doctor Directory</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Real-time availability across all interlinked hospitals
          </p>
        </div>
      </div>

      <div className="page" style={{ paddingTop: '1.75rem' }}>
        {/* Mini stats */}
        <div className="grid-3" style={{ marginBottom: '1.5rem' }}>
          {[
            { label: 'Total doctors', value: all.length, color: 'var(--text-primary)' },
            { label: 'On duty now',   value: onDuty,     color: 'var(--green)' },
            { label: 'Off duty',      value: offDuty,    color: 'var(--text-muted)' },
          ].map(s => (
            <div className="stat-card" key={s.label}>
              <span className="stat-label">{s.label}</span>
              <span className="stat-value" style={{ fontSize: '1.5rem', color: s.color }}>{s.value}</span>
            </div>
          ))}
        </div>

        {/* Specialty filter */}
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
          {SPECIALTIES.map(s => (
            <button
              key={s}
              className={`btn btn-sm ${spec === s ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setSpec(s)}
            >
              {s}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
            <div className="spinner spinner-lg" style={{ color: 'var(--green)' }} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="card empty-state">
            <div className="empty-state-icon"><Users size={22} /></div>
            <p style={{ fontWeight: 600 }}>No doctors found</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {filtered.map(doc => (
              <div
                key={doc._id}
                className="card"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem', gap: '1rem', flexWrap: 'wrap' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <div style={{
                    width: 38, height: 38, flexShrink: 0,
                    background: doc.is_available ? 'var(--green-dim)' : 'var(--bg-raised)',
                    border: `1px solid ${doc.is_available ? 'rgba(34,197,94,0.2)' : 'var(--border-subtle)'}`,
                    borderRadius: 'var(--radius)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: doc.is_available ? 'var(--green)' : 'var(--text-muted)',
                    transition: 'all 0.2s',
                  }}>
                    <Stethoscope size={16} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>Dr. {doc.name}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.1rem' }}>
                      {doc.specialty}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                  {doc.current_hospital?.name && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      <Building2 size={12} style={{ color: 'var(--text-muted)' }} />
                      {doc.current_hospital.name}
                    </div>
                  )}
                  <span className={`badge ${doc.is_available ? 'badge-green' : 'badge-red'}`}>
                    <span className={`status-dot ${doc.is_available ? 'dot-green' : 'dot-red'}`} />
                    {doc.is_available ? 'On duty' : 'Off duty'}
                  </span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    {doc.hospital_affiliations?.length ?? 0} hospital{doc.hospital_affiliations?.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
