import { useState, useCallback } from 'react';
import {
  Heart, AlertCircle, Flame, Baby, Brain, Stethoscope,
  LocateFixed, MapPin, Search, ChevronLeft,
  CheckCircle2, XCircle, Building2, Users,
  Star, Zap,
} from 'lucide-react';
import {
  searchHospitals, recommendHospitals,
  searchDoctors,
  logIncident, reportOutcome,
} from '../services/api';
import HospitalCard from '../components/HospitalCard';
import DoctorCard   from '../components/DoctorCard';
import GoldenHourTimer from '../components/GoldenHourTimer';
import MapView      from '../components/MapView';
import toast        from 'react-hot-toast';

/* ── Constants ──────────────────────────────── */
const CONDITIONS = [
  { id: 'Cardiac',   label: 'Cardiac',   Icon: Heart,       cls: 'tile-cardiac'   },
  { id: 'Trauma',    label: 'Trauma',    Icon: AlertCircle, cls: 'tile-trauma'    },
  { id: 'Burns',     label: 'Burns',     Icon: Flame,       cls: 'tile-burns'     },
  { id: 'Maternity', label: 'Maternity', Icon: Baby,        cls: 'tile-maternity' },
  { id: 'Neurology', label: 'Neurology', Icon: Brain,       cls: 'tile-neurology' },
  { id: 'General',   label: 'General',   Icon: Stethoscope, cls: 'tile-general'   },
];

const ICON_COLORS = {
  'tile-cardiac':   { bg: 'var(--red-dim)',    color: 'var(--red)'    },
  'tile-trauma':    { bg: 'var(--amber-dim)',  color: 'var(--amber)'  },
  'tile-burns':     { bg: 'var(--orange-dim)', color: 'var(--orange)' },
  'tile-maternity': { bg: 'var(--violet-dim)', color: 'var(--violet)' },
  'tile-neurology': { bg: 'var(--blue-dim)',   color: 'var(--blue)'   },
  'tile-general':   { bg: 'var(--green-dim)',  color: 'var(--green)'  },
};

/* ── Location button ────────────────────────── */
function LocationBtn({ location, locating, onLocate, onManualSet }) {
  const [showManual, setShowManual] = useState(false);

  const CITIES = [
    { name: 'Sukkur', lat: 27.7052, lng: 68.8574 },
    { name: 'Khairpur', lat: 27.5256, lng: 68.7551 },
    { name: 'Gambat', lat: 27.3500, lng: 68.5200 },
    { name: 'Lahore', lat: 31.5204, lng: 74.3188 },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <button
        id="get-location-btn"
        className={`btn ${location && !location.isManual ? 'btn-outline' : 'btn-primary'} btn-lg`}
        onClick={onLocate}
        disabled={locating}
        style={{ width: '100%', justifyContent: 'flex-start', gap: '0.85rem', padding: '0.9rem 1.25rem' }}
      >
        {locating ? (
          <><div className="spinner" /> Getting GPS location...</>
        ) : location && !location.isManual ? (
          <>
            <LocateFixed size={18} style={{ color: 'var(--green)', flexShrink: 0 }} />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>GPS Location acquired</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 400 }}>
                {location.lat.toFixed(5)}, {location.lng.toFixed(5)} · Tap to refresh
              </div>
            </div>
          </>
        ) : (
          <>
            <MapPin size={18} style={{ flexShrink: 0 }} />
            Use GPS Location
          </>
        )}
      </button>

      {/* Manual Search Options */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }} />
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>OR SELECT MANUALLY</span>
        <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }} />
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
        {CITIES.map(city => (
          <button
            key={city.name}
            className={`btn btn-sm ${location?.isManual && location?.name === city.name ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => onManualSet(city)}
          >
            {city.name}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── Hospital search tab ────────────────────── */
function HospitalSearch({ location, locating, onLocate, onManualSet }) {
  const [selected,     setSelected]     = useState(null);
  const [useRecommend, setUseRecommend] = useState(false);
  const [hospitals,    setHospitals]    = useState([]);
  const [loading,      setLoading]      = useState(false);
  const [step,         setStep]         = useState('select');
  const [incidentId,   setIncidentId]   = useState(null);
  const [incidentStartTime, setIncidentStartTime] = useState(null);
  const [outcomeTarget, setOutcomeTarget] = useState(null);

  const handleSearch = async () => {
    if (!selected) return toast.error('Select an emergency type first.');
    if (!location)  return toast.error('Get your location first.');
    setLoading(true);
    try {
      const fn = useRecommend ? recommendHospitals : searchHospitals;
      const { data } = await fn(location.lat, location.lng, selected);
      setHospitals(data);
      setStep('results');
      if (data.length > 0) {
        setIncidentStartTime(Date.now());
        const res = await logIncident({
          patient_condition: selected,
          driver_location: location,
          matched_hospital: data[0]._id,
          matched_hospital_name: data[0].name,
        });
        setIncidentId(res.data._id);
        localStorage.setItem('ghn_hospital_cache', JSON.stringify(data));
      } else {
        toast('No matching hospitals found within 50 km.', { icon: null });
      }
    } catch {
      const cached = localStorage.getItem('ghn_hospital_cache');
      if (cached) { setHospitals(JSON.parse(cached)); setStep('results'); toast('Offline — showing last cached results.', { icon: null }); }
      else toast.error('Search failed. No cached data available.');
    } finally { setLoading(false); }
  };

  const handleNavigate = (h) => {
    const c = h.location?.coordinates;
    const originParam = location && location.lat ? `&origin=${location.lat},${location.lng}` : '';
    const url = c
      ? `https://www.google.com/maps/dir/?api=1&destination=${c[1]},${c[0]}${originParam}`
      : `https://www.google.com/maps/search/${encodeURIComponent(h.name)}`;
    window.open(url, '_blank');
    setTimeout(() => setOutcomeTarget(h), 8000);
  };

  const handleOutcome = async (outcome) => {
    if (incidentId) {
      try { await reportOutcome(incidentId, outcome); toast.success('Outcome recorded.'); }
      catch { /* silent */ }
    }
    setOutcomeTarget(null);
  };

  const reset = () => { setStep('select'); setHospitals([]); setSelected(null); };

  return (
    <>
      {step === 'select' ? (
        <div className="fade-in">
          {/* Location */}
          <div style={{ marginBottom: '1.75rem' }}>
            <p className="section-label">Step 1 — Your Location</p>
            <LocationBtn location={location} locating={locating} onLocate={onLocate} onManualSet={onManualSet} />
          </div>

          {/* Condition */}
          <div style={{ marginBottom: '1.75rem' }}>
            <p className="section-label">Step 2 — Emergency Type</p>
            <div className="condition-grid">
              {CONDITIONS.map(({ id, label, Icon, cls }) => {
                const colors = ICON_COLORS[cls];
                return (
                  <button
                    key={id}
                    id={`condition-${id.toLowerCase()}`}
                    className={`condition-tile ${cls} ${selected === id ? 'selected' : ''}`}
                    onClick={() => setSelected(id)}
                  >
                    <div className="condition-tile-icon" style={{ background: colors.bg, color: colors.color }}>
                      <Icon size={18} strokeWidth={2} />
                    </div>
                    <span className="condition-tile-label">{label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mode toggle */}
          <div style={{ marginBottom: '1.5rem' }}>
            <p className="section-label">Step 3 — Search Mode</p>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                className={`btn ${!useRecommend ? 'btn-primary' : 'btn-outline'} btn-sm`}
                onClick={() => setUseRecommend(false)}
              >
                <Search size={14} /> Nearest
              </button>
              <button
                className={`btn ${useRecommend ? 'btn-primary' : 'btn-outline'} btn-sm`}
                onClick={() => setUseRecommend(true)}
              >
                <Star size={14} /> Best Match
              </button>
            </div>
            <p style={{ fontSize: '0.73rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
              {useRecommend
                ? 'Scores hospitals by reliability, beds, doctors, and distance.'
                : 'Finds nearest available hospitals with required speciality.'}
            </p>
          </div>

          <button
            id="search-hospitals-btn"
            className="btn btn-primary btn-xl"
            onClick={handleSearch}
            disabled={loading || !selected || !location}
          >
            {loading ? <><div className="spinner" /> Searching...</> : <><Search size={18} /> Find hospitals</>}
          </button>
        </div>
      ) : (
        <div className="fade-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <p className="section-label">{useRecommend ? 'Best Match' : 'Nearest'} · {selected}</p>
              <h3>{hospitals.length} hospital{hospitals.length !== 1 ? 's' : ''} found</h3>
            </div>
            <button className="btn btn-outline btn-sm" onClick={reset}>
              <ChevronLeft size={14} /> Back
            </button>
          </div>

          {incidentStartTime && <GoldenHourTimer startTime={incidentStartTime} />}

          {hospitals.length > 0 && <MapView driverLocation={location} hospitals={hospitals} />}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
            {hospitals.length === 0 ? (
              <div className="card empty-state">
                <div className="empty-state-icon"><Building2 size={22} /></div>
                <p style={{ fontWeight: 600 }}>No hospitals found</p>
              </div>
            ) : (
              hospitals.map((h, i) => (
                <div key={h._id}>
                  {/* Composite score badge if in recommend mode */}
                  {useRecommend && h.composite_score != null && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                      <Zap size={13} style={{ color: 'var(--green)' }} />
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                        Composite score: <strong style={{ color: 'var(--green)' }}>{h.composite_score}/100</strong>
                        {' · '}Reliability {h.scores?.reliability}% · Beds {h.scores?.beds}%
                      </span>
                    </div>
                  )}
                  <HospitalCard
                    hospital={h}
                    rank={i + 1}
                    onNavigate={handleNavigate}
                    onReport={(h) => setOutcomeTarget(h)}
                  />
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Outcome modal */}
      {outcomeTarget && (
        <div className="modal-overlay" onClick={() => setOutcomeTarget(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <p className="modal-title">Was the patient accepted?</p>
            <p className="modal-sub">at {outcomeTarget.name}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <button id="outcome-admitted-btn" className="btn btn-primary btn-xl" onClick={() => handleOutcome('Admitted')}>
                <CheckCircle2 size={18} /> Yes, admitted
              </button>
              <button id="outcome-turned-away-btn" className="btn btn-danger btn-xl" onClick={() => handleOutcome('Turned_Away')}>
                <XCircle size={18} /> Turned away
              </button>
              <button className="btn btn-ghost btn-sm" style={{ color: 'var(--text-muted)' }} onClick={() => setOutcomeTarget(null)}>
                Skip
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ── Doctor search tab ──────────────────────── */
function DoctorSearch({ location, locating, onLocate, onManualSet }) {
  const [specialty,    setSpecialty]    = useState('All');
  const [availOnly,    setAvailOnly]    = useState(false);
  const [doctors,      setDoctors]      = useState([]);
  const [loading,      setLoading]      = useState(false);
  const [searched,     setSearched]     = useState(false);

  const handleSearch = async () => {
    if (!location) return toast.error('Get your location first.');
    setLoading(true);
    try {
      const { data } = await searchDoctors(location.lat, location.lng, specialty, availOnly);
      setDoctors(data);
      setSearched(true);
      if (data.length === 0) toast('No doctors found nearby.', { icon: null });
    } catch {
      toast.error('Doctor search failed.');
    } finally { setLoading(false); }
  };

  return (
    <div className="fade-in">
      {/* Location */}
      <div style={{ marginBottom: '1.75rem' }}>
        <p className="section-label">Step 1 — Your Location</p>
        <LocationBtn location={location} locating={locating} onLocate={onLocate} onManualSet={onManualSet} />
      </div>

      {/* Specialty filter */}
      <div style={{ marginBottom: '1.5rem' }}>
        <p className="section-label">Step 2 — Specialization</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
          {['All', ...CONDITIONS.map(c => c.id)].map(s => (
            <button
              key={s}
              className={`btn btn-sm ${specialty === s ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setSpecialty(s)}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Available only toggle */}
      <div style={{ marginBottom: '1.75rem' }}>
        <p className="section-label">Step 3 — Filter</p>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
          <div
            onClick={() => setAvailOnly(!availOnly)}
            style={{
              width: 40, height: 22,
              borderRadius: 999,
              background: availOnly ? 'var(--green)' : 'var(--bg-raised)',
              border: `1px solid ${availOnly ? 'var(--green)' : 'var(--border-default)'}`,
              position: 'relative',
              transition: 'all 0.2s',
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            <div style={{
              width: 16, height: 16,
              borderRadius: '50%',
              background: '#fff',
              position: 'absolute',
              top: 2,
              left: availOnly ? 20 : 2,
              transition: 'left 0.2s',
              boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
            }} />
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 500 }}>Available / On schedule now only</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Shows doctors currently on duty or within their schedule slot</div>
          </div>
        </label>
      </div>

      <button
        id="search-doctors-btn"
        className="btn btn-primary btn-xl"
        onClick={handleSearch}
        disabled={loading || !location}
        style={{ marginBottom: '1.5rem' }}
      >
        {loading ? <><div className="spinner" /> Searching...</> : <><Users size={18} /> Find specialists</>}
      </button>

      {/* Results */}
      {searched && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <p className="section-label">{doctors.length} specialist{doctors.length !== 1 ? 's' : ''} found</p>
            {availOnly && <span className="badge badge-green">Available now filter active</span>}
          </div>

          {doctors.length === 0 ? (
            <div className="card empty-state">
              <div className="empty-state-icon"><Users size={22} /></div>
              <p style={{ fontWeight: 600 }}>No doctors found</p>
              <p style={{ fontSize: '0.82rem' }}>Try a different specialty or disable the availability filter.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {doctors.map(doc => (
                <DoctorCard key={doc._id} doctor={doc} showSchedule />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Main DriverPage ────────────────────────── */
export default function DriverPage() {
  const [activeTab, setActiveTab] = useState('hospital');
  const [location,  setLocation]  = useState(null);
  const [locating,  setLocating]  = useState(false);

  const handleLocate = useCallback(() => {
    if (!navigator.geolocation) {
      toast.error('Auto-location requires HTTPS. Please select a city manually below.');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
        toast.success('Location acquired');
      },
      (err) => {
        setLocating(false);
        if (err.code === 1) toast.error('Permission denied. Please allow location access in browser settings.');
        else if (err.code === 2) toast.error('Location unavailable. Please turn on your device GPS/Location.');
        else if (err.code === 3) toast.error('Location request timed out. Try again.');
        else toast.error('Unable to get location. Please turn on your GPS.');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  }, []);

  const handleManualSet = (city) => {
    setLocation({ lat: city.lat, lng: city.lng, isManual: true, name: city.name });
    toast.success(`Location set to ${city.name}`);
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 60px)' }}>
      {/* Header */}
      <div style={{
        borderBottom: '1px solid var(--border-subtle)',
        background: 'linear-gradient(180deg, rgba(34,197,94,0.04) 0%, transparent 100%)',
        padding: '2rem 1.5rem 0',
      }}>
        <div className="page" style={{ paddingTop: 0, paddingBottom: 0 }}>
          <p className="section-label" style={{ marginBottom: '0.35rem' }}>Emergency Routing</p>
          <h1 style={{ marginBottom: '1.25rem' }}>
            Find the right<br />
            <span style={{
              background: 'linear-gradient(90deg, var(--green), #86efac)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              {activeTab === 'hospital' ? 'hospital' : 'specialist'}
            </span>
          </h1>

          {/* Tab switcher */}
          <div className="tabs">
            <button
              className={`tab-btn ${activeTab === 'hospital' ? 'active' : ''}`}
              onClick={() => setActiveTab('hospital')}
              id="tab-hospital"
            >
              <Building2 size={15} /> Hospital Search
            </button>
            <button
              className={`tab-btn ${activeTab === 'doctor' ? 'active' : ''}`}
              onClick={() => setActiveTab('doctor')}
              id="tab-doctor"
            >
              <Users size={15} /> Doctor Search
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="page" style={{ paddingTop: '1.75rem' }}>
        {activeTab === 'hospital' ? (
          <HospitalSearch location={location} locating={locating} onLocate={handleLocate} onManualSet={handleManualSet} />
        ) : (
          <DoctorSearch   location={location} locating={locating} onLocate={handleLocate} onManualSet={handleManualSet} />
        )}
      </div>
    </div>
  );
}
