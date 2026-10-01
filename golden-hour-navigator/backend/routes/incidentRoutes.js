const express = require('express');
const Incident = require('../models/Incident');
const Hospital = require('../models/Hospital');
const router = express.Router();

// @route   POST /api/incidents
// @desc    Log a new incident search
// @access  Public
router.post('/', async (req, res) => {
  try {
    const incident = await Incident.create(req.body);
    res.status(201).json(incident);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// @route   PUT /api/incidents/:id/outcome
// @desc    Driver reports outcome — Admitted or Turned Away
// @access  Public
router.put('/:id/outcome', async (req, res) => {
  try {
    const { outcome } = req.body;
    const incident = await Incident.findByIdAndUpdate(
      req.params.id,
      { outcome },
      { new: true }
    );

    if (!incident) return res.status(404).json({ message: 'Incident not found' });

    // Adjust hospital reliability score
    if (incident.matched_hospital) {
      const hospital = await Hospital.findById(incident.matched_hospital);
      if (hospital) {
        if (outcome === 'Admitted') {
          hospital.reliability_score = Math.min(100, hospital.reliability_score + 1);
        } else if (outcome === 'Turned_Away') {
          hospital.reliability_score = Math.max(0, hospital.reliability_score - 5);
        }
        await hospital.save();
      }
    }

    res.json(incident);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   POST /api/incidents/:id/whistleblow
// @desc    Anonymous staff report of discrepancy
// @access  Public (anonymous)
router.post('/:id/whistleblow', async (req, res) => {
  try {
    const { discrepancy_note } = req.body;
    const incident = await Incident.findByIdAndUpdate(
      req.params.id,
      { discrepancy_reported: true, discrepancy_note },
      { new: true }
    );
    res.json({ message: 'Report received anonymously. Thank you.', incident });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   GET /api/incidents
// @desc    Get all incidents (for analytics)
// @access  Private
router.get('/', async (req, res) => {
  try {
    const incidents = await Incident.find()
      .populate('matched_hospital', 'name')
      .sort({ createdAt: -1 });
    res.json(incidents);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
