import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  GraduationCap,
  Briefcase,
  FileText,
  Award,
  CheckCircle2,
  Clock,
  ArrowRight,
  Building2,
  Calendar,
  Sparkles,
  MapPin,
} from 'lucide-react';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [drives, setDrives] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [driveRes, appRes] = await Promise.all([
          api.get('/drives'),
          api.get('/applications'),
        ]);

        if (driveRes.data.success) {
          setDrives(driveRes.data.data);
        }
        if (appRes.data.success) {
          setApplications(appRes.data.data);
        }
      } catch (err) {
        console.error('Error loading student dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const totalDrives = drives.length;
  const totalApplied = applications.length;
  const totalSelected = applications.filter((a) => a.selected === true).length;
  const appliedDriveIds = new Set(applications.map((a) => a.driveId));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 rounded-2xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-blue-100 text-xs font-semibold backdrop-blur-xs">
            <GraduationCap className="w-4 h-4" />
            <span>Student Placement Portal</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
            Welcome, {user?.name}!
          </h1>
          <p className="text-xs sm:text-sm text-blue-100 leading-relaxed">
            Student ID: <span className="font-mono font-bold text-white">{user?.userId}</span> • Email: {user?.email}
          </p>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Card 1 */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Available Drives
            </p>
            <h3 className="text-3xl font-black text-slate-900 mt-1">{totalDrives}</h3>
            <p className="text-xs text-slate-500 mt-1">Active on-campus opportunities</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
            <Briefcase className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              My Applications
            </p>
            <h3 className="text-3xl font-black text-slate-900 mt-1">{totalApplied}</h3>
            <p className="text-xs text-slate-500 mt-1">Submitted placement drives</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Offers & Selections
            </p>
            <h3 className="text-3xl font-black text-emerald-600 mt-1">{totalSelected}</h3>
            <p className="text-xs text-slate-500 mt-1">Confirmed placement selections</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Sections: Recent Applications & Recommended Drives */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: My Recent Applications */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="font-bold text-lg text-slate-900">Recent Applications</h2>
              <p className="text-xs text-slate-500">Live progress and review statuses</p>
            </div>
            <Link
              to="/my-applications"
              className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              View All ({applications.length}) <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="py-8 text-center text-slate-400 text-xs">Loading applications...</div>
          ) : applications.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-xs">
              You haven't submitted any applications yet.
            </div>
          ) : (
            <div className="space-y-3">
              {applications.slice(0, 4).map((app) => (
                <div
                  key={app.applicationId}
                  className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 transition-colors"
                >
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">
                      {app.drive?.jobRole || 'Campus Job'}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {app.drive?.company?.companyName} • Applied on{' '}
                      {new Date(app.applicationDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        app.selected
                          ? 'bg-emerald-100 text-emerald-800'
                          : app.status === 'Shortlisted'
                          ? 'bg-indigo-100 text-indigo-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {app.selected ? 'Selected' : app.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Available Drives Quick Browse */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="font-bold text-lg text-slate-900">Open Drives</h2>
              <p className="text-xs text-slate-500">Upcoming campus recruitment opportunities</p>
            </div>
            <Link
              to="/drives"
              className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              Browse All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="py-8 text-center text-slate-400 text-xs">Loading drives...</div>
          ) : drives.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-xs">No drives available right now.</div>
          ) : (
            <div className="space-y-3">
              {drives.slice(0, 4).map((d) => {
                const isApplied = appliedDriveIds.has(d.driveId);
                return (
                  <div
                    key={d.driveId}
                    className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 flex items-center justify-between gap-3"
                  >
                    <div>
                      <h4 className="font-bold text-xs text-slate-900">{d.jobRole}</h4>
                      <p className="text-[11px] text-slate-500">
                        {d.company?.companyName} • {d.company?.packageOffered}
                      </p>
                    </div>

                    {isApplied ? (
                      <span className="text-xs font-semibold text-emerald-600">Applied</span>
                    ) : (
                      <Link
                        to={`/apply/${d.driveId}`}
                        className="px-3 py-1 rounded-lg text-xs font-bold text-blue-600 hover:bg-blue-100 bg-blue-50 transition-colors"
                      >
                        Apply
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
