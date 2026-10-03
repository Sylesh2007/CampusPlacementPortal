import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  GraduationCap,
  Building2,
  ShieldCheck,
  Briefcase,
  ArrowRight,
  CheckCircle2,
  Calendar,
  MapPin,
  TrendingUp,
  Users,
  Search,
  CheckCheck,
} from 'lucide-react';

const Home = () => {
  const { isAuthenticated, role } = useAuth();
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentDrives = async () => {
      try {
        const response = await api.get('/drives');
        if (response.data.success) {
          setDrives(response.data.data.slice(0, 3));
        }
      } catch (err) {
        console.error('Error fetching drives for home preview:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecentDrives();
  }, []);

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/70 via-white to-slate-50 border-b border-slate-200 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold tracking-wide border border-blue-200">
                <GraduationCap className="w-4 h-4 text-blue-600" />
                <span>Inspired by SIH 2025 Career & Employability Platform</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
                Modernizing Campus <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-600">
                  Recruitment & Placements
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
                Replace manual spreadsheets and Google Forms with a centralized MERN Stack recruitment
                hub. Students discover opportunities, companies manage campus drives, and administrators
                monitor placement statistics seamlessly.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3.5 pt-2">
                {!isAuthenticated ? (
                  <>
                    <Link
                      to="/register"
                      className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md hover:shadow-lg transition-all"
                    >
                      Student Registration
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                    <Link
                      to="/drives"
                      className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl transition-all shadow-xs"
                    >
                      <Briefcase className="w-4 h-4 text-slate-500" />
                      Browse Placement Drives
                    </Link>
                    <Link
                      to="/login"
                      className="inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-slate-600 hover:text-blue-700 rounded-xl hover:bg-blue-50/60 transition-colors"
                    >
                      Portal Sign In
                    </Link>
                  </>
                ) : (
                  <Link
                    to={
                      role === 'student'
                        ? '/student-dashboard'
                        : role === 'company'
                        ? '/company-dashboard'
                        : '/admin-dashboard'
                    }
                    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition-all"
                  >
                    Go to Your {role.charAt(0).toUpperCase() + role.slice(1)} Dashboard
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
              </div>

              {/* Key Trust Metrics */}
              <div className="pt-6 grid grid-cols-3 gap-4 border-t border-slate-200/80 text-left">
                <div>
                  <div className="text-2xl font-black text-slate-900">100%</div>
                  <div className="text-xs text-slate-500 font-medium">Digital Workflow</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-blue-600">Real-Time</div>
                  <div className="text-xs text-slate-500 font-medium">Application Tracking</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-slate-900">Role-Based</div>
                  <div className="text-xs text-slate-500 font-medium">Student / Company / Admin</div>
                </div>
              </div>
            </div>

            {/* Right Card / Visual */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-bl-full pointer-events-none"></div>

                <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                    <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                  </div>
                  <span className="text-xs font-mono font-medium text-slate-400">Portal Overview</span>
                </div>

                <div className="space-y-4">
                  {/* Card 1 */}
                  <div className="flex items-start gap-3 p-3.5 rounded-xl bg-blue-50/70 border border-blue-100">
                    <div className="p-2 rounded-lg bg-blue-600 text-white shrink-0">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Student Portal</h4>
                      <p className="text-xs text-slate-600">
                        View upcoming drives, check eligibility criteria, apply in one click, and track selection results.
                      </p>
                    </div>
                  </div>

                  {/* Card 2 */}
                  <div className="flex items-start gap-3 p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-100">
                    <div className="p-2 rounded-lg bg-emerald-600 text-white shrink-0">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Company Portal</h4>
                      <p className="text-xs text-slate-600">
                        Post new placement drives, specify criteria, view eligible applicants, and update selections.
                      </p>
                    </div>
                  </div>

                  {/* Card 3 */}
                  <div className="flex items-start gap-3 p-3.5 rounded-xl bg-purple-50/70 border border-purple-100">
                    <div className="p-2 rounded-lg bg-purple-600 text-white shrink-0">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Administrator Console</h4>
                      <p className="text-xs text-slate-600">
                        Verify student applications, manage company records, publish final results, and generate placement reports.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1.5 font-medium text-emerald-600">
                    <CheckCheck className="w-4 h-4" /> Atlas Connected
                  </span>
                  <Link to="/login" className="font-semibold text-blue-600 hover:underline">
                    Access Portal →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured / Upcoming Drives Preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Upcoming Placement Drives</h2>
            <p className="text-sm text-slate-500 mt-1">
              Active on-campus recruitment opportunities for eligible candidates
            </p>
          </div>
          <Link
            to="/drives"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700"
          >
            View All Placement Drives
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-slate-200/60 rounded-xl animate-pulse"></div>
            ))}
          </div>
        ) : drives.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
            <Briefcase className="w-10 h-10 text-slate-400 mx-auto mb-2" />
            <p className="text-slate-600 font-medium">No placement drives posted yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {drives.map((drive) => (
              <div
                key={drive.driveId}
                className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="font-bold text-lg text-slate-900 leading-snug">
                      {drive.jobRole}
                    </div>
                    <span className="shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                      {drive.company?.packageOffered || 'Attractive CTC'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-4">
                    <Building2 className="w-4 h-4 text-slate-400" />
                    <span>{drive.company?.companyName || 'Campus Partner'}</span>
                  </div>

                  <div className="space-y-2 text-xs text-slate-600 mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>Drive Date: {new Date(drive.driveDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">{drive.venue}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <span>Vacancies: {drive.vacancies}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-mono">ID: {drive.driveId}</span>
                  <Link
                    to={isAuthenticated && role === 'student' ? `/apply/${drive.driveId}` : '/drives'}
                    className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800"
                  >
                    Apply Now <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* System Working Principle / 9-Step Process */}
      <section className="bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-bold tracking-wider text-blue-400 uppercase">
              Working Principle
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold mt-2">
              End-to-End Placement Workflow
            </h2>
            <p className="text-sm text-slate-400 mt-2">
              Strictly following the project working flow defined in the PDF specification
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                step: '01',
                title: 'Student Registration',
                desc: 'Student registers their profile with name, email, credentials and unique Student ID.',
              },
              {
                step: '02',
                title: 'Placement Drive Posting',
                desc: 'Companies register and post upcoming drives with job roles, dates, venue, and criteria.',
              },
              {
                step: '03',
                title: 'Drive Search & Browse',
                desc: 'Students browse available opportunities, check criteria, venue, and CTC details.',
              },
              {
                step: '04',
                title: 'Job Application',
                desc: 'Eligible students submit applications for their desired placement drives.',
              },
              {
                step: '05',
                title: 'MongoDB Atlas Storage',
                desc: 'Application records are stored in MongoDB with indexed relationships and timestamps.',
              },
              {
                step: '06',
                title: 'Company Review',
                desc: 'Companies review applicant profiles against criteria from their dedicated dashboard.',
              },
              {
                step: '07',
                title: 'Update Selection Status',
                desc: 'Company marks student progress (Under Review, Shortlisted, Selected, Rejected).',
              },
              {
                step: '08',
                title: 'Student Result Tracking',
                desc: 'Students track live application and selection status in real-time.',
              },
              {
                step: '09',
                title: 'Admin Monitoring & Reports',
                desc: 'Placement administrator verifies submissions, publishes results, and analyzes statistics.',
              },
            ].map((item) => (
              <div
                key={item.step}
                className="bg-slate-800/80 rounded-xl border border-slate-700/80 p-5 hover:border-blue-500/50 transition-colors"
              >
                <div className="text-blue-400 font-mono text-sm font-bold mb-2">Step {item.step}</div>
                <h3 className="font-bold text-base text-white mb-1.5">{item.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Role Access Direct Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl font-bold text-slate-900">Dedicated Portals for Every Role</h2>
          <p className="text-sm text-slate-500 mt-1">
            Access your personalized portal with specialized tools and role-based permissions
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Student */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between shadow-xs hover:shadow-md transition-shadow">
            <div>
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-4">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Students</h3>
              <ul className="text-xs text-slate-600 space-y-2 mb-6">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                  Self-registration & secure authentication
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                  Browse all active placement drives
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                  Apply online and track selection status
                </li>
              </ul>
            </div>
            <Link
              to="/login"
              className="w-full text-center py-2.5 px-4 rounded-xl text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors"
            >
              Sign In as Student →
            </Link>
          </div>

          {/* Company */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between shadow-xs hover:shadow-md transition-shadow">
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Companies</h3>
              <ul className="text-xs text-slate-600 space-y-2 mb-6">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  Post upcoming placement drives
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  View eligible student applicants
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  Update candidate selection results
                </li>
              </ul>
            </div>
            <Link
              to="/login"
              className="w-full text-center py-2.5 px-4 rounded-xl text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors"
            >
              Sign In as Company →
            </Link>
          </div>

          {/* Admin */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between shadow-xs hover:shadow-md transition-shadow">
            <div>
              <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Placement Cell</h3>
              <ul className="text-xs text-slate-600 space-y-2 mb-6">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
                  Register visiting companies & drives
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
                  Verify student applications & publish results
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
                  Generate placement statistics & reports
                </li>
              </ul>
            </div>
            <Link
              to="/login"
              className="w-full text-center py-2.5 px-4 rounded-xl text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 transition-colors"
            >
              Sign In as Admin →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
