import { useState, useEffect } from 'react';
import { getAllHospitals, getDoctors } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, CartesianGrid } from 'recharts';
import { Activity, Users, Shield, Building2, TrendingUp } from 'lucide-react';

export default function SystemAnalytics() {
  const [hospitals, setHospitals] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getAllHospitals(), getDoctors()])
      .then(([hRes, dRes]) => {
        setHospitals(hRes.data);
        setDoctors(dRes.data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem' }}>
        <div className="spinner spinner-lg" style={{ color: 'var(--green)' }} />
      </div>
    );
  }

  // Aggregate Data
  const totalBeds = hospitals.reduce((sum, h) => sum + (h.resources?.beds_total || 0), 0);
  const availableBeds = hospitals.reduce((sum, h) => sum + (h.resources?.beds_available || 0), 0);
  
  const onDutyDoctors = doctors.filter(d => d.is_available).length;
  const avgReliability = Math.round(hospitals.reduce((sum, h) => sum + (h.reliability_score || 100), 0) / (hospitals.length || 1));

  // Chart Data: Beds by Hospital
  const bedData = hospitals.map(h => ({
    name: h.name.replace(' Hospital', '').replace(' Institute of Medical Sciences', ''), // Shorten name
    available: h.resources?.beds_available || 0,
    occupied: (h.resources?.beds_total || 0) - (h.resources?.beds_available || 0)
  }));

  // Chart Data: Reliability Scores
  const reliabilityData = hospitals.map(h => ({
    name: h.name.replace(' Hospital', '').replace(' Institute of Medical Sciences', ''),
    score: h.reliability_score || 100
  })).sort((a, b) => b.score - a.score);

  return (
    <div style={{ minHeight: 'calc(100vh - 60px)' }}>
      
      {/* Header */}
      <div style={{ borderBottom: '1px solid var(--border-subtle)', padding: '2rem 1.5rem 1.5rem' }}>
        <div className="page" style={{ paddingTop: 0, paddingBottom: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <div style={{ padding: '0.5rem', background: 'var(--green-dim)', color: 'var(--green)', borderRadius: 'var(--radius)' }}>
              <Activity size={24} />
            </div>
            <div>
              <p className="section-label">Unified Command Center</p>
              <h1 style={{ fontSize: '1.8rem', margin: 0 }}>Network Analytics</h1>
            </div>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
            Real-time telemetry and resource aggregation across the entire interlinked emergency network.
          </p>
        </div>
      </div>

      <div className="page" style={{ paddingTop: '2rem' }}>
        
        {/* Top KPI Cards */}
        <div className="grid-3" style={{ marginBottom: '2rem', gap: '1.5rem' }}>
          
          <div className="card" style={{ padding: '1.5rem', borderLeft: '4px solid var(--green)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>Total Available Beds</p>
                <div style={{ fontSize: '2.5rem', fontWeight: 700, marginTop: '0.5rem', color: 'var(--text-primary)' }}>
                  {availableBeds} <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 400 }}>/ {totalBeds}</span>
                </div>
              </div>
              <div style={{ padding: '0.75rem', background: 'var(--bg-base)', borderRadius: '50%', color: 'var(--green)' }}>
                <Building2 size={24} />
              </div>
            </div>
            <div style={{ marginTop: '1rem', height: 4, background: 'var(--bg-base)', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ width: `${(availableBeds / totalBeds) * 100}%`, height: '100%', background: 'var(--green)' }} />
            </div>
          </div>

          <div className="card" style={{ padding: '1.5rem', borderLeft: '4px solid var(--blue)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>Live Doctors On Duty</p>
                <div style={{ fontSize: '2.5rem', fontWeight: 700, marginTop: '0.5rem', color: 'var(--text-primary)' }}>
                  {onDutyDoctors} <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 400 }}>/ {doctors.length}</span>
                </div>
              </div>
              <div style={{ padding: '0.75rem', background: 'var(--bg-base)', borderRadius: '50%', color: 'var(--blue)' }}>
                <Users size={24} />
              </div>
            </div>
            <p style={{ marginTop: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <TrendingUp size={14} color="var(--blue)" /> Detected via schedule matrix
            </p>
          </div>

          <div className="card" style={{ padding: '1.5rem', borderLeft: '4px solid var(--amber)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>Avg Reliability Score</p>
                <div style={{ fontSize: '2.5rem', fontWeight: 700, marginTop: '0.5rem', color: 'var(--text-primary)' }}>
                  {avgReliability}%
                </div>
              </div>
              <div style={{ padding: '0.75rem', background: 'var(--bg-base)', borderRadius: '50%', color: 'var(--amber)' }}>
                <Shield size={24} />
              </div>
            </div>
            <p style={{ marginTop: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Based on {hospitals.length} active facilities
            </p>
          </div>

        </div>

        {/* Charts Section */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
          
          {/* Bed Availability Chart */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Building2 size={18} color="var(--green)" /> Real-Time Bed Capacity
            </h3>
            <div style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={bedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                  <XAxis dataKey="name" stroke="#888" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Bar dataKey="available" name="Available Beds" stackId="a" fill="#22c55e" radius={[0,0,4,4]} />
                  <Bar dataKey="occupied" name="Occupied Beds" stackId="a" fill="#3f3f46" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Reliability Chart */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Shield size={18} color="var(--amber)" /> Hospital Reliability Matrix
            </h3>
            <div style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={reliabilityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                  <XAxis dataKey="name" stroke="#888" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
                  <Tooltip 
                    contentStyle={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }}
                  />
                  <Area type="monotone" dataKey="score" name="Reliability %" stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
