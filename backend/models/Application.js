const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    applicationId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    studentId: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    driveId: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    applicationDate: {
      type: Date,
      default: Date.now,
      required: true,
    },
    status: {
      type: String,
      enum: [
        'Applied',
        'Under Review',
        'Verified',
        'Shortlisted',
        'Interview Scheduled',
        'Rejected',
        'Selected',
      ],
      default: 'Applied',
      index: true,
    },
    selected: {
      type: Boolean,
      default: false,
    },

    phone: { type: String, trim: true },
    alternatePhone: { type: String, trim: true },
    dateOfBirth: { type: String, trim: true },
    gender: { type: String, trim: true },
    address: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    pincode: { type: String, trim: true },
    preferredLocation: { type: String, trim: true },

    // Kept for compatibility with older applications already stored in MongoDB.
    college: { type: String, trim: true },
    degree: { type: String, trim: true },
    branch: { type: String, trim: true },
    graduationYear: { type: String, trim: true },
    cgpa: { type: String, trim: true },
    tenthPercentage: { type: String, trim: true },
    twelfthPercentage: { type: String, trim: true },
    backlogs: { type: String, default: '0', trim: true },
    skills: { type: String, trim: true },
    certifications: { type: String, trim: true },
    projects: { type: String, trim: true },
    internshipExperience: { type: String, trim: true },
    workExperience: { type: String, trim: true },
    linkedinUrl: { type: String, trim: true },
    githubUrl: { type: String, trim: true },
    portfolioUrl: { type: String, trim: true },
    coverLetter: { type: String, trim: true, maxlength: 5000 },
    noticePeriod: { type: String, trim: true },
    workAuthorization: { type: String, trim: true },
    relocation: { type: String, trim: true },
    expectedSalary: { type: String, trim: true },

    resume: {
      fileName: { type: String, trim: true },
      mimeType: { type: String, trim: true },
      size: { type: Number },
      data: {
        type: Buffer,
        select: false,
      },
    },

    consent: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// One application per student per placement drive.
applicationSchema.index(
  { studentId: 1, driveId: 1 },
  { unique: true }
);

module.exports = mongoose.model('Application', applicationSchema);
