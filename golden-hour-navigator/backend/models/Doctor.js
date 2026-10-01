const mongoose = require('mongoose');

const scheduleSlotSchema = new mongoose.Schema({
  days:      { type: [String], default: [] }, // ['Mon','Tue','Wed']
  time_from: { type: String }, // '09:00'
  time_to:   { type: String }, // '14:00'
}, { _id: false });

const affiliationSchema = new mongoose.Schema({
  hospital_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hospital',
    required: true,
  },
  hospital_name:     { type: String },
  hospital_address:  { type: String },
  is_on_duty:        { type: Boolean, default: false },
  // Rich schedule: multiple day/time slots at this hospital
  schedule: [scheduleSlotSchema],
}, { _id: true });

const doctorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Doctor name is required'],
      trim: true,
    },
    specialty: {
      type: String,
      required: true,
      enum: ['Cardiac', 'Trauma', 'Burns', 'Maternity', 'Neurology', 'General'],
    },
    qualifications: { type: [String], default: [] }, // e.g. ['MBBS','FCPS']
    experience_years: { type: Number, default: 0 },
    phone:  { type: String },
    bio:    { type: String },
    rating: { type: Number, default: 5.0, min: 1, max: 5 },

    // Multi-hospital affiliations with time slots
    hospital_affiliations: [affiliationSchema],

    // Live state
    is_available:     { type: Boolean, default: false },
    current_hospital: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hospital',
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Doctor', doctorSchema);
