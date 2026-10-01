const mongoose = require('mongoose');

const hospitalSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Hospital name is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['Public', 'Private'],
      required: true,
    },
    // GeoJSON Point for $geoNear spatial queries
    location: {
      type: {
        type: String,
        enum: ['Point'],
        required: true,
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },
    address: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
    },
    resources: {
      beds_total: { type: Number, default: 0 },
      beds_available: { type: Number, default: 0 },
      beds_status: {
        type: String,
        enum: ['green', 'yellow', 'red'],
        default: 'green',
      },
      oxygen_status: {
        type: String,
        enum: ['green', 'yellow', 'red'],
        default: 'green',
      },
      icu_available: { type: Boolean, default: false },
      critical_medicines: { type: [String], default: [] },
    },
    specialties: {
      type: [String], // e.g. ['Cardiac', 'Trauma', 'Maternity']
      default: [],
    },
    reliability_score: {
      type: Number,
      default: 100,
      min: 0,
      max: 100,
    },
    last_updated: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// 2dsphere index for geospatial queries
hospitalSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Hospital', hospitalSchema);
