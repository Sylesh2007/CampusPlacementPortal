import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  GraduationCap,
  Building2,
  Mail,
  Lock,
  User,
  MapPin,
  Globe,
  DollarSign,
  FileCheck,
  AlertCircle,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState('student');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    userId: '',
    // Company specific fields
    companyName: '',
    location: '',
    website: '',
    HRName: '',
    packageOffered: '',
    eligibilityCriteria: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim()) {
      setError('Please fill in all mandatory fields.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (role === 'company') {
      if (!formData.location.trim() || !formData.packageOffered.trim() || !formData.eligibilityCriteria.trim()) {
        setError('Please complete the company location, package, and eligibility criteria.');
        return;
      }
    }

    setLoading(true);

    const payload = {
      ...formData,
      role,
      companyName: role === 'company' ? (formData.companyName || formData.name) : undefined,
      HRName: role === 'company' ? (formData.HRName || formData.name) : undefined,
    };

    const result = await register(payload);
    setLoading(false);

    if (result.success) {
      if (role === 'company') {
        navigate('/company-dashboard');
      } else {
        navigate('/student-dashboard');
      }
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-xl w-full bg-white rounded-2xl border border-slate-200 shadow-xl p-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-xl bg-blue-50 text-blue-600 mb-1">
            <GraduationCap className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Create an Account
          </h2>
          <p className="text-xs text-slate-500">
            Register to join the Campus Placement Management Portal
          </p>
        </div>

        {/* Role Toggle Selector */}
        <div className="grid grid-cols-2 p-1.5 bg-slate-100 rounded-xl">
          <button
            type="button"
            onClick={() => {
              setRole('student');
              setError('');
            }}
            className={`flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-lg transition-all ${
              role === 'student'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            Student Registration
          </button>
          <button
            type="button"
            onClick={() => {
              setRole('company');
              setError('');
            }}
            className={`flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-lg transition-all ${
              role === 'company'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-4 h-4" />
            Company Registration
          </button>
        </div>

        {/* Error Feedback Alert */}
        {error && (
          <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 text-red-700 border border-red-200 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Common Field: Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              {role === 'student' ? 'Full Name' : 'Company / Recruiter Name'} *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder={role === 'student' ? 'e.g. Rahul Sharma' : 'e.g. Google India / HR Desk'}
                className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Common Field: Email */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Email Address *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder={role === 'student' ? 'rahul@campus.edu' : 'recruitment@company.com'}
                className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Common Field: Password */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Password *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="At least 6 characters"
                className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Optional Custom User ID */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              {role === 'student' ? 'Roll No / Student ID (Optional)' : 'Company ID (Optional)'}
            </label>
            <input
              type="text"
              name="userId"
              value={formData.userId}
              onChange={handleChange}
              placeholder={role === 'student' ? 'e.g. STU98234 (Auto-generated if empty)' : 'e.g. CMP8912 (Auto-generated if empty)'}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:border-transparent font-mono transition-all"
            />
          </div>

          {/* Company-specific PDF attributes */}
          {role === 'company' && (
            <div className="pt-2 border-t border-slate-200 space-y-4">
              <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                Company Details (MongoDB Attributes)
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Location *
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      required={role === 'company'}
                      placeholder="e.g. Bangalore, Hyderabad"
                      className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Website *
                  </label>
                  <div className="relative">
                    <Globe className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="url"
                      name="website"
                      value={formData.website}
                      onChange={handleChange}
                      required={role === 'company'}
                      placeholder="https://company.com"
                      className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    HR Contact Name *
                  </label>
                  <input
                    type="text"
                    name="HRName"
                    value={formData.HRName}
                    onChange={handleChange}
                    required={role === 'company'}
                    placeholder="e.g. Sarah Jenkins"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Package Offered (CTC) *
                  </label>
                  <div className="relative">
                    <DollarSign className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="text"
                      name="packageOffered"
                      value={formData.packageOffered}
                      onChange={handleChange}
                      required={role === 'company'}
                      placeholder="e.g. 14 LPA"
                      className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Eligibility Criteria *
                </label>
                <textarea
                  name="eligibilityCriteria"
                  value={formData.eligibilityCriteria}
                  onChange={handleChange}
                  required={role === 'company'}
                  rows="2"
                  placeholder="e.g. CGPA >= 7.5, B.Tech CSE/IT/ECE, No active backlogs"
                  className="w-full p-2.5 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                ></textarea>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white shadow-md transition-all ${
              role === 'student'
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-emerald-600 hover:bg-emerald-700'
            } ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <span>Complete Registration</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer link to Login */}
        <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
          Already registered on the portal?{' '}
          <Link to="/login" className="font-bold text-blue-600 hover:underline">
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
