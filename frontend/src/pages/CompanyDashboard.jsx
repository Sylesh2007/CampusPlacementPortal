import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Building2,
  Briefcase,
  Users,
  Award,
  PlusCircle,
  Calendar,
  MapPin,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Edit2,
  Trash2,
  Filter,
  Check,
  Globe,
  FileCheck,
} from 'lucide-react';

const CompanyDashboard = () => {
  const { user } = useAuth();

  const [companyProfile, setCompanyProfile] = useState(null);
  const [drives, setDrives] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('drives'); // 'drives' | 'applicants'

  // Modal / Form state for Add Drive
  const [showAddModal, setShowAddModal] = useState(false);
  const [driveForm, setDriveForm] = useState({
    jobRole: '',
    driveDate: '',
    venue: '',
    lastDateToApply: '',
    vacancies: 10,
  });
  const [submittingDrive, setSubmittingDrive] = useState(false);
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  // Selected drive filter for applicant view
  const [filterDriveId, setFilterDriveId] = useState('all');

  const fetchData = async () => {
    setLoading(true);
    setActionError('');
    try {
      // 1. Fetch company details
      const compRes = await api.get('/companies');
      if (compRes.data.success) {
        // Find company corresponding to this user's userId or name
        const match = compRes.data.data.find(
          (c) => c.companyId === user?.userId || c.HRName === user?.name
        );
        setCompanyProfile(match || (compRes.data.data.length > 0 ? compRes.data.data[0] : null));
      }

      // 2. Fetch drives
      const driveRes = await api.get('/drives');
      if (driveRes.data.success) {
        // If company has matched companyId, filter drives for this company, otherwise show all relevant
        const companyId = user?.userId;
        const myDrives = driveRes.data.data.filter(
          (d) => d.companyId === companyId || d.company?.companyId === companyId
        );
        setDrives(myDrives.length > 0 ? myDrives : driveRes.data.data);
      }

      // 3. Fetch applications
      const appRes = await api.get('/applications');
      if (appRes.data.success) {
        setApplications(appRes.data.data);
      }
    } catch (err) {
      console.error('Error fetching company dashboard data:', err);
      setActionError('Failed to load dashboard data. Please refresh.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  // Handle Create Placement Drive
  const handleCreateDrive = async (e) => {
    e.preventDefault();
    setActionError('');
    setActionSuccess('');

    if (!driveForm.jobRole || !driveForm.driveDate || !driveForm.venue || !driveForm.lastDateToApply) {
      setActionError('Please fill in all placement drive fields.');
      return;
    }

    setSubmittingDrive(true);
    try {
      const payload = {
        ...driveForm,
        companyId: companyProfile?.companyId || user?.userId || 'CMP001',
        vacancies: Number(driveForm.vacancies),
      };

      const response = await api.post('/drives', payload);
      if (response.data.success) {
        setActionSuccess('Placement drive posted successfully!');
        setShowAddModal(false);
        setDriveForm({
          jobRole: '',
          driveDate: '',
          venue: '',
          lastDateToApply: '',
          vacancies: 10,
        });
        fetchData();
      }
    } catch (err) {
      console.error('Error creating drive:', err);
      setActionError(err.response?.data?.message || 'Failed to post drive.');
    } finally {
      setSubmittingDrive(false);
    }
  };

  // Handle Delete Placement Drive
  const handleDeleteDrive = async (driveId) => {
    if (!window.confirm(`Are you sure you want to delete placement drive ${driveId}?`)) return;

    try {
      const response = await api.delete(`/drives/${driveId}`);
      if (response.data.success) {
        setActionSuccess(`Placement drive ${driveId} deleted successfully.`);
        fetchData();
      }
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to delete placement drive.');
    }
  };

  // Handle Update Candidate Selection Status
  const handleUpdateApplicantStatus = async (applicationId, status, selected) => {
    try {
      const response = await api.put(`/applications/${applicationId}`, {
        status,
        selected: selected !== undefined ? selected : status === 'Selected',
      });
      if (response.data.success) {
        setActionSuccess(`Application ${applicationId} status updated to ${status}.`);
        fetchData();
      }
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to update candidate status.');
    }
  };

  // Filtered applications based on company's drives
  const companyDriveIds = new Set(drives.map((d) => d.driveId));
  const relevantApplications = applications.filter(
    (app) => companyDriveIds.has(app.driveId)
  );

  const displayedApplicants = filterDriveId === 'all'
    ? relevantApplications
    : relevantApplications.filter((a) => a.driveId === filterDriveId);

  const totalDrivesCount = drives.length;
  const totalApplicantsCount = relevantApplications.length;
  const totalSelectedCount = relevantApplications.filter((a) => a.selected === true).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 rounded-2xl p-6 sm:p-8 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-emerald-100 text-xs font-semibold backdrop-blur-xs">
            <Building2 className="w-4 h-4" />
            <span>Company Recruitment Console</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            {companyProfile?.companyName || user?.name}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-xs text-emerald-100">
            <span>Company ID: <strong className="text-white font-mono">{companyProfile?.companyId || user?.userId}</strong></span>
            <span>HR Contact: <strong className="text-white">{companyProfile?.HRName || user?.name}</strong></span>
            <span>Location: <strong className="text-white">{companyProfile?.location || 'Headquarters'}</strong></span>
          </div>
        </div>

        <button
          onClick={() => {
            setShowAddModal(true);
            setActionError('');
            setActionSuccess('');
          }}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold text-emerald-950 bg-white hover:bg-emerald-50 shadow-md transition-all self-start md:self-auto shrink-0"
        >
          <PlusCircle className="w-4 h-4 text-emerald-600" />
          <span>Add Placement Drive</span>
        </button>
      </div>

      {/* Action Messages */}
      {actionSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs flex items-center justify-between">
          <span className="font-semibold">{actionSuccess}</span>
          <button onClick={() => setActionSuccess('')} className="text-emerald-600 hover:text-emerald-900 font-bold">
            ×
          </button>
        </div>
      )}

      {actionError && (
        <div className="p-4 rounded-xl bg-red-50 text-red-800 border border-red-200 text-xs flex items-center justify-between">
          <span>{actionError}</span>
          <button onClick={() => setActionError('')} className="text-red-600 hover:text-red-900 font-bold">
            ×
          </button>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Posted Placement Drives
            </p>
            <h3 className="text-3xl font-black text-slate-900 mt-1">{totalDrivesCount}</h3>
            <p className="text-xs text-slate-500 mt-1">Active drives managed</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <Briefcase className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Eligible Student Applicants
            </p>
            <h3 className="text-3xl font-black text-slate-900 mt-1">{totalApplicantsCount}</h3>
            <p className="text-xs text-slate-500 mt-1">Candidates applied for your drives</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Selected Candidates
            </p>
            <h3 className="text-3xl font-black text-emerald-600 mt-1">{totalSelectedCount}</h3>
            <p className="text-xs text-slate-500 mt-1">Offers rolled out</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-600 flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('drives')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'drives'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          My Placement Drives ({drives.length})
        </button>

        <button
          onClick={() => setActiveTab('applicants')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'applicants'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          Eligible Students & Applications ({relevantApplications.length})
        </button>
      </div>

      {/* Tab 1: Drives Management */}
      {activeTab === 'drives' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-200 flex items-center justify-between">
            <h2 className="font-bold text-slate-900 text-base">
              Placement Drives Hosted by {companyProfile?.companyName || user?.name}
            </h2>
            <button
              onClick={() => setShowAddModal(true)}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-900"
            >
              + Post New Drive
            </button>
          </div>

          {loading ? (
            <div className="p-8 text-center text-xs text-slate-400">Loading drives...</div>
          ) : drives.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-xs">
              No placement drives posted yet. Click "Add Placement Drive" above to create one.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4 sm:px-6">Drive ID</th>
                    <th className="py-3 px-4 sm:px-6">Job Role</th>
                    <th className="py-3 px-4 sm:px-6">Drive Date</th>
                    <th className="py-3 px-4 sm:px-6">Venue</th>
                    <th className="py-3 px-4 sm:px-6">Last Date to Apply</th>
                    <th className="py-3 px-4 sm:px-6 text-center">Vacancies</th>
                    <th className="py-3 px-4 sm:px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {drives.map((d) => (
                    <tr key={d.driveId} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 sm:px-6 font-mono font-bold text-slate-700">
                        {d.driveId}
                      </td>
                      <td className="py-3.5 px-4 sm:px-6 font-bold text-slate-900">
                        {d.jobRole}
                      </td>
                      <td className="py-3.5 px-4 sm:px-6 text-slate-600">
                        {new Date(d.driveDate).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4 sm:px-6 text-slate-600">
                        {d.venue}
                      </td>
                      <td className="py-3.5 px-4 sm:px-6 text-slate-600">
                        {new Date(d.lastDateToApply).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4 sm:px-6 text-center font-bold text-slate-800">
                        {d.vacancies}
                      </td>
                      <td className="py-3.5 px-4 sm:px-6 text-right">
                        <button
                          onClick={() => handleDeleteDrive(d.driveId)}
                          title="Delete Drive"
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Eligible Students / Application Review & Selection Results */}
      {activeTab === 'applicants' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden space-y-4">
          <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-bold text-slate-900 text-base">
                Applicant Review & Selection Status Updates
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Review eligible student applicants against your company criteria and update final selection results.
              </p>
            </div>

            {/* Filter by Drive */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-600">Filter by Drive:</span>
              <select
                value={filterDriveId}
                onChange={(e) => setFilterDriveId(e.target.value)}
                className="text-xs px-3 py-1.5 rounded-lg border border-slate-300 font-medium"
              >
                <option value="all">All Drives ({relevantApplications.length})</option>
                {drives.map((d) => (
                  <option key={d.driveId} value={d.driveId}>
                    {d.jobRole} ({d.driveId})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Company Eligibility Criteria Reminder Bar */}
          {companyProfile?.eligibilityCriteria && (
            <div className="mx-5 p-3 rounded-xl bg-emerald-50/80 border border-emerald-200 text-xs flex items-start gap-2.5">
              <FileCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <strong className="text-emerald-900">Your Active Eligibility Criteria:</strong>{' '}
                <span className="text-emerald-800">{companyProfile.eligibilityCriteria}</span>
              </div>
            </div>
          )}

          {displayedApplicants.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-xs">
              No student applications submitted for the selected criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4 sm:px-6">App ID</th>
                    <th className="py-3 px-4 sm:px-6">Candidate Details</th>
                    <th className="py-3 px-4 sm:px-6">Applied Role</th>
                    <th className="py-3 px-4 sm:px-6">Applied Date</th>
                    <th className="py-3 px-4 sm:px-6">Current Status</th>
                    <th className="py-3 px-4 sm:px-6 text-center">Selection Result</th>
                    <th className="py-3 px-4 sm:px-6 text-right">Update Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {displayedApplicants.map((app) => (
                    <tr key={app.applicationId} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 sm:px-6 font-mono font-bold text-slate-700">
                        {app.applicationId}
                      </td>

                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="font-bold text-slate-900">
                          {app.student?.name || app.studentId}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          ID: {app.studentId} {app.student?.email ? `• ${app.student.email}` : ''}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 sm:px-6 font-medium text-slate-800">
                        {app.drive?.jobRole || app.driveId}
                      </td>

                      <td className="py-3.5 px-4 sm:px-6 text-slate-600">
                        {new Date(app.applicationDate).toLocaleDateString()}
                      </td>

                      <td className="py-3.5 px-4 sm:px-6">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            app.status === 'Selected'
                              ? 'bg-emerald-100 text-emerald-800'
                              : app.status === 'Shortlisted'
                              ? 'bg-indigo-100 text-indigo-800'
                              : app.status === 'Rejected'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {app.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 sm:px-6 text-center">
                        {app.selected ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                            <Check className="w-3.5 h-3.5" /> Selected
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs">Pending</span>
                        )}
                      </td>

                      {/* Instant Status / Selection Update Selector */}
                      <td className="py-3.5 px-4 sm:px-6 text-right">
                        <select
                          value={app.status}
                          onChange={(e) =>
                            handleUpdateApplicantStatus(
                              app.applicationId,
                              e.target.value,
                              e.target.value === 'Selected'
                            )
                          }
                          className="text-xs px-2.5 py-1 rounded-lg border border-slate-300 font-semibold focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                        >
                          <option value="Applied">Applied</option>
                          <option value="Under Review">Under Review</option>
                          <option value="Shortlisted">Shortlisted</option>
                          <option value="Selected">Select (Offer)</option>
                          <option value="Rejected">Reject</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Modal: Add Placement Drive */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">
                Post New Placement Drive
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateDrive} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Job Role / Designation *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Associate Software Engineer, Cloud Analyst"
                  value={driveForm.jobRole}
                  onChange={(e) => setDriveForm({ ...driveForm, jobRole: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Drive Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={driveForm.driveDate}
                    onChange={(e) => setDriveForm({ ...driveForm, driveDate: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Last Date to Apply *
                  </label>
                  <input
                    type="date"
                    required
                    value={driveForm.lastDateToApply}
                    onChange={(e) => setDriveForm({ ...driveForm, lastDateToApply: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Venue *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Auditorium Hall A or Online Assessment"
                    value={driveForm.venue}
                    onChange={(e) => setDriveForm({ ...driveForm, venue: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Vacancies *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={driveForm.vacancies}
                    onChange={(e) => setDriveForm({ ...driveForm, vacancies: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingDrive}
                  className="px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs"
                >
                  {submittingDrive ? 'Posting...' : 'Publish Placement Drive'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyDashboard;
