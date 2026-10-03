import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LogIn,
  Mail,
  Lock,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  Building2,
  Sparkles,
} from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ==========================================
  // REDIRECT BASED ON USER ROLE
  // ==========================================
  const redirectAfterLogin = (userRole) => {
    if (userRole === 'admin') {
      navigate('/admin-dashboard');
    } else if (userRole === 'company') {
      navigate('/company-dashboard');
    } else {
      navigate('/student-dashboard');
    }
  };

  // ==========================================
  // LOGIN SUBMISSION
  // ==========================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError('');

    // Validate fields
    if (!email.trim() || !password.trim()) {
      setError('Please enter both your email address and password.');
      return;
    }

    setLoading(true);

    try {
      const result = await login(
        email.trim().toLowerCase(),
        password
      );

      if (result.success) {
        redirectAfterLogin(result.user.role);
      } else {
        setError(result.message || 'Invalid email or password.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(
        'Unable to connect to the server. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // QUICK FILL CREDENTIALS
  // ==========================================
  const setDemoCredentials = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">

      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-xl p-8 space-y-6">

        {/* ==========================================
            HEADER
        ========================================== */}
        <div className="text-center space-y-2">

          <div className="inline-flex p-3 rounded-xl bg-blue-50 text-blue-600 mb-1">
            <LogIn className="w-8 h-8" />
          </div>

          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Portal Authentication
          </h2>

          <p className="text-xs text-slate-500">
            Sign in to access your role-based placement dashboard
          </p>

        </div>

        {/* ==========================================
            ERROR MESSAGE
        ========================================== */}
        {error && (
          <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 text-red-700 border border-red-200 text-xs">

            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />

            <span>{error}</span>

          </div>
        )}

        {/* ==========================================
            LOGIN FORM
        ========================================== */}
        <form
          onSubmit={handleSubmit}
          className="space-y-4"
          autoComplete="off"
        >

          {/* ========================================
              EMAIL
          ======================================== */}
          <div>

            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Email Address
            </label>

            <div className="relative">

              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>

              <input
                type="email"
                name="portal-login-email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);

                  if (error) {
                    setError('');
                  }
                }}
                required
                autoComplete="off"
                placeholder="name@campus.edu or hr@company.com"
                className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
              />

            </div>

          </div>

          {/* ========================================
              PASSWORD
          ======================================== */}
          <div>

            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Password
            </label>

            <div className="relative">

              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>

              <input
                type="password"
                name="portal-login-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);

                  if (error) {
                    setError('');
                  }
                }}
                required
                autoComplete="new-password"
                placeholder="••••••••••••"
                className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
              />

            </div>

          </div>

          {/* ========================================
              LOGIN BUTTON
          ======================================== */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md transition-all ${
              loading
                ? 'opacity-70 cursor-not-allowed'
                : ''
            }`}
          >

            {loading ? (

              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>

            ) : (

              <>
                <span>
                  Sign In to Dashboard
                </span>

                <ArrowRight className="w-4 h-4" />
              </>

            )}

          </button>

        </form>

        {/* ==========================================
            QUICK FILL TEST ACCOUNTS
        ========================================== */}
        <div className="pt-4 border-t border-slate-100">

          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 mb-2">

            <Sparkles className="w-3.5 h-3.5 text-amber-500" />

            <span>
              Quick Fill Test Accounts:
            </span>

          </div>

          <div className="grid grid-cols-3 gap-2">

            {/* ======================================
                ADMIN
            ====================================== */}
            <button
              type="button"
              onClick={() =>
                setDemoCredentials(
                  'admin@campusportal.com',
                  'Admin@123'
                )
              }
              className="py-2 px-2 text-[11px] font-bold rounded-lg border border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors flex flex-col items-center gap-1"
            >

              <ShieldCheck className="w-3.5 h-3.5" />

              <span>
                Admin
              </span>

            </button>

            {/* ======================================
                STUDENT
            ====================================== */}
            <button
              type="button"
              onClick={() =>
                setDemoCredentials(
                  'student2@campusportal.com',
                  'Student@123'
                )
              }
              className="py-2 px-2 text-[11px] font-bold rounded-lg border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors flex flex-col items-center gap-1"
            >

              <UserCheck className="w-3.5 h-3.5" />

              <span>
                Student
              </span>

            </button>

            {/* ======================================
                COMPANY
            ====================================== */}
            <button
              type="button"
              onClick={() =>
                setDemoCredentials(
                  'hr@tcs.com',
                  'Company@123'
                )
              }
              className="py-2 px-2 text-[11px] font-bold rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors flex flex-col items-center gap-1"
            >

              <Building2 className="w-3.5 h-3.5" />

              <span>
                Company
              </span>

            </button>

          </div>

        </div>

        {/* ==========================================
            FOOTER
        ========================================== */}
        <div className="pt-3 border-t border-slate-100 text-center text-xs text-slate-500">

          New student or recruiter?{' '}

          <Link
            to="/register"
            className="font-bold text-blue-600 hover:underline"
          >
            Register here
          </Link>

        </div>

      </div>

    </div>
  );
};

export default Login;