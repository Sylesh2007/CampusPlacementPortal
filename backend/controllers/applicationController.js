const Application = require('../models/Application');
const PlacementDrive = require('../models/PlacementDrive');
const Company = require('../models/Company');
const User = require('../models/User');

// Helper to enrich applications with Drive, Company, and Student details
const enrichApplications = async (apps) => {
  if (!apps.length) return [];

  const driveIds = [...new Set(apps.map((a) => a.driveId))];
  const studentIds = [...new Set(apps.map((a) => a.studentId))];

  const [drives, users] = await Promise.all([
    PlacementDrive.find({ driveId: { $in: driveIds } }),
    User.find({ userId: { $in: studentIds } }).select('userId name email role'),
  ]);

  const companyIds = [...new Set(drives.map((d) => d.companyId))];
  const companies = await Company.find({ companyId: { $in: companyIds } });

  const companyMap = {};
  companies.forEach((c) => {
    companyMap[c.companyId] = c;
  });

  const driveMap = {};
  drives.forEach((d) => {
    const dObj = d.toObject ? d.toObject() : { ...d };
    dObj.company = companyMap[d.companyId] || null;
    driveMap[d.driveId] = dObj;
  });

  const userMap = {};
  users.forEach((u) => {
    userMap[u.userId] = u;
  });

  return apps.map((a) => {
    const appObj = a.toObject ? a.toObject() : { ...a };
    appObj.drive = driveMap[a.driveId] || null;
    appObj.student = userMap[a.studentId] || null;
    return appObj;
  });
};

// @desc    Apply for a placement drive
// @route   POST /apply or POST /api/apply
// @access  Student (or Public/Authenticated)
const applyForDrive = async (req, res) => {
  try {
    const { applicationId, studentId, driveId } = req.body;

    // Resolve studentId from req.user if logged in or from body
    const finalStudentId = (req.user && req.user.role === 'student' ? req.user.userId : null) || studentId;
    const finalDriveId = driveId;

    if (!finalStudentId || !finalDriveId) {
      return res.status(400).json({
        success: false,
        message: 'Both studentId and driveId are required to apply.',
      });
    }

    // Verify drive exists
    const drive = await PlacementDrive.findOne({ driveId: finalDriveId });
    if (!drive) {
      return res.status(404).json({
        success: false,
        message: `Placement drive with ID '${finalDriveId}' not found.`,
      });
    }

    // Check if application deadline passed
    if (new Date() > new Date(drive.lastDateToApply)) {
      return res.status(400).json({
        success: false,
        message: 'The deadline for applying to this placement drive has passed.',
      });
    }

    // Check for duplicate application
    const existingApp = await Application.findOne({
      studentId: finalStudentId,
      driveId: finalDriveId,
    });
    if (existingApp) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted an application for this placement drive.',
      });
    }

    // Generate applicationId if not provided
    let finalApplicationId = applicationId;
    if (!finalApplicationId) {
      finalApplicationId = `APP${Date.now().toString().slice(-6)}`;
    } else {
      const exists = await Application.findOne({ applicationId: finalApplicationId });
      if (exists) {
        return res.status(400).json({
          success: false,
          message: `Application ID '${finalApplicationId}' already exists.`,
        });
      }
    }

    // Demonstrates MongoDB create / insert
    const newApplication = await Application.create({
      applicationId: finalApplicationId,
      studentId: finalStudentId,
      driveId: finalDriveId,
      applicationDate: new Date(),
      status: 'Applied',
      selected: false,
    });

    const [enriched] = await enrichApplications([newApplication]);

    return res.status(201).json({
      success: true,
      message: 'Application submitted successfully!',
      data: enriched,
    });
  } catch (error) {
    console.error('Error applying for drive:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to submit application.',
      error: error.message,
    });
  }
};

// @desc    Get applications (filtered by student, drive, or company)
// @route   GET /applications or GET /api/applications
// @access  Authenticated
const getApplications = async (req, res) => {
  try {
    const { studentId, driveId, companyId, status, selected } = req.query;
    let query = {};

    // Role-based scoping
    if (req.user && req.user.role === 'student') {
      query.studentId = req.user.userId;
    } else if (studentId) {
      query.studentId = studentId;
    }

    if (driveId) {
      query.driveId = driveId;
    }

    if (status) {
      query.status = status;
    }

    if (selected !== undefined) {
      query.selected = selected === 'true' || selected === true;
    }

    // If company role or companyId filter requested:
    if (companyId) {
      const companyDrives = await PlacementDrive.find({ companyId }).select('driveId');
      const companyDriveIds = companyDrives.map((d) => d.driveId);
      query.driveId = { $in: companyDriveIds };
    }

    // Demonstrates MongoDB find()
    const applications = await Application.find(query).sort({ applicationDate: -1 });
    const enrichedApplications = await enrichApplications(applications);

    return res.status(200).json({
      success: true,
      count: enrichedApplications.length,
      data: enrichedApplications,
    });
  } catch (error) {
    console.error('Error fetching applications:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve applications.',
      error: error.message,
    });
  }
};

// @desc    Update application status / selection
// @route   PUT /applications/:id or PUT /api/applications/:id
// @access  Admin or Company
const updateApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const isObjectId = id.match(/^[0-9a-fA-F]{24}$/);

    const filter = {
      $or: [{ applicationId: id }, ...(isObjectId ? [{ _id: id }] : [])],
    };

    const applicationToUpdate = await Application.findOne(filter);
    if (!applicationToUpdate) {
      return res.status(404).json({
        success: false,
        message: `Application with ID '${id}' not found.`,
      });
    }

    const { status, selected } = req.body;
    const updateFields = {};

    if (status !== undefined) {
      updateFields.status = status;
    }

    if (selected !== undefined) {
      updateFields.selected = Boolean(selected);
      // Synchronize status if selected is explicitly marked
      if (selected === true && (!status || status === 'Applied' || status === 'Under Review')) {
        updateFields.status = 'Selected';
      }
    }

    // Demonstrates MongoDB updateOne()
    await Application.updateOne(filter, { $set: updateFields });

    const updatedApp = await Application.findOne(filter);
    const [enriched] = await enrichApplications([updatedApp]);

    return res.status(200).json({
      success: true,
      message: 'Application updated successfully.',
      data: enriched,
    });
  } catch (error) {
    console.error('Error updating application:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update application.',
      error: error.message,
    });
  }
};

// @desc    Delete an application
// @route   DELETE /applications/:id or DELETE /api/applications/:id
// @access  Admin
const deleteApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const isObjectId = id.match(/^[0-9a-fA-F]{24}$/);

    const filter = {
      $or: [{ applicationId: id }, ...(isObjectId ? [{ _id: id }] : [])],
    };

    // Demonstrates MongoDB deleteOne()
    const deleteResult = await Application.deleteOne(filter);

    if (deleteResult.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: `Application with ID '${id}' not found.`,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Application deleted successfully.',
    });
  } catch (error) {
    console.error('Error deleting application:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete application.',
      error: error.message,
    });
  }
};

// @desc    Get placement reports and statistics using MongoDB aggregate()
// @route   GET /reports/placement-stats or GET /api/reports/placement-stats
// @access  Admin
const getPlacementReports = async (req, res) => {
  try {
    // Total counts
    const [totalUsers, totalStudents, totalCompanies, totalDrives, totalApplications] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'student' }),
      Company.countDocuments(),
      PlacementDrive.countDocuments(),
      Application.countDocuments(),
    ]);

    // Demonstrates MongoDB aggregate() for Status Breakdown
    const statusBreakdown = await Application.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          status: '$_id',
          count: 1,
          _id: 0,
        },
      },
    ]);

    // Demonstrates MongoDB aggregate() for Selection Statistics
    const selectionStats = await Application.aggregate([
      {
        $group: {
          _id: '$selected',
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          selected: '$_id',
          count: 1,
          _id: 0,
        },
      },
    ]);

    // Demonstrates MongoDB aggregate() for Drive-wise Applications & Selections
    const driveStats = await Application.aggregate([
      {
        $group: {
          _id: '$driveId',
          totalApplications: { $sum: 1 },
          selectedCount: {
            $sum: { $cond: [{ $eq: ['$selected', true] }, 1, 0] },
          },
        },
      },
      {
        $lookup: {
          from: 'placementdrives',
          localField: '_id',
          foreignField: 'driveId',
          as: 'driveDetails',
        },
      },
      {
        $unwind: {
          path: '$driveDetails',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          driveId: '$_id',
          totalApplications: 1,
          selectedCount: 1,
          jobRole: '$driveDetails.jobRole',
          companyId: '$driveDetails.companyId',
          vacancies: '$driveDetails.vacancies',
          _id: 0,
        },
      },
      { $sort: { totalApplications: -1 } },
    ]);

    return res.status(200).json({
      success: true,
      data: {
        summary: {
          totalUsers,
          totalStudents,
          totalCompanies,
          totalDrives,
          totalApplications,
          totalSelected: selectionStats.find((s) => s.selected === true)?.count || 0,
        },
        statusBreakdown,
        selectionStats,
        driveStats,
      },
    });
  } catch (error) {
    console.error('Error generating placement reports via aggregate():', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate placement reports.',
      error: error.message,
    });
  }
};

module.exports = {
  applyForDrive,
  getApplications,
  updateApplication,
  deleteApplication,
  getPlacementReports,
};
