import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  FileText,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Award,
  Sparkles,
  ArrowRight,
  Briefcase,
  AlertCircle,
  Tag,
  MapPin,
  Trash2,
} from 'lucide-react';

const MyApplications = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteMsg, setDeleteMsg] = useState('');

  const fetchApplications = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/applications');
      if (response.data.success) {
        setApplications(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching applications:', err);
      setError('Failed to load your applications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Selected':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
            <Award className="w-3.5 h-3.5" /> Selected
          </span>
        );
      case 'Shortlisted':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
            <Sparkles className="w-3.5 h-3.5" /> Shortlisted
          </span>
        );
      case 'Verified':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
            <CheckCircle2 className="w-3.5 h-3.5" /> Verified by Admin
          </span>
        );
      case 'Under Review':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <Clock className="w-3.5 h-3.5" /> Under Review
          </span>
        );
      case 'Rejected':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
            Not Selected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
            <Clock className="w-3.5 h-3.5" /> Applied
          </span>
        );
    }
  };

  const selectedCount = applications.filter((a) => a.selected === true).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2 text-blue-600 text-xs font-bold uppercase tracking-wider mb-1">
            <FileText className="w-4 h-4" />
            <span>Candidate Application Tracker</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            My Applications
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            View submitted placement drive applications, verification progress, and selection results.
          </p>
        </div>

        <Link
          to="/drives"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-xs transition-colors self-start sm:self-auto"
        >
          <Briefcase className="w-4 h-4" />
          <span>Apply to More Drives</span>
        </Link>
      </div>

      {/* Celebratory Banner if Selected */}
      {selectedCount > 0 && (
        <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-lg flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <Award className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight">
                Congratulations! You are Selected in {selectedCount} Placement Drive{selectedCount > 1 ? 's' : ''}!
              </h3>
              <p className="text-xs text-emerald-100 mt-0.5">
                Please check the drive venue and details below for further onboarding instructions.
              </p>
            </div>
          </div>
          <span className="hidden md:inline-flex px-3 py-1 rounded-full text-xs font-black bg-white text-emerald-800">
            OFFER CONFIRMED
          </span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-50 text-red-700 border border-red-200 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 bg-slate-200/60 rounded-xl animate-pulse"></div>
          ))}
        </div>
      ) : applications.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4">
          <FileText className="w-12 h-12 text-slate-300 mx-auto" />
          <div>
            <h3 className="text-base font-bold text-slate-800">No Applications Submitted</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              You haven't applied for any campus placement drives yet. Browse open drives to begin.
            </p>
          </div>
          <Link
            to="/drives"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-xs"
          >
            <span>Explore Placement Drives</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        /* Applications Table & Cards */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  <th className="py-3.5 px-4 sm:px-6">Application ID</th>
                  <th className="py-3.5 px-4 sm:px-6">Job Role & Company</th>
                  <th className="py-3.5 px-4 sm:px-6">Applied Date</th>
                  <th className="py-3.5 px-4 sm:px-6">Drive Date & Venue</th>
                  <th className="py-3.5 px-4 sm:px-6">Application Status</th>
                  <th className="py-3.5 px-4 sm:px-6 text-center">Selection Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs">
                {applications.map((app) => (
                  <tr key={app.applicationId} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-4 sm:px-6 font-mono font-bold text-slate-700">
                      {app.applicationId}
                    </td>

                    <td className="py-4 px-4 sm:px-6">
                      <div className="font-bold text-slate-900">
                        {app.drive?.jobRole || 'Campus Position'}
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-500 mt-0.5">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        <span>{app.drive?.company?.companyName || app.drive?.companyId}</span>
                        {app.drive?.company?.packageOffered && (
                          <span className="text-blue-600 font-semibold ml-1">
                            • {app.drive.company.packageOffered}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-4 px-4 sm:px-6 text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{new Date(app.applicationDate).toLocaleDateString()}</span>
                      </div>
                    </td>

                    <td className="py-4 px-4 sm:px-6 text-slate-600">
                      <div className="font-medium text-slate-800">
                        {app.drive?.driveDate
                          ? new Date(app.drive.driveDate).toLocaleDateString()
                          : 'TBA'}
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5 truncate max-w-[180px]">
                        <MapPin className="w-3 h-3 shrink-0" />
                        <span className="truncate">{app.drive?.venue || 'Campus Auditorium'}</span>
                      </div>
                    </td>

                    <td className="py-4 px-4 sm:px-6">
                      {getStatusBadge(app.status)}
                    </td>

                    <td className="py-4 px-4 sm:px-6 text-center">
                      {app.selected ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-emerald-600 text-white">
                          <CheckCircle2 className="w-3.5 h-3.5" /> SELECTED
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs font-medium">
                          In Progress
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyApplications;
