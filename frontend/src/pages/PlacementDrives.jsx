import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Briefcase,
  Search,
  Building2,
  Calendar,
  MapPin,
  Users,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  Filter,
  DollarSign,
  FileCheck,
  Clock,
} from 'lucide-react';

const PlacementDrives = () => {
  const { user, isAuthenticated, role } = useAuth();
  const navigate = useNavigate();

  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [myAppliedDriveIds, setMyAppliedDriveIds] = useState(new Set());
  const [error, setError] = useState('');

  // Fetch drives and student's applications (if student)
  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      // 1. Fetch drives
      const url = searchTerm ? `/drives?search=${encodeURIComponent(searchTerm)}` : '/drives';
      const driveRes = await api.get(url);
      if (driveRes.data.success) {
        setDrives(driveRes.data.data);
      }

      // 2. If student, fetch applications to show "Already Applied" state
      if (isAuthenticated && role === 'student') {
        const appRes = await api.get('/applications');
        if (appRes.data.success) {
          const ids = new Set(appRes.data.data.map((a) => a.driveId));
          setMyAppliedDriveIds(ids);
        }
      }
    } catch (err) {
      console.error('Error fetching drives:', err);
      setError('Failed to load placement drives. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [searchTerm]);

  const isDriveOpen = (lastDate) => {
    return new Date() <= new Date(lastDate);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2 text-blue-600 text-xs font-bold uppercase tracking-wider mb-1">
            <Briefcase className="w-4 h-4" />
            <span>Campus Recruitment Opportunities</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Placement Drives Directory
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Explore ongoing and upcoming campus placement drives across tech, consulting, and core domains.
          </p>
        </div>

        {/* Company Quick Action */}
        {isAuthenticated && (role === 'company' || role === 'admin') && (
          <Link
            to={role === 'company' ? '/company-dashboard' : '/admin-dashboard'}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors self-start md:self-auto"
          >
            Manage / Add Drives →
          </Link>
        )}
      </div>

      {/* Placement Drive Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3.5 top-3.5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search drives by job role, company name, or venue (e.g. SDE, Google, Virtual)..."
            className="w-full pl-11 pr-4 py-3 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* Drives Grid / List */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 text-red-700 border border-red-200 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((idx) => (
            <div key={idx} className="h-64 bg-slate-200/60 rounded-2xl animate-pulse"></div>
          ))}
        </div>
      ) : drives.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <Briefcase className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No Placement Drives Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchTerm
              ? `No placement drives matching "${searchTerm}". Try a different search term.`
              : 'There are currently no active placement drives available.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {drives.map((drive) => {
            const open = isDriveOpen(drive.lastDateToApply);
            const alreadyApplied = myAppliedDriveIds.has(drive.driveId);

            return (
              <div
                key={drive.driveId}
                className="bg-white rounded-2xl border border-slate-200 hover:border-blue-300 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
              >
                {/* Top Details */}
                <div className="p-6 space-y-4">
                  {/* Status & Package Bar */}
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        open
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      <Clock className="w-3 h-3" />
                      {open ? 'Applications Open' : 'Deadline Closed'}
                    </span>

                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-blue-50 text-blue-700 border border-blue-200">
                      <DollarSign className="w-3.5 h-3.5" />
                      {drive.company?.packageOffered || 'Attractive CTC'}
                    </span>
                  </div>

                  {/* Title & Company */}
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600">
                      {drive.jobRole}
                    </h3>
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 mt-1">
                      <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>{drive.company?.companyName || 'Campus Partner'}</span>
                    </div>
                  </div>

                  {/* Metadata Items */}
                  <div className="space-y-2 pt-2 text-xs text-slate-600 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>
                        Drive Date:{' '}
                        <strong className="text-slate-700 font-semibold">
                          {new Date(drive.driveDate).toLocaleDateString()}
                        </strong>
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>
                        Apply Before:{' '}
                        <strong className="text-slate-700 font-semibold">
                          {new Date(drive.lastDateToApply).toLocaleDateString()}
                        </strong>
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{drive.venue}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>Vacancies: <strong>{drive.vacancies} Positions</strong></span>
                    </div>
                  </div>

                  {/* Eligibility Preview */}
                  {drive.company?.eligibilityCriteria && (
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                      <span className="font-bold text-slate-700 block mb-0.5">
                        Eligibility Criteria:
                      </span>
                      <p className="text-slate-600 line-clamp-2">
                        {drive.company.eligibilityCriteria}
                      </p>
                    </div>
                  )}
                </div>

                {/* Footer Action */}
                <div className="p-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-3">
                  <span className="text-[11px] font-mono text-slate-400">
                    Drive ID: {drive.driveId}
                  </span>

                  {alreadyApplied ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-emerald-700 bg-emerald-100/70 border border-emerald-200">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Applied
                    </span>
                  ) : !open ? (
                    <span className="text-xs font-semibold text-rose-600">
                      Closed
                    </span>
                  ) : (
                    <Link
                      to={isAuthenticated ? `/apply/${drive.driveId}` : '/login'}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-xs transition-all"
                    >
                      <span>Apply Now</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PlacementDrives;
