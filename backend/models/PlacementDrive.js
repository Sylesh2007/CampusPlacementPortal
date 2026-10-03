const mongoose = require('mongoose');

const placementDriveSchema = new mongoose.Schema(
  {
    driveId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    companyId: {
      type: String,
      required: true,
      trim: true,
      ref: 'Company',
    },
    jobRole: {
      type: String,
      required: true,
      trim: true,
    },
    driveDate: {
      type: Date,
      required: true,
    },
    venue: {
      type: String,
      required: true,
      trim: true,
    },
    lastDateToApply: {
      type: Date,
      required: true,
    },
    vacancies: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  {
    timestamps: true,
  }
);

placementDriveSchema.index({ companyId: 1 });

module.exports = mongoose.model('PlacementDrive', placementDriveSchema);
