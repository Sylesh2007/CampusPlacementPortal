const path = require('path');

const Application = require('../models/Application');
const PlacementDrive = require('../models/PlacementDrive');
const User = require('../models/User');
const Company = require('../models/Company');

const MAX_RESUME_SIZE = 5 * 1024 * 1024;
const ALLOWED_EXTENSIONS = new Set(['.pdf', '.doc', '.docx']);
const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/octet-stream',
]);

const makeApplicationId = () =>
  `APP${Date.now()}${Math.floor(Math.random() * 1000)}`;

const getUserRole = (req) => String(req.user?.role || '').toLowerCase();

const normalize = (value) => String(value || '').trim().toLowerCase();

const getCompanyIdsForUser = async (user) => {
  if (!user) return [];

  const values = [
    user.userId,
    user.companyId,
    user.name,
    user.email,
  ].filter(Boolean);

  const companyOr = [
    { companyId: user.userId },
    { companyId: user.companyId },
    { HRName: user.name },
    { email: user.email },
    { HREmail: user.email },
  ].filter((item) => Object.values(item)[0]);

  const company = companyOr.length
    ? await Company.findOne({ $or: companyOr })
    : null;

  if (company?.companyId) values.push(company.companyId);

  return [...new Set(values.map(normalize).filter(Boolean))];
};

const validateResume = (file) => {
  if (!file) {
    return 'Please upload your latest resume.';
  }

  if (!file.buffer || !file.buffer.length) {
    return 'The uploaded resume is empty or could not be read.';
  }

  if (file.size > MAX_RESUME_SIZE) {
    return 'Resume must be 5 MB or smaller.';
  }

  const extension = path.extname(file.originalname || '').toLowerCase();
  const validExtension = ALLOWED_EXTENSIONS.has(extension);
  const validMime = ALLOWED_MIME_TYPES.has(file.mimetype);

  if (!validExtension && !validMime) {
    return 'Resume must be PDF, DOC, or DOCX.';
  }

  return '';
};

const createApplication = async (req, res) => {
  try {
    const role = getUserRole(req);

    if (role !== 'student') {
      return res.status(403).json({
        success: false,
        message: 'Only students can submit job applications.',
      });
    }

    const studentId = req.user?.userId;
    const driveId = String(req.body?.driveId || '').trim();

    if (!studentId || !driveId) {
      return res.status(400).json({
        success: false,
        message: 'Student and placement drive are required.',
      });
    }

    const drive = await PlacementDrive.findOne({ driveId });
    if (!drive) {
      return res.status(404).json({
        success: false,
        message: 'Placement drive not found.',
      });
    }

    if (drive.lastDateToApply) {
      const deadline = new Date(`${drive.lastDateToApply}T23:59:59`);
      if (!Number.isNaN(deadline.getTime()) && deadline < new Date()) {
        return res.status(400).json({
          success: false,
          message: 'The application deadline has passed.',
        });
      }
    }

    const existing = await Application.findOne({ studentId, driveId });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'You have already applied for this placement drive.',
      });
    }

    if (String(req.body?.consent) !== 'true') {
      return res.status(400).json({
        success: false,
        message: 'Applicant consent is required.',
      });
    }

    const resumeError = validateResume(req.file);
    if (resumeError) {
      return res.status(400).json({
        success: false,
        message: resumeError,
      });
    }

    const application = await Application.create({
      applicationId: makeApplicationId(),
      studentId,
      driveId,
      applicationDate: new Date(),
      status: 'Applied',
      selected: false,

      phone: req.body.phone,
      alternatePhone: req.body.alternatePhone,
      dateOfBirth: req.body.dateOfBirth,
      gender: req.body.gender,
      address: req.body.address,
      city: req.body.city,
      state: req.body.state,
      pincode: req.body.pincode,
      preferredLocation: req.body.preferredLocation,

      // These fields are retained for compatibility with existing records/forms.
      college: req.body.college,
      degree: req.body.degree,
      branch: req.body.branch,
      graduationYear: req.body.graduationYear,
      cgpa: req.body.cgpa,
      tenthPercentage: req.body.tenthPercentage,
      twelfthPercentage: req.body.twelfthPercentage,
      backlogs: req.body.backlogs || '0',
      skills: req.body.skills,
      certifications: req.body.certifications,
      projects: req.body.projects,
      internshipExperience: req.body.internshipExperience,
      workExperience: req.body.workExperience,
      linkedinUrl: req.body.linkedinUrl,
      githubUrl: req.body.githubUrl,
      portfolioUrl: req.body.portfolioUrl,
      coverLetter: req.body.coverLetter,
      noticePeriod: req.body.noticePeriod,
      workAuthorization: req.body.workAuthorization,
      relocation: req.body.relocation,
      expectedSalary: req.body.expectedSalary,

      consent: true,

      resume: {
        fileName: req.file.originalname,
        mimeType: req.file.mimetype || 'application/octet-stream',
        size: req.file.size,
        data: req.file.buffer,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Application submitted successfully.',
      data: {
        applicationId: application.applicationId,
        status: application.status,
      },
    });
  } catch (error) {
    console.error('Create application error:', error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'You have already applied for this placement drive.',
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to submit application.',
      error: error.message,
    });
  }
};

const getAllApplications = async (req, res) => {
  try {
    const role = getUserRole(req);
    let query = {};

    if (role === 'student') {
      query.studentId = req.user.userId;
    } else if (role === 'company') {
      const companyIds = await getCompanyIdsForUser(req.user);
      const drives = await PlacementDrive.find({
        companyId: { $in: companyIds },
      }).select('driveId -_id');

      query.driveId = { $in: drives.map((drive) => drive.driveId) };
    }

    const applications = await Application.find(query)
      .sort({ applicationDate: -1 })
      .select('-resume.data');

    const driveIds = [...new Set(applications.map((app) => app.driveId))];
    const studentIds = [...new Set(applications.map((app) => app.studentId))];

    const [drives, users] = await Promise.all([
      PlacementDrive.find({ driveId: { $in: driveIds } }),
      User.find({ userId: { $in: studentIds } }).select('userId name email'),
    ]);

    const driveMap = new Map(drives.map((drive) => [drive.driveId, drive]));
    const userMap = new Map(users.map((user) => [user.userId, user]));

    const data = applications.map((application) => ({
      ...application.toObject(),
      resume: application.resume
        ? {
            fileName: application.resume.fileName,
            mimeType: application.resume.mimeType,
            size: application.resume.size,
          }
        : null,
      student: userMap.get(application.studentId) || null,
      drive: driveMap.get(application.driveId) || null,
    }));

    return res.json({ success: true, data });
  } catch (error) {
    console.error('Get applications error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch applications.',
      error: error.message,
    });
  }
};

const updateApplication = async (req, res) => {
  try {
    const application = await Application.findOne({
      applicationId: req.params.id,
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found.',
      });
    }

    const role = getUserRole(req);

    if (role === 'student') {
      return res.status(403).json({
        success: false,
        message: 'Students cannot change application status.',
      });
    }

    if (role === 'company') {
      const drive = await PlacementDrive.findOne({ driveId: application.driveId });
      const companyIds = await getCompanyIdsForUser(req.user);

      if (!drive || !companyIds.includes(normalize(drive.companyId))) {
        return res.status(403).json({
          success: false,
          message: 'You can only update applications for your company drives.',
        });
      }
    }

    const allowedStatus = [
      'Applied',
      'Under Review',
      'Verified',
      'Shortlisted',
      'Interview Scheduled',
      'Rejected',
      'Selected',
    ];

    if (req.body.status && !allowedStatus.includes(req.body.status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid application status.',
      });
    }

    if (req.body.status !== undefined) {
      application.status = req.body.status;
    }

    if (req.body.selected !== undefined) {
      application.selected =
        req.body.selected === true || String(req.body.selected) === 'true';
    }

    await application.save();

    return res.json({
      success: true,
      message: 'Application updated successfully.',
      data: application,
    });
  } catch (error) {
    console.error('Update application error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update application.',
      error: error.message,
    });
  }
};

const deleteApplication = async (req, res) => {
  try {
    const application = await Application.findOne({
      applicationId: req.params.id,
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found.',
      });
    }

    const role = getUserRole(req);

    if (role === 'student' && application.studentId !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own application.',
      });
    }

    if (role === 'company') {
      const drive = await PlacementDrive.findOne({ driveId: application.driveId });
      const companyIds = await getCompanyIdsForUser(req.user);

      if (!drive || !companyIds.includes(normalize(drive.companyId))) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized.',
        });
      }
    }

    await Application.deleteOne({ applicationId: req.params.id });

    return res.json({
      success: true,
      message: 'Application deleted successfully.',
    });
  } catch (error) {
    console.error('Delete application error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete application.',
      error: error.message,
    });
  }
};

const downloadResume = async (req, res) => {
  try {
    const application = await Application.findOne({
      applicationId: req.params.id,
    }).select('+resume.data');

    if (!application?.resume?.data) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found.',
      });
    }

    const role = getUserRole(req);

    if (role === 'student' && application.studentId !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized.',
      });
    }

    if (role === 'company') {
      const drive = await PlacementDrive.findOne({ driveId: application.driveId });
      const companyIds = await getCompanyIdsForUser(req.user);

      if (!drive || !companyIds.includes(normalize(drive.companyId))) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized.',
        });
      }
    }

    const safeFileName = String(
      application.resume.fileName || 'resume'
    ).replace(/[\\"\r\n]/g, '_');

    res.setHeader(
      'Content-Type',
      application.resume.mimeType || 'application/octet-stream'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${encodeURIComponent(safeFileName)}"`
    );

    return res.send(application.resume.data);
  } catch (error) {
    console.error('Resume download error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to download resume.',
    });
  }
};

module.exports = {
  createApplication,
  getAllApplications,
  updateApplication,
  deleteApplication,
  downloadResume,
};
