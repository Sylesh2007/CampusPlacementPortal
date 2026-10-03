const mongoose = require('mongoose');

const companySchema = new mongoose.Schema(
  {
    companyId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    companyName: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    website: {
      type: String,
      required: true,
      trim: true,
    },
    HRName: {
      type: String,
      required: true,
      trim: true,
    },
    packageOffered: {
      type: String,
      required: true,
      trim: true,
    },
    eligibilityCriteria: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Company', companySchema);
