import { useState, useEffect } from 'react';
import { getAllHospitals } from '../services/api';
import HospitalCard from '../components/HospitalCard';
import { Building2, Search, SlidersHorizontal } from 'lucide-react';

export default function HospitalsPage() {
  const [all, setAll]         = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery]     = useState('');
  const [type, setType]       = useState('All');

  useEffect(() => {
    getAllHospitals()
      .then(({ data }) => { setAll(data); setFiltered(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let res = all;
    if (type !== 'All') res = res.filter(h => h.type === type);
    if (query) res = res.filter(h =>
      h.name.toLowerCase().includes(query.toLowerCase()) ||
      h.address?.toLowerCase().includes(query.toLowerCase())
    );
    setFiltered(res);
  }, [query, type, all]);

  return (
    <div style={{ minHeight: 'calc(100vh - 60px)' }}>
      {/* Header */}
      <div style={{ borderBottom: '1px solid var(--border-subtle)', padding: '2rem 1.5rem 1.5rem' }}>
        <div className="page" style={{ paddingTop: 0, paddingBottom: 0 }}>
          <p className="section-label">Network</p>
          <h1 style={{ fontSize: '1.6rem', marginBottom: '0.35rem' }}>Hospitals</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            {all.length} hospitals registered in the unified network
          </p>
        </div>
      </div>

      <div className="page" style={{ paddingTop: '1.75rem' }}>
        {/* Filters */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <div className="input-icon-wrap" style={{ flex: 1, minWidth: 220 }}>
            <Search size={15} className="icon-left" />
            <input
              id="hospitals-search"
              className="input"
              placeholder="Search hospitals..."
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.4rem' }}>
            {['All', 'Public', 'Private'].map(t => (
              <button
                key={t}
                className={`btn btn-sm ${type === t ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setType(t)}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
            <div className="spinner spinner-lg" style={{ color: 'var(--green)' }} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="card empty-state">
            <div className="empty-state-icon"><Building2 size={22} /></div>
            <p style={{ fontWeight: 600 }}>No hospitals found</p>
            <p style={{ fontSize: '0.82rem' }}>Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {filtered.map((h, i) => (
              <HospitalCard key={h._id} hospital={h} rank={i + 1} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
