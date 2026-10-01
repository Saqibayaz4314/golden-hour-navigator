import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getHospital, updateResources, getDoctors, updateDoctorSchedule, whistleblow } from '../services/api';
import {
  Bed, Zap, Save, ShieldAlert, Users, BarChart3,
  CheckCircle, Shield, ToggleLeft, ToggleRight,
} from 'lucide-react';
import toast from 'react-hot-toast';

/* ── Status Toggle Component ── */
function StatusRow({ label, value, onChange, id }) {
  const opts = [
    { val: 'green', label: 'Available' },
    { val: 'yellow', label: 'Near Full' },
    { val: 'red',   label: 'Full' },
  ];
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem 0', borderBottom: '1px solid var(--border-subtle)', gap: '1rem' }}>
      <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)', flexShrink: 0 }}>{label}</span>
      <div className="status-group">
        {opts.map(o => (
          <button
            key={o.val}
            id={`${id}-${o.val}`}
            className={`status-pill ${value === o.val ? `active-${o.val}` : ''}`}
            onClick={() => onChange(o.val)}
          >
            <span className={`status-dot dot-${o.val}`} />
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function HospitalDashboard() {
  const { user } = useAuth();
  const [hospital, setHospital]   = useState(null);
  const [doctors, setDoctors]     = useState([]);
  const [tab, setTab]             = useState('resources');
  const [saving, setSaving]       = useState(false);
  const [whistleModal, setWhistleModal] = useState(false);
  const [whistleNote, setWhistleNote]   = useState('');

  const [res, setRes] = useState({
    beds_available: 0, beds_total: 0,
    beds_status: 'green', oxygen_status: 'green',
    icu_available: false, critical_medicines: '',
  });

  useEffect(() => {
    if (user?.hospital) {
      getHospital(user.hospital)
        .then(({ data }) => {
          setHospital(data);
          setRes({
            beds_available:    data.resources?.beds_available ?? 0,
            beds_total:        data.resources?.beds_total ?? 0,
            beds_status:       data.resources?.beds_status ?? 'green',
            oxygen_status:     data.resources?.oxygen_status ?? 'green',
            icu_available:     data.resources?.icu_available ?? false,
            critical_medicines:(data.resources?.critical_medicines ?? []).join(', '),
          });
        })
        .catch(() => toast.error('Could not load hospital data.'));
    }
    getDoctors()
      .then(({ data }) => setDoctors(data))
      .catch(() => {});
  }, [user]);

  const handleSave = async () => {
    if (!user?.hospital) return;
    setSaving(true);
    try {
      await updateResources(user.hospital, {
        ...res,
        critical_medicines: res.critical_medicines.split(',').map(s => s.trim()).filter(Boolean),
      });
      toast.success('Resources updated.');
    } catch {
      toast.error('Update failed.');
    } finally {
      setSaving(false);
    }
  };

  const handleDoctorToggle = async (doc) => {
    const next = !doc.is_available;
    try {
      await updateDoctorSchedule(doc._id, {
        is_available: next,
        current_hospital: next ? user?.hospital : null,
      });
      setDoctors(prev => prev.map(d => d._id === doc._id ? { ...d, is_available: next } : d));
      toast.success(`Dr. ${doc.name} marked ${next ? 'on duty' : 'off duty'}.`);
    } catch {
      toast.error('Could not update status.');
    }
  };

  const handleWhistle = async () => {
    if (!whistleNote.trim()) return toast.error('Please describe the issue.');
    try {
      await whistleblow('anonymous', whistleNote);
      toast.success('Anonymous report submitted.');
      setWhistleModal(false);
      setWhistleNote('');
    } catch {
      toast.error('Could not submit report.');
    }
  };

  const myDoctors = doctors.filter(d =>
    d.hospital_affiliations?.some(a =>
      a.hospital_id?.toString() === user?.hospital?.toString()
    )
  );

  const reliabilityColor =
    (hospital?.reliability_score ?? 100) >= 80 ? 'var(--green)' :
    (hospital?.reliability_score ?? 100) >= 55 ? 'var(--amber)' :
    'var(--red)';

  return (
    <div style={{ minHeight: 'calc(100vh - 60px)' }}>

      {/* ── Page Header ── */}
      <div style={{ borderBottom: '1px solid var(--border-subtle)', padding: '2rem 1.5rem 1.5rem' }}>
        <div className="page-wide" style={{ paddingTop: 0, paddingBottom: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <p className="section-label">Hospital Dashboard</p>
              <h1 style={{ fontSize: '1.6rem' }}>{hospital?.name ?? '—'}</h1>
              {hospital && (
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                  <span className={`badge ${hospital.type === 'Public' ? 'badge-blue' : 'badge-violet'}`}>
                    {hospital.type}
                  </span>
                  <span className="badge badge-green">
                    <Shield size={10} />
                    {hospital.reliability_score}% reliable
                  </span>
                </div>
              )}
            </div>
            <button
              id="whistleblow-btn"
              className="btn btn-outline btn-sm"
              style={{ color: 'var(--red)', borderColor: 'rgba(239,68,68,0.25)' }}
              onClick={() => setWhistleModal(true)}
            >
              <ShieldAlert size={15} />
              Report Discrepancy
            </button>
          </div>
        </div>
      </div>

      <div className="page-wide" style={{ paddingTop: '1.75rem' }}>

        {/* ── Stats ── */}
        <div className="grid-3" style={{ marginBottom: '2rem' }}>
          <div className="stat-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <Bed size={16} style={{ color: 'var(--text-muted)' }} />
              <span className="stat-label">Beds Available</span>
            </div>
            <div className="stat-value" style={{ color: res.beds_status === 'green' ? 'var(--green)' : res.beds_status === 'yellow' ? 'var(--amber)' : 'var(--red)' }}>
              {res.beds_available}
            </div>
            <div className="stat-sub">of {res.beds_total} total</div>
          </div>

          <div className="stat-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <Users size={16} style={{ color: 'var(--text-muted)' }} />
              <span className="stat-label">Doctors On Duty</span>
            </div>
            <div className="stat-value" style={{ color: 'var(--green)' }}>
              {myDoctors.filter(d => d.is_available).length}
            </div>
            <div className="stat-sub">of {myDoctors.length} affiliated</div>
          </div>

          <div className="stat-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <BarChart3 size={16} style={{ color: 'var(--text-muted)' }} />
              <span className="stat-label">Reliability Score</span>
            </div>
            <div className="stat-value" style={{ color: reliabilityColor }}>
              {hospital?.reliability_score ?? 100}%
            </div>
            <div className="stat-sub">based on driver reports</div>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="tabs">
          <button className={`tab-btn ${tab === 'resources' ? 'active' : ''}`} onClick={() => setTab('resources')}>
            <Bed size={15} /> Resources
          </button>
          <button className={`tab-btn ${tab === 'doctors' ? 'active' : ''}`} onClick={() => setTab('doctors')}>
            <Users size={15} /> Doctors ({myDoctors.length})
          </button>
        </div>

        {/* ── Resources Tab ── */}
        {tab === 'resources' && (
          <div className="fade-in" style={{ maxWidth: 580 }}>
            <div className="card" style={{ padding: '0 1.5rem' }}>

              <StatusRow
                label="Beds capacity"
                value={res.beds_status}
                onChange={v => setRes({ ...res, beds_status: v })}
                id="beds-status"
              />
              <StatusRow
                label="Oxygen supply"
                value={res.oxygen_status}
                onChange={v => setRes({ ...res, oxygen_status: v })}
                id="oxygen-status"
              />

              {/* Bed numbers */}
              <div style={{ display: 'flex', gap: '1rem', padding: '1rem 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="label">Available beds</label>
                  <input
                    type="number" min={0} className="input"
                    value={res.beds_available}
                    onChange={e => setRes({ ...res, beds_available: Number(e.target.value) })}
                  />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="label">Total beds</label>
                  <input
                    type="number" min={0} className="input"
                    value={res.beds_total}
                    onChange={e => setRes({ ...res, beds_total: Number(e.target.value) })}
                  />
                </div>
              </div>

              {/* ICU */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)' }}>ICU available</span>
                <button
                  id={`icu-toggle`}
                  onClick={() => setRes({ ...res, icu_available: !res.icu_available })}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: res.icu_available ? 'var(--green)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', fontWeight: 600 }}
                >
                  {res.icu_available ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                  {res.icu_available ? 'Yes' : 'No'}
                </button>
              </div>

              {/* Medicines */}
              <div className="form-group" style={{ padding: '1rem 0' }}>
                <label className="label">Critical medicines (comma-separated)</label>
                <input
                  type="text" className="input"
                  placeholder="e.g. Morphine, Atropine, Adrenaline"
                  value={res.critical_medicines}
                  onChange={e => setRes({ ...res, critical_medicines: e.target.value })}
                />
              </div>
            </div>

            <button
              id="save-resources-btn"
              className="btn btn-primary btn-lg"
              style={{ width: '100%', marginTop: '1rem' }}
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? <><div className="spinner" /> Saving...</> : <><Save size={17} /> Save changes</>}
            </button>
          </div>
        )}

        {/* ── Doctors Tab ── */}
        {tab === 'doctors' && (
          <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {myDoctors.length === 0 ? (
              <div className="empty-state card">
                <div className="empty-state-icon"><Users size={22} /></div>
                <p style={{ fontWeight: 600 }}>No doctors affiliated</p>
                <p style={{ fontSize: '0.82rem' }}>No doctors are linked to this hospital yet.</p>
              </div>
            ) : myDoctors.map(doc => (
              <div
                key={doc._id}
                className="card"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem', gap: '1rem', flexWrap: 'wrap' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <div style={{
                    width: 38, height: 38, flexShrink: 0,
                    background: 'var(--bg-raised)',
                    border: '1px solid var(--border-default)',
                    borderRadius: 'var(--radius)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--text-muted)',
                  }}>
                    <Users size={16} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>Dr. {doc.name}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.1rem' }}>{doc.specialty}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span className={`badge ${doc.is_available ? 'badge-green' : 'badge-red'}`}>
                    <span className={`status-dot ${doc.is_available ? 'dot-green' : 'dot-red'}`} />
                    {doc.is_available ? 'On duty' : 'Off duty'}
                  </span>
                  <button
                    id={`doctor-toggle-${doc._id}`}
                    className={`btn ${doc.is_available ? 'btn-outline' : 'btn-primary'} btn-sm`}
                    onClick={() => handleDoctorToggle(doc)}
                  >
                    {doc.is_available ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                    {doc.is_available ? 'Mark off duty' : 'Mark on duty'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Whistleblow Modal ── */}
      {whistleModal && (
        <div className="modal-overlay" onClick={() => setWhistleModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
              <div style={{ width: 36, height: 36, background: 'var(--red-dim)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--red)', flexShrink: 0 }}>
                <ShieldAlert size={18} />
              </div>
              <p className="modal-title">Anonymous Report</p>
            </div>
            <p className="modal-sub">
              Your identity is fully protected. Report a discrepancy between the system data and the actual situation.
            </p>

            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label className="label">Describe the issue</label>
              <textarea
                className="input"
                rows={4}
                placeholder="e.g. System shows beds available but all wards are full..."
                value={whistleNote}
                onChange={e => setWhistleNote(e.target.value)}
                style={{ resize: 'vertical' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.6rem' }}>
              <button className="btn btn-ghost btn-lg" style={{ flex: 1 }} onClick={() => setWhistleModal(false)}>
                Cancel
              </button>
              <button
                id="submit-whistleblow-btn"
                className="btn btn-danger btn-lg"
                style={{ flex: 2 }}
                onClick={handleWhistle}
              >
                <CheckCircle size={16} />
                Submit anonymously
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
