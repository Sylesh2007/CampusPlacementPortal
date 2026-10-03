const PlacementDrive = require('../models/PlacementDrive');
const Company = require('../models/Company');

// Helper to populate company details for drives
const enrichDrivesWithCompany = async (drives) => {
  // Collect all companyIds
  const companyIds = [...new Set(drives.map((d) => d.companyId))];
  const companies = await Company.find({
    $or: [{ companyId: { $in: companyIds } }],
  });

  const companyMap = {};
  companies.forEach((c) => {
    companyMap[c.companyId] = c;
  });

  return drives.map((d) => {
    const driveObj = d.toObject ? d.toObject() : { ...d };
    driveObj.company = companyMap[d.companyId] || null;
    return driveObj;
  });
};

// @desc    Get all placement drives (with optional search/filtering)
// @route   GET /drives or GET /api/drives
// @access  Public
const getDrives = async (req, res) => {
  try {
    const { search, companyId } = req.query;
    let query = {};

    if (companyId) {
      query.companyId = companyId;
    }

    if (search) {
      // Find matching companies first for name search
      const matchingCompanies = await Company.find({
        companyName: { $regex: search, $options: 'i' },
      }).select('companyId');
      const matchingCompIds = matchingCompanies.map((c) => c.companyId);

      query.$or = [
        { jobRole: { $regex: search, $options: 'i' } },
        { venue: { $regex: search, $options: 'i' } },
        { companyId: { $in: matchingCompIds } },
      ];
    }

    // Demonstrates MongoDB find()
    const drives = await PlacementDrive.find(query).sort({ driveDate: 1 });
    const enrichedDrives = await enrichDrivesWithCompany(drives);

    return res.status(200).json({
      success: true,
      count: enrichedDrives.length,
      data: enrichedDrives,
    });
  } catch (error) {
    console.error('Error fetching placement drives:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve placement drives.',
      error: error.message,
    });
  }
};

// @desc    Get single drive by ID
// @route   GET /drives/:id or GET /api/drives/:id
// @access  Public
const getDriveById = async (req, res) => {
  try {
    const { id } = req.params;
    const isObjectId = id.match(/^[0-9a-fA-F]{24}$/);

    const drive = await PlacementDrive.findOne({
      $or: [{ driveId: id }, ...(isObjectId ? [{ _id: id }] : [])],
    });

    if (!drive) {
      return res.status(404).json({
        success: false,
        message: `Placement drive with ID '${id}' not found.`,
      });
    }

    const company = await Company.findOne({ companyId: drive.companyId });
    const driveObj = drive.toObject();
    driveObj.company = company || null;

    return res.status(200).json({
      success: true,
      data: driveObj,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching placement drive details.',
      error: error.message,
    });
  }
};

// @desc    Add a placement drive
// @route   POST /drives or POST /api/drives
// @access  Company or Admin
const addDrive = async (req, res) => {
  try {
    const {
      driveId,
      companyId,
      jobRole,
      driveDate,
      venue,
      lastDateToApply,
      vacancies,
    } = req.body;

    if (!companyId || !jobRole || !driveDate || !venue || !lastDateToApply || vacancies === undefined) {
      return res.status(400).json({
        success: false,
        message: 'All fields (companyId, jobRole, driveDate, venue, lastDateToApply, vacancies) are required.',
      });
    }

    // Verify company exists
    const company = await Company.findOne({ companyId });
    if (!company) {
      return res.status(400).json({
        success: false,
        message: `Company with ID '${companyId}' does not exist. Please register the company first.`,
      });
    }

    // Generate driveId if not provided
    let finalDriveId = driveId;
    if (!finalDriveId) {
      finalDriveId = `DRV${Date.now().toString().slice(-6)}`;
    } else {
      const exists = await PlacementDrive.findOne({ driveId: finalDriveId });
      if (exists) {
        return res.status(400).json({
          success: false,
          message: `Placement drive with driveId '${finalDriveId}' already exists.`,
        });
      }
    }

    const newDrive = await PlacementDrive.create({
      driveId: finalDriveId,
      companyId,
      jobRole,
      driveDate: new Date(driveDate),
      venue,
      lastDateToApply: new Date(lastDateToApply),
      vacancies: Number(vacancies),
    });

    const responseObj = newDrive.toObject();
    responseObj.company = company;

    return res.status(201).json({
      success: true,
      message: 'Placement drive created successfully.',
      data: responseObj,
    });
  } catch (error) {
    console.error('Error creating placement drive:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create placement drive.',
      error: error.message,
    });
  }
};

// @desc    Update placement drive details
// @route   PUT /drives/:id or PUT /api/drives/:id
// @access  Company or Admin
const updateDrive = async (req, res) => {
  try {
    const { id } = req.params;
    const isObjectId = id.match(/^[0-9a-fA-F]{24}$/);

    const filter = {
      $or: [{ driveId: id }, ...(isObjectId ? [{ _id: id }] : [])],
    };

    const driveToUpdate = await PlacementDrive.findOne(filter);
    if (!driveToUpdate) {
      return res.status(404).json({
        success: false,
        message: `Placement drive with ID '${id}' not found.`,
      });
    }

    const {
      companyId,
      jobRole,
      driveDate,
      venue,
      lastDateToApply,
      vacancies,
    } = req.body;

    const updateFields = {};
    if (companyId !== undefined) updateFields.companyId = companyId;
    if (jobRole !== undefined) updateFields.jobRole = jobRole;
    if (driveDate !== undefined) updateFields.driveDate = new Date(driveDate);
    if (venue !== undefined) updateFields.venue = venue;
    if (lastDateToApply !== undefined) updateFields.lastDateToApply = new Date(lastDateToApply);
    if (vacancies !== undefined) updateFields.vacancies = Number(vacancies);

    // Demonstrates MongoDB updateOne()
    await PlacementDrive.updateOne(filter, { $set: updateFields });

    const updatedDrive = await PlacementDrive.findOne(filter);
    const company = await Company.findOne({ companyId: updatedDrive.companyId });
    const responseObj = updatedDrive.toObject();
    responseObj.company = company;

    return res.status(200).json({
      success: true,
      message: 'Placement drive updated successfully.',
      data: responseObj,
    });
  } catch (error) {
    console.error('Error updating placement drive:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update placement drive.',
      error: error.message,
    });
  }
};

// @desc    Delete a placement drive
// @route   DELETE /drives/:id or DELETE /api/drives/:id
// @access  Company or Admin
const deleteDrive = async (req, res) => {
  try {
    const { id } = req.params;
    const isObjectId = id.match(/^[0-9a-fA-F]{24}$/);

    const filter = {
      $or: [{ driveId: id }, ...(isObjectId ? [{ _id: id }] : [])],
    };

    // Demonstrates MongoDB deleteOne()
    const deleteResult = await PlacementDrive.deleteOne(filter);

    if (deleteResult.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: `Placement drive with ID '${id}' not found.`,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Placement drive deleted successfully.',
    });
  } catch (error) {
    console.error('Error deleting placement drive:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete placement drive.',
      error: error.message,
    });
  }
};

module.exports = {
  getDrives,
  getDriveById,
  addDrive,
  updateDrive,
  deleteDrive,
};
