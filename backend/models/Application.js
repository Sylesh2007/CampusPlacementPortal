const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    applicationId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    studentId: {
      type: String,
      required: true,
      trim: true,
      ref: 'User',
    },
    driveId: {
      type: String,
      required: true,
      trim: true,
      ref: 'PlacementDrive',
    },
    applicationDate: {
      type: Date,
      default: Date.now,
      required: true,
    },
    status: {
      type: String,
      enum: ['Applied', 'Verified', 'Under Review', 'Shortlisted', 'Selected', 'Rejected'],
      default: 'Applied',
      required: true,
    },
    selected: {
      type: Boolean,
      default: false,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

applicationSchema.index({ studentId: 1, driveId: 1 }, { unique: true });
applicationSchema.index({ driveId: 1 });
applicationSchema.index({ studentId: 1 });

module.exports = mongoose.model('Application', applicationSchema);
