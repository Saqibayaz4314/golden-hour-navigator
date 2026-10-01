const mongoose = require('mongoose');

const incidentSchema = new mongoose.Schema(
  {
    patient_condition: {
      type: String,
      required: true,
      enum: ['Cardiac', 'Trauma', 'Burns', 'Maternity', 'Neurology', 'General'],
    },
    driver_location: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    matched_hospital: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hospital',
    },
    matched_hospital_name: { type: String },
    outcome: {
      type: String,
      enum: ['Pending', 'Admitted', 'Turned_Away', 'Rerouted'],
      default: 'Pending',
    },
    // Anonymous whistleblower reports
    discrepancy_reported: { type: Boolean, default: false },
    discrepancy_note: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Incident', incidentSchema);
