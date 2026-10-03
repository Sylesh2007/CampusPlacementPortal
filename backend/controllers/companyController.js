const Company = require('../models/Company');

// @desc    Get all companies
// @route   GET /companies or GET /api/companies
// @access  Public (or Authenticated)
const getCompanies = async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};

    if (search) {
      query = {
        $or: [
          { companyName: { $regex: search, $options: 'i' } },
          { location: { $regex: search, $options: 'i' } },
          { eligibilityCriteria: { $regex: search, $options: 'i' } },
        ],
      };
    }

    // Demonstrates MongoDB find()
    const companies = await Company.find(query).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: companies.length,
      data: companies,
    });
  } catch (error) {
    console.error('Error fetching companies:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve companies.',
      error: error.message,
    });
  }
};

// @desc    Get single company by ID
// @route   GET /companies/:id or GET /api/companies/:id
// @access  Public
const getCompanyById = async (req, res) => {
  try {
    const { id } = req.params;
    const isObjectId = id.match(/^[0-9a-fA-F]{24}$/);

    const company = await Company.findOne({
      $or: [{ companyId: id }, ...(isObjectId ? [{ _id: id }] : [])],
    });

    if (!company) {
      return res.status(404).json({
        success: false,
        message: `Company with ID '${id}' not found.`,
      });
    }

    return res.status(200).json({
      success: true,
      data: company,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching company details.',
      error: error.message,
    });
  }
};

// @desc    Add a new company
// @route   POST /companies or POST /api/companies
// @access  Admin (or Company)
const addCompany = async (req, res) => {
  try {
    const {
      companyId,
      companyName,
      location,
      website,
      HRName,
      packageOffered,
      eligibilityCriteria,
    } = req.body;

    if (!companyName || !location || !website || !HRName || !packageOffered || !eligibilityCriteria) {
      return res.status(400).json({
        success: false,
        message: 'All company fields (companyName, location, website, HRName, packageOffered, eligibilityCriteria) are required.',
      });
    }

    // Generate companyId if not provided
    let finalCompanyId = companyId;
    if (!finalCompanyId) {
      finalCompanyId = `CMP${Date.now().toString().slice(-6)}`;
    } else {
      const exists = await Company.findOne({ companyId: finalCompanyId });
      if (exists) {
        return res.status(400).json({
          success: false,
          message: `Company with companyId '${finalCompanyId}' already exists.`,
        });
      }
    }

    const newCompany = await Company.create({
      companyId: finalCompanyId,
      companyName,
      location,
      website,
      HRName,
      packageOffered,
      eligibilityCriteria,
    });

    return res.status(201).json({
      success: true,
      message: 'Company added successfully.',
      data: newCompany,
    });
  } catch (error) {
    console.error('Error adding company:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to add company.',
      error: error.message,
    });
  }
};

// @desc    Update company details
// @route   PUT /companies/:id or PUT /api/companies/:id
// @access  Admin (or Company)
const updateCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const isObjectId = id.match(/^[0-9a-fA-F]{24}$/);

    const filter = {
      $or: [{ companyId: id }, ...(isObjectId ? [{ _id: id }] : [])],
    };

    const companyToUpdate = await Company.findOne(filter);
    if (!companyToUpdate) {
      return res.status(404).json({
        success: false,
        message: `Company with ID '${id}' not found.`,
      });
    }

    const {
      companyName,
      location,
      website,
      HRName,
      packageOffered,
      eligibilityCriteria,
    } = req.body;

    const updateFields = {};
    if (companyName !== undefined) updateFields.companyName = companyName;
    if (location !== undefined) updateFields.location = location;
    if (website !== undefined) updateFields.website = website;
    if (HRName !== undefined) updateFields.HRName = HRName;
    if (packageOffered !== undefined) updateFields.packageOffered = packageOffered;
    if (eligibilityCriteria !== undefined) updateFields.eligibilityCriteria = eligibilityCriteria;

    // Demonstrates MongoDB updateOne()
    await Company.updateOne(filter, { $set: updateFields });

    const updatedCompany = await Company.findOne(filter);

    return res.status(200).json({
      success: true,
      message: 'Company updated successfully.',
      data: updatedCompany,
    });
  } catch (error) {
    console.error('Error updating company:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update company.',
      error: error.message,
    });
  }
};

// @desc    Delete a company
// @route   DELETE /companies/:id or DELETE /api/companies/:id
// @access  Admin
const deleteCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const isObjectId = id.match(/^[0-9a-fA-F]{24}$/);

    const filter = {
      $or: [{ companyId: id }, ...(isObjectId ? [{ _id: id }] : [])],
    };

    // Demonstrates MongoDB deleteOne()
    const deleteResult = await Company.deleteOne(filter);

    if (deleteResult.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: `Company with ID '${id}' not found.`,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Company deleted successfully.',
    });
  } catch (error) {
    console.error('Error deleting company:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete company.',
      error: error.message,
    });
  }
};

module.exports = {
  getCompanies,
  getCompanyById,
  addCompany,
  updateCompany,
  deleteCompany,
};
