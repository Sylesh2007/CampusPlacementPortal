import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck,
  Building2,
  Briefcase,
  FileText,
  BarChart3,
  PlusCircle,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Users,
  Award,
  Calendar,
  MapPin,
  TrendingUp,
  Search,
  ExternalLink,
  DollarSign,
  AlertCircle,
  FileCheck,
  Check,
} from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'companies' | 'drives' | 'applications'
  const [loading, setLoading] = useState(true);
  const [reportsData, setReportsData] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [drives, setDrives] = useState([]);
  const [applications, setApplications] = useState([]);
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionError, setActionError] = useState('');

  // Modals
  const [showAddCompany, setShowAddCompany] = useState(false);
  const [companyForm, setCompanyForm] = useState({
    companyName: '',
    location: '',
    website: '',
    HRName: '',
    packageOffered: '',
    eligibilityCriteria: '',
  });

  const fetchData = async () => {
    setLoading(true);
    setActionError('');
    try {
      const [compRes, driveRes, appRes] = await Promise.all([
        api.get('/companies'),
        api.get('/drives'),
        api.get('/applications'),
      ]);

      const companyData = compRes.data.success && Array.isArray(compRes.data.data)
        ? compRes.data.data
        : [];
      const driveData = driveRes.data.success && Array.isArray(driveRes.data.data)
        ? driveRes.data.data
        : [];
      const applicationData = appRes.data.success && Array.isArray(appRes.data.data)
        ? appRes.data.data
        : [];

      setCompanies(companyData);
      setDrives(driveData);
      setApplications(applicationData);

      // Build admin reports from the existing APIs.
      const uniqueStudents = new Set(
        applicationData.map((app) => app.studentId).filter(Boolean)
      ).size;

      const statusMap = applicationData.reduce((acc, app) => {
        const status = app.status || 'Applied';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});

      const statusBreakdown = Object.entries(statusMap).map(([status, count]) => ({
        status,
        count,
      }));

      const driveStats = driveData.map((drive) => {
        const driveApplications = applicationData.filter(
          (app) => app.driveId === drive.driveId
        );

        return {
          driveId: drive.driveId,
          jobRole: drive.jobRole,
          companyId: drive.companyId,
          vacancies: Number(drive.vacancies || 0),
          totalApplications: driveApplications.length,
          selectedCount: driveApplications.filter((app) => app.selected === true).length,
        };
      });

      setReportsData({
        summary: {
          totalUsers: uniqueStudents + companyData.length + 1,
          totalStudents: uniqueStudents,
          totalCompanies: companyData.length,
          totalDrives: driveData.length,
          totalApplications: applicationData.length,
          totalSelected: applicationData.filter((app) => app.selected === true).length,
        },
        statusBreakdown,
        driveStats,
      });

    } catch (err) {
      console.error('Error fetching admin dashboard data:', err);
      setActionError('Failed to load portal data. Check server connectivity.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- Company Actions ---
  const handleAddCompany = async (e) => {
    e.preventDefault();
    setActionError('');
    try {
      const res = await api.post('/companies', companyForm);
      if (res.data.success) {
        setActionSuccess('Company registered successfully.');
        setShowAddCompany(false);
        setCompanyForm({
          companyName: '',
          location: '',
          website: '',
          HRName: '',
          packageOffered: '',
          eligibilityCriteria: '',
        });
        fetchData();
      }
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to add company.');
    }
  };

  const handleDeleteCompany = async (companyId) => {
    if (!window.confirm(`Delete company ${companyId}? This may affect related drives.`)) return;
    try {
      const res = await api.delete(`/companies/${companyId}`);
      if (res.data.success) {
        setActionSuccess(`Company ${companyId} deleted.`);
        fetchData();
      }
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to delete company.');
    }
  };

  // --- Drive Actions ---
  const handleDeleteDrive = async (driveId) => {
    if (!window.confirm(`Delete placement drive ${driveId}?`)) return;
    try {
      const res = await api.delete(`/drives/${driveId}`);
      if (res.data.success) {
        setActionSuccess(`Placement drive ${driveId} deleted.`);
        fetchData();
      }
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to delete placement drive.');
    }
  };

  // --- Application Verification & Result Publishing ---
  const handleUpdateAppStatus = async (appId, status, selected) => {
    try {
      const res = await api.put(`/applications/${appId}`, {
        status,
        selected: selected !== undefined ? selected : status === 'Selected',
      });
      if (res.data.success) {
        setActionSuccess(`Application ${appId} updated: Status = ${status}.`);
        fetchData();
      }
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to update application.');
    }
  };

  const handleDeleteApp = async (appId) => {
    if (!window.confirm(`Delete application ${appId}?`)) return;
    try {
      const res = await api.delete(`/applications/${appId}`);
      if (res.data.success) {
        setActionSuccess(`Application ${appId} removed.`);
        fetchData();
      }
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to delete application.');
    }
  };

  const summary = reportsData?.summary || {
    totalUsers: 0,
    totalStudents: 0,
    totalCompanies: companies.length,
    totalDrives: drives.length,
    totalApplications: applications.length,
    totalSelected: applications.filter((a) => a.selected).length,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Admin Header */}
      <div className="bg-gradient-to-r from-purple-800 via-indigo-800 to-purple-900 rounded-2xl p-6 sm:p-8 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-purple-100 text-xs font-semibold backdrop-blur-xs">
            <ShieldCheck className="w-4 h-4" />
            <span>Placement Officer & Administrator Command Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Campus Placement Cell Console
          </h1>
          <p className="text-xs text-purple-200">
            Director: {user?.name} • ID: {user?.userId} • MongoDB Atlas Aggregation & Monitoring
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => {
              setShowAddCompany(true);
              setActionError('');
              setActionSuccess('');
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-white text-purple-900 hover:bg-purple-50 shadow-sm transition-all"
          >
            <PlusCircle className="w-4 h-4 text-purple-700" />
            Add Company
          </button>
        </div>
      </div>

      {/* Action Banners */}
      {actionSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs flex items-center justify-between">
          <span className="font-semibold">{actionSuccess}</span>
          <button onClick={() => setActionSuccess('')} className="text-emerald-600 font-bold">×</button>
        </div>
      )}

      {actionError && (
        <div className="p-4 rounded-xl bg-red-50 text-red-800 border border-red-200 text-xs flex items-center justify-between">
          <span>{actionError}</span>
          <button onClick={() => setActionError('')} className="text-red-600 font-bold">×</button>
        </div>
      )}

      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Companies</span>
          <h3 className="text-2xl font-black text-slate-900 mt-1">{summary.totalCompanies}</h3>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Drives</span>
          <h3 className="text-2xl font-black text-blue-600 mt-1">{summary.totalDrives}</h3>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Students</span>
          <h3 className="text-2xl font-black text-purple-600 mt-1">{summary.totalStudents}</h3>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Applications</span>
          <h3 className="text-2xl font-black text-amber-600 mt-1">{summary.totalApplications}</h3>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Selected</span>
          <h3 className="text-2xl font-black text-emerald-600 mt-1">{summary.totalSelected}</h3>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Total Users</span>
          <h3 className="text-2xl font-black text-slate-700 mt-1">{summary.totalUsers}</h3>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'overview'
              ? 'bg-purple-700 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          Placement Reports (aggregate())
        </button>

        <button
          onClick={() => setActiveTab('companies')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'companies'
              ? 'bg-purple-700 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Building2 className="w-4 h-4" />
          Manage Companies ({companies.length})
        </button>

        <button
          onClick={() => setActiveTab('drives')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'drives'
              ? 'bg-purple-700 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          Manage Placement Drives ({drives.length})
        </button>

        <button
          onClick={() => setActiveTab('applications')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'applications'
              ? 'bg-purple-700 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-4 h-4" />
          Verify Applications & Publish ({applications.length})
        </button>
      </div>

      {/* Tab 1: Reports & Analytics via MongoDB aggregate() */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Status Breakdown via aggregate() */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-purple-600" />
                  Application Status Breakdown (aggregate())
                </h3>
                <span className="text-[11px] font-mono text-slate-400">Total: {summary.totalApplications}</span>
              </div>

              <div className="space-y-3">
                {reportsData?.statusBreakdown?.map((item) => {
                  const percentage = summary.totalApplications > 0
                    ? Math.round((item.count / summary.totalApplications) * 100)
                    : 0;

                  return (
                    <div key={item.status} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-700">{item.status}</span>
                        <span className="text-slate-500 font-mono">
                          {item.count} ({percentage}%)
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            item.status === 'Selected'
                              ? 'bg-emerald-500'
                              : item.status === 'Shortlisted'
                              ? 'bg-indigo-500'
                              : item.status === 'Verified'
                              ? 'bg-blue-500'
                              : item.status === 'Rejected'
                              ? 'bg-rose-500'
                              : 'bg-amber-400'
                          }`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Selection Stats */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <Award className="w-4 h-4 text-emerald-600" />
                  Selection & Placement Rate
                </h3>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  {summary.totalApplications > 0
                    ? `${Math.round((summary.totalSelected / summary.totalApplications) * 100)}% Placement Rate`
                    : 'N/A'}
                </span>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl space-y-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-600">Total Eligible Candidates Placed:</span>
                  <strong className="text-emerald-700 font-bold">{summary.totalSelected} Students</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Total Registered Companies:</span>
                  <strong className="text-slate-800 font-bold">{summary.totalCompanies} Companies</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Total Recruitment Drives Conducted:</span>
                  <strong className="text-slate-800 font-bold">{summary.totalDrives} Drives</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Drive-Wise Applications & Selections Table via aggregate() */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900">
                  Placement Drive Performance & Selections (MongoDB aggregate)
                </h3>
                <p className="text-xs text-slate-500">Aggregated applications and offers grouped by driveId</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px]">
                    <th className="py-3 px-4 sm:px-6">Drive ID</th>
                    <th className="py-3 px-4 sm:px-6">Job Role</th>
                    <th className="py-3 px-4 sm:px-6">Company ID</th>
                    <th className="py-3 px-4 sm:px-6 text-center">Vacancies</th>
                    <th className="py-3 px-4 sm:px-6 text-center">Total Applicants</th>
                    <th className="py-3 px-4 sm:px-6 text-center">Selected Offers</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {reportsData?.driveStats?.map((ds) => (
                    <tr key={ds.driveId} className="hover:bg-slate-50/60">
                      <td className="py-3.5 px-4 sm:px-6 font-mono font-bold text-slate-700">
                        {ds.driveId}
                      </td>
                      <td className="py-3.5 px-4 sm:px-6 font-bold text-slate-900">
                        {ds.jobRole || 'Campus Drive'}
                      </td>
                      <td className="py-3.5 px-4 sm:px-6 font-mono text-slate-600">
                        {ds.companyId}
                      </td>
                      <td className="py-3.5 px-4 sm:px-6 text-center font-semibold text-slate-700">
                        {ds.vacancies || '-'}
                      </td>
                      <td className="py-3.5 px-4 sm:px-6 text-center font-bold text-blue-600">
                        {ds.totalApplications}
                      </td>
                      <td className="py-3.5 px-4 sm:px-6 text-center font-bold text-emerald-600">
                        {ds.selectedCount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Companies Management */}
      {activeTab === 'companies' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden space-y-4">
          <div className="p-5 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-base text-slate-900">Registered Companies</h2>
              <p className="text-xs text-slate-500">Manage campus recruitment partners, packages, and eligibility criteria</p>
            </div>
            <button
              onClick={() => setShowAddCompany(true)}
              className="px-3.5 py-2 text-xs font-bold text-white bg-purple-700 hover:bg-purple-800 rounded-xl"
            >
              + Add Company
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px]">
                  <th className="py-3 px-4 sm:px-6">Company ID</th>
                  <th className="py-3 px-4 sm:px-6">Company Name</th>
                  <th className="py-3 px-4 sm:px-6">Location</th>
                  <th className="py-3 px-4 sm:px-6">HR Contact</th>
                  <th className="py-3 px-4 sm:px-6">Package</th>
                  <th className="py-3 px-4 sm:px-6">Eligibility Criteria</th>
                  <th className="py-3 px-4 sm:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {companies.map((c) => (
                  <tr key={c.companyId} className="hover:bg-slate-50/60">
                    <td className="py-3.5 px-4 sm:px-6 font-mono font-bold text-slate-700">
                      {c.companyId}
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 font-bold text-slate-900">
                      {c.companyName}
                      <a
                        href={c.website}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-500 hover:underline block text-[11px] font-normal"
                      >
                        {c.website}
                      </a>
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 text-slate-600">{c.location}</td>
                    <td className="py-3.5 px-4 sm:px-6 text-slate-600">{c.HRName}</td>
                    <td className="py-3.5 px-4 sm:px-6 font-bold text-blue-600">{c.packageOffered}</td>
                    <td className="py-3.5 px-4 sm:px-6 text-slate-600 max-w-xs truncate" title={c.eligibilityCriteria}>
                      {c.eligibilityCriteria}
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 text-right">
                      <button
                        onClick={() => handleDeleteCompany(c.companyId)}
                        title="Delete Company"
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Placement Drives Management */}
      {activeTab === 'drives' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden space-y-4">
          <div className="p-5 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-base text-slate-900">Manage Placement Drives</h2>
              <p className="text-xs text-slate-500">Monitor, review, and remove placement drives posted by companies</p>
            </div>
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-2 rounded-xl">
              Company-posted drives
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px]">
                  <th className="py-3 px-4 sm:px-6">Drive ID</th>
                  <th className="py-3 px-4 sm:px-6">Company</th>
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
                  <tr key={d.driveId} className="hover:bg-slate-50/60">
                    <td className="py-3.5 px-4 sm:px-6 font-mono font-bold text-slate-700">
                      {d.driveId}
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 font-semibold text-slate-800">
                      {d.company?.companyName || d.companyId}
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
                        title="Delete Placement Drive"
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Verify Student Applications & Publish Results */}
      {activeTab === 'applications' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden space-y-4">
          <div className="p-5 border-b border-slate-200">
            <h2 className="font-bold text-base text-slate-900">
              Verify Student Applications & Publish Final Results
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Administrators verify submitted applications, validate eligibility, and publish official selection results.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px]">
                  <th className="py-3 px-4 sm:px-6">App ID</th>
                  <th className="py-3 px-4 sm:px-6">Student Info</th>
                  <th className="py-3 px-4 sm:px-6">Placement Drive</th>
                  <th className="py-3 px-4 sm:px-6">Applied Date</th>
                  <th className="py-3 px-4 sm:px-6">Status</th>
                  <th className="py-3 px-4 sm:px-6 text-center">Selected</th>
                  <th className="py-3 px-4 sm:px-6 text-right">Admin Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {applications.map((app) => (
                  <tr key={app.applicationId} className="hover:bg-slate-50/60">
                    <td className="py-3.5 px-4 sm:px-6 font-mono font-bold text-slate-700">
                      {app.applicationId}
                    </td>

                    <td className="py-3.5 px-4 sm:px-6">
                      <div className="font-bold text-slate-900">{app.student?.name || app.studentId}</div>
                      <div className="text-[11px] text-slate-500 font-mono">ID: {app.studentId}</div>
                    </td>

                    <td className="py-3.5 px-4 sm:px-6">
                      <div className="font-medium text-slate-800">{app.drive?.jobRole || app.driveId}</div>
                      <div className="text-[11px] text-slate-500">{app.drive?.company?.companyName}</div>
                    </td>

                    <td className="py-3.5 px-4 sm:px-6 text-slate-600">
                      {new Date(app.applicationDate).toLocaleDateString()}
                    </td>

                    <td className="py-3.5 px-4 sm:px-6">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          app.status === 'Selected'
                            ? 'bg-emerald-100 text-emerald-800'
                            : app.status === 'Verified'
                            ? 'bg-blue-100 text-blue-800'
                            : app.status === 'Shortlisted'
                            ? 'bg-indigo-100 text-indigo-800'
                            : app.status === 'Rejected'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {app.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 sm:px-6 text-center">
                      {app.selected ? (
                        <span className="font-bold text-emerald-600">YES</span>
                      ) : (
                        <span className="text-slate-400">NO</span>
                      )}
                    </td>

                    {/* Admin Action Buttons */}
                    <td className="py-3.5 px-4 sm:px-6 text-right space-x-1.5 whitespace-nowrap">
                      {/* Verify Button */}
                      {app.status === 'Applied' && (
                        <button
                          onClick={() => handleUpdateAppStatus(app.applicationId, 'Verified', false)}
                          className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200"
                        >
                          Verify App
                        </button>
                      )}

                      {/* Publish Result / Offer Button */}
                      <button
                        onClick={() =>
                          handleUpdateAppStatus(
                            app.applicationId,
                            app.selected ? 'Shortlisted' : 'Selected',
                            !app.selected
                          )
                        }
                        className={`px-2.5 py-1 text-xs font-semibold rounded-lg ${
                          app.selected
                            ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                            : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                        }`}
                      >
                        {app.selected ? 'Revoke Offer' : 'Publish Offer'}
                      </button>

                      <button
                        onClick={() => handleDeleteApp(app.applicationId)}
                        title="Delete application"
                        className="p-1 text-slate-400 hover:text-red-600"
                      >
                        <Trash2 className="w-3.5 h-3.5 inline" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Add Company */}
      {showAddCompany && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">Add Company</h3>
              <button onClick={() => setShowAddCompany(false)} className="text-slate-400 text-lg">✕</button>
            </div>

            <form onSubmit={handleAddCompany} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Company Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cisco Systems"
                  value={companyForm.companyName}
                  onChange={(e) => setCompanyForm({ ...companyForm, companyName: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-purple-600 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Location *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bangalore"
                    value={companyForm.location}
                    onChange={(e) => setCompanyForm({ ...companyForm, location: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-purple-600 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Website *</label>
                  <input
                    type="url"
                    required
                    placeholder="https://cisco.com"
                    value={companyForm.website}
                    onChange={(e) => setCompanyForm({ ...companyForm, website: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-purple-600 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">HR Contact *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Maya Iyer"
                    value={companyForm.HRName}
                    onChange={(e) => setCompanyForm({ ...companyForm, HRName: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-purple-600 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Package Offered (CTC) *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 17 LPA"
                    value={companyForm.packageOffered}
                    onChange={(e) => setCompanyForm({ ...companyForm, packageOffered: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-purple-600 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Eligibility Criteria *</label>
                <textarea
                  required
                  rows="2"
                  placeholder="e.g. CGPA >= 7.0, B.Tech CSE/ECE/IT, No active backlogs"
                  value={companyForm.eligibilityCriteria}
                  onChange={(e) => setCompanyForm({ ...companyForm, eligibilityCriteria: e.target.value })}
                  className="w-full p-2.5 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-purple-600 focus:outline-hidden"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddCompany(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-purple-700 hover:bg-purple-800 rounded-xl"
                >
                  Save Company
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
