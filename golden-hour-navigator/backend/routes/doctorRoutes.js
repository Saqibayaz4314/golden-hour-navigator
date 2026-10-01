const express = require('express');
const Doctor   = require('../models/Doctor');
const Hospital = require('../models/Hospital');
const { protect } = require('../middleware/auth');
const router = express.Router();

// ─────────────────────────────────────────
// Helper: is the doctor on duty right now?
// ─────────────────────────────────────────
function isOnScheduleNow(scheduleSlots) {
  const now = new Date();
  const dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const currentDay  = dayNames[now.getDay()];
  const currentMins = now.getHours() * 60 + now.getMinutes();

  return scheduleSlots?.some(slot => {
    if (!slot.days?.includes(currentDay)) return false;
    const [fH, fM] = (slot.time_from || '00:00').split(':').map(Number);
    const [tH, tM] = (slot.time_to   || '23:59').split(':').map(Number);
    const fromMins = fH * 60 + fM;
    const toMins   = tH * 60 + tM;
    return currentMins >= fromMins && currentMins <= toMins;
  });
}

// ─────────────────────────────────────────
// GET /api/doctors
// All doctors with populated hospital
// ─────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const doctors = await Doctor.find()
      .populate('current_hospital', 'name address');
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─────────────────────────────────────────
// GET /api/doctors/search
// Smart proximity + specialty search
// Query params: lat, lng, specialty, available_now (optional)
// ─────────────────────────────────────────
router.get('/search', async (req, res) => {
  const { lat, lng, specialty, available_now } = req.query;

  if (!lat || !lng) {
    return res.status(400).json({ message: 'lat and lng are required' });
  }

  try {
    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);

    // Build base query
    const query = {};
    if (specialty && specialty !== 'All') query.specialty = specialty;

    let doctors = await Doctor.find(query)
      .populate('hospital_affiliations.hospital_id', 'name address location type')
      .populate('current_hospital', 'name address');

    // Enrich each doctor with distance + live schedule check
    const enriched = doctors.map(doc => {
      const docObj = doc.toObject();

      // Find nearest affiliated hospital and calculate distance
      let minDist = Infinity;
      let nearestHospital = null;

      docObj.hospital_affiliations.forEach(aff => {
        const hosp = aff.hospital_id;
        if (hosp?.location?.coordinates?.length === 2) {
          const [hLng, hLat] = hosp.location.coordinates;
          const R = 6371; // Earth radius km
          const dLat = (hLat - userLat) * Math.PI / 180;
          const dLng = (hLng - userLng) * Math.PI / 180;
          const a = Math.sin(dLat/2)**2 +
                    Math.cos(userLat * Math.PI/180) * Math.cos(hLat * Math.PI/180) *
                    Math.sin(dLng/2)**2;
          const dist = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
          if (dist < minDist) {
            minDist = dist;
            nearestHospital = { ...hosp, distance_km: dist };
          }
        }

        // Annotate each affiliation with live schedule flag
        aff.on_schedule_now = isOnScheduleNow(aff.schedule);
      });

      docObj.nearest_hospital   = nearestHospital;
      docObj.distance_km        = minDist === Infinity ? null : minDist;
      docObj.on_schedule_now    = docObj.hospital_affiliations.some(a => a.on_schedule_now);

      return docObj;
    });

    // Filter by availability if requested
    let results = enriched;
    if (available_now === 'true') {
      results = results.filter(d => d.is_available || d.on_schedule_now);
    }

    // Sort: available first, then by distance
    results.sort((a, b) => {
      const aAvail = a.is_available || a.on_schedule_now ? 0 : 1;
      const bAvail = b.is_available || b.on_schedule_now ? 0 : 1;
      if (aAvail !== bAvail) return aAvail - bAvail;
      return (a.distance_km ?? 999) - (b.distance_km ?? 999);
    });

    // Only return within 50km
    results = results.filter(d => d.distance_km === null || d.distance_km <= 50);

    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// ─────────────────────────────────────────
// GET /api/doctors/:id
// ─────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id)
      .populate('hospital_affiliations.hospital_id', 'name address location type')
      .populate('current_hospital', 'name address');
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    res.json(doctor);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─────────────────────────────────────────
// POST /api/doctors
// ─────────────────────────────────────────
router.post('/', protect, async (req, res) => {
  try {
    const doctor = await Doctor.create(req.body);
    res.status(201).json(doctor);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ─────────────────────────────────────────
// PUT /api/doctors/:id/schedule
// Update duty status + current hospital
// ─────────────────────────────────────────
router.put('/:id/schedule', protect, async (req, res) => {
  try {
    const { is_available, current_hospital } = req.body;
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

    doctor.is_available     = is_available;
    doctor.current_hospital = is_available ? current_hospital : null;

    // Mark which affiliation is on duty
    if (current_hospital) {
      doctor.hospital_affiliations.forEach(aff => {
        aff.is_on_duty = aff.hospital_id.toString() === current_hospital.toString();
      });
    } else {
      doctor.hospital_affiliations.forEach(aff => { aff.is_on_duty = false; });
    }

    await doctor.save();
    res.json(doctor);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
