import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const api = axios.create({ baseURL: API_URL });

// ── Hospitals ──────────────────────────────
export const searchHospitals  = (lat, lng, condition) =>
  api.get(`/hospitals/search?lat=${lat}&lng=${lng}&condition=${condition}`);

export const recommendHospitals = (lat, lng, condition = 'All') =>
  api.get(`/hospitals/recommend?lat=${lat}&lng=${lng}&condition=${condition}`);

export const getAllHospitals  = () => api.get('/hospitals');
export const getHospital      = (id) => api.get(`/hospitals/${id}`);
export const updateResources  = (id, data) => api.put(`/hospitals/${id}/resources`, data);
export const getSystemStats   = () => api.get('/hospitals/stats');

// ── Doctors ───────────────────────────────
export const getDoctors       = () => api.get('/doctors');
export const searchDoctors    = (lat, lng, specialty = 'All', available_now = false) =>
  api.get(`/doctors/search?lat=${lat}&lng=${lng}&specialty=${specialty}&available_now=${available_now}`);
export const updateDoctorSchedule = (id, data) => api.put(`/doctors/${id}/schedule`, data);

// ── Incidents ─────────────────────────────
export const logIncident      = (data) => api.post('/incidents', data);
export const reportOutcome    = (id, outcome) => api.put(`/incidents/${id}/outcome`, { outcome });
export const whistleblow      = (id, note)    => api.post(`/incidents/${id}/whistleblow`, { discrepancy_note: note });

export { api };
