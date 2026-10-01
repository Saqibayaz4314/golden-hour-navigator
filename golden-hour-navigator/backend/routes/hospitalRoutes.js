const express = require('express');
const Hospital = require('../models/Hospital');
const Doctor = require('../models/Doctor');
const { protect } = require('../middleware/auth');
const router = express.Router();

// @route   GET /api/hospitals/search
// @desc    Search nearest capable hospitals by condition and GPS location
// @access  Public
router.get('/search', async (req, res) => {
  const { lat, lng, condition } = req.query;

  if (!lat || !lng || !condition) {
    return res.status(400).json({ message: 'lat, lng, and condition are required' });
  }

  try {
    // Use MongoDB $geoNear to find nearest hospitals that match the condition
    const hospitals = await Hospital.aggregate([
      {
        $geoNear: {
          near: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
          distanceField: 'distance_meters',
          maxDistance: 50000, // 50km radius
          spherical: true,
          query: {
            specialties: condition,
            'resources.beds_status': { $ne: 'red' }, // Not fully full
          },
        },
      },
      { $limit: 5 },
      {
        $project: {
          name: 1,
          type: 1,
          address: 1,
          phone: 1,
          resources: 1,
          specialties: 1,
          reliability_score: 1,
          last_updated: 1,
          distance_meters: 1,
          distance_km: { $divide: ['$distance_meters', 1000] },
        },
      },
    ]);

    // Enrich with available doctors for this condition
    const enriched = await Promise.all(
      hospitals.map(async (h) => {
        const doctors = await Doctor.find({
          specialty: condition,
          is_available: true,
          current_hospital: h._id,
        }).select('name specialty');
        return { ...h, available_doctors: doctors };
      })
    );

    res.json(enriched);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   GET /api/hospitals/recommend
// @desc    Smart recommendation — composite scoring algorithm
//          Score = reliability(35%) + beds(30%) + distance(25%) + doctors(10%)
// @access  Public
router.get('/recommend', async (req, res) => {
  const { lat, lng, condition } = req.query;
  if (!lat || !lng) return res.status(400).json({ message: 'lat and lng required' });

  try {
    const geoQuery = { 'resources.beds_status': { $ne: 'red' } };
    if (condition && condition !== 'All') geoQuery.specialties = condition;

    const hospitals = await Hospital.aggregate([
      {
        $geoNear: {
          near: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
          distanceField: 'distance_meters',
          maxDistance: 50000,
          spherical: true,
          query: geoQuery,
        },
      },
      { $limit: 20 },
      { $addFields: { distance_km: { $divide: ['$distance_meters', 1000] } } },
    ]);

    const enriched = await Promise.all(hospitals.map(async h => {
      const doctorQuery = { is_available: true, current_hospital: h._id };
      if (condition && condition !== 'All') doctorQuery.specialty = condition;
      const doctorCount = await Doctor.countDocuments(doctorQuery);

      const reliabilityScore = h.reliability_score || 0;
      const bedsScore        = h.resources?.beds_status === 'green' ? 100
                             : h.resources?.beds_status === 'yellow' ? 60 : 0;
      const distanceScore    = Math.max(0, 100 - (h.distance_km / 50) * 100);
      const doctorScore      = Math.min(100, doctorCount * 25);

      const compositeScore =
        reliabilityScore * 0.35 +
        bedsScore        * 0.30 +
        distanceScore    * 0.25 +
        doctorScore      * 0.10;

      return {
        ...h,
        available_doctors_count: doctorCount,
        scores: {
          reliability: reliabilityScore,
          beds: bedsScore,
          distance: Math.round(distanceScore),
          doctors: doctorScore,
        },
        composite_score: Math.round(compositeScore),
      };
    }));

    enriched.sort((a, b) => b.composite_score - a.composite_score);
    res.json(enriched.slice(0, 5));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// @route   GET /api/hospitals/stats
// @desc    System-wide analytics snapshot
// @access  Public
router.get('/stats', async (req, res) => {
  try {
    const [totalHospitals, totalDoctors, onDutyDoctors, avgArr] = await Promise.all([
      Hospital.countDocuments(),
      Doctor.countDocuments(),
      Doctor.countDocuments({ is_available: true }),
      Hospital.aggregate([{ $group: { _id: null, avg: { $avg: '$reliability_score' } } }]),
    ]);
    res.json({
      total_hospitals:  totalHospitals,
      total_doctors:    totalDoctors,
      doctors_on_duty:  onDutyDoctors,
      avg_reliability:  Math.round(avgArr[0]?.avg ?? 0),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   GET /api/hospitals
// @desc    Get all hospitals
// @access  Public
router.get('/', async (req, res) => {
  try {
    const hospitals = await Hospital.find().sort({ reliability_score: -1 });
    res.json(hospitals);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   GET /api/hospitals/:id
// @desc    Get a single hospital
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id);
    if (!hospital) return res.status(404).json({ message: 'Hospital not found' });
    res.json(hospital);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   POST /api/hospitals
// @desc    Create a hospital (admin only)
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const hospital = await Hospital.create(req.body);
    res.status(201).json(hospital);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// @route   PUT /api/hospitals/:id/resources
// @desc    Hospital staff updates their live resource status
// @access  Private
router.put('/:id/resources', protect, async (req, res) => {
  try {
    const { beds_available, beds_total, beds_status, oxygen_status, icu_available, critical_medicines } = req.body;

    const hospital = await Hospital.findByIdAndUpdate(
      req.params.id,
      {
        'resources.beds_available': beds_available,
        'resources.beds_total': beds_total,
        'resources.beds_status': beds_status,
        'resources.oxygen_status': oxygen_status,
        'resources.icu_available': icu_available,
        'resources.critical_medicines': critical_medicines,
        last_updated: new Date(),
      },
      { new: true, runValidators: true }
    );

    if (!hospital) return res.status(404).json({ message: 'Hospital not found' });
    res.json(hospital);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// @route   PUT /api/hospitals/:id/reliability
// @desc    Update reliability score (called after incident outcome)
// @access  Private
router.put('/:id/reliability', protect, async (req, res) => {
  try {
    const { outcome } = req.body; // 'Admitted' or 'Turned_Away'
    const hospital = await Hospital.findById(req.params.id);
    if (!hospital) return res.status(404).json({ message: 'Hospital not found' });

    if (outcome === 'Admitted') {
      hospital.reliability_score = Math.min(100, hospital.reliability_score + 1);
    } else if (outcome === 'Turned_Away') {
      hospital.reliability_score = Math.max(0, hospital.reliability_score - 5);
    }
    await hospital.save();
    res.json({ reliability_score: hospital.reliability_score });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
