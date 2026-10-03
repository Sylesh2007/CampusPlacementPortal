import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  GraduationCap,
  Briefcase,
  FileText,
  LayoutDashboard,
  Building2,
  BarChart3,
  LogOut,
  LogIn,
  UserPlus,
  Menu,
  X,
  UserCheck,
  ShieldCheck,
} from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, role, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleBadge = () => {
    if (role === 'admin') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">
          <ShieldCheck className="w-3.5 h-3.5" /> Admin
        </span>
      );
    }
    if (role === 'company') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
          <Building2 className="w-3.5 h-3.5" /> Company
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
        <UserCheck className="w-3.5 h-3.5" /> Student
      </span>
    );
  };

  const linkClass = ({ isActive }) =>
    `inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-150 ${
      isActive
        ? 'text-blue-700 bg-blue-50 font-semibold'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
    }`;

  const mobileLinkClass = ({ isActive }) =>
    `flex items-center gap-2.5 px-4 py-2.5 text-base font-medium rounded-lg transition-colors ${
      isActive
        ? 'text-blue-700 bg-blue-50 font-semibold'
        : 'text-slate-700 hover:text-blue-600 hover:bg-slate-50'
    }`;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform duration-200">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="font-bold text-slate-900 leading-tight tracking-tight text-base sm:text-lg flex items-center gap-1.5">
                Campus Placement
                <span className="hidden sm:inline-block text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                  Portal
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                MERN Stack Campus Recruitment Platform
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {!isAuthenticated ? (
              <>
                <NavLink to="/" end className={linkClass}>
                  Home
                </NavLink>
                <NavLink to="/drives" className={linkClass}>
                  <Briefcase className="w-4 h-4 text-slate-500" />
                  Placement Drives
                </NavLink>
              </>
            ) : null}

            {/* Student Navigation */}
            {isAuthenticated && role === 'student' && (
              <>
                <NavLink to="/student-dashboard" className={linkClass}>
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </NavLink>
                <NavLink to="/drives" className={linkClass}>
                  <Briefcase className="w-4 h-4" />
                  Placement Drives
                </NavLink>
                <NavLink to="/my-applications" className={linkClass}>
                  <FileText className="w-4 h-4" />
                  My Applications
                </NavLink>
              </>
            )}

            {/* Company Navigation */}
            {isAuthenticated && role === 'company' && (
              <>
                <NavLink to="/company-dashboard" className={linkClass}>
                  <LayoutDashboard className="w-4 h-4" />
                  Company Dashboard
                </NavLink>
                <NavLink to="/drives" className={linkClass}>
                  <Briefcase className="w-4 h-4" />
                  All Drives
                </NavLink>
              </>
            )}

            {/* Admin Navigation */}
            {isAuthenticated && role === 'admin' && (
              <>
                <NavLink to="/admin-dashboard" className={linkClass}>
                  <LayoutDashboard className="w-4 h-4" />
                  Admin Dashboard
                </NavLink>
                <NavLink to="/drives" className={linkClass}>
                  <Briefcase className="w-4 h-4" />
                  Drives Directory
                </NavLink>
              </>
            )}
          </nav>

          {/* User Auth Buttons / Profile */}
          <div className="hidden md:flex items-center gap-3">
            {!isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-slate-700 hover:text-blue-700 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs hover:shadow transition-all duration-150"
                >
                  <UserPlus className="w-4 h-4" />
                  Register
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-3 border-l border-slate-200 pl-4">
                <div className="flex flex-col items-end">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-900 max-w-[140px] truncate">
                      {user?.name}
                    </span>
                    {getRoleBadge()}
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono">
                    ID: {user?.userId}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  title="Logout"
                  className="inline-flex items-center justify-center p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-200"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden gap-2">
            {isAuthenticated && getRoleBadge()}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg focus:outline-hidden"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-2 shadow-lg">
          {!isAuthenticated ? (
            <>
              <NavLink
                to="/"
                end
                onClick={() => setMobileMenuOpen(false)}
                className={mobileLinkClass}
              >
                Home
              </NavLink>
              <NavLink
                to="/drives"
                onClick={() => setMobileMenuOpen(false)}
                className={mobileLinkClass}
              >
                <Briefcase className="w-4 h-4" />
                Placement Drives
              </NavLink>
              <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
                >
                  Register
                </Link>
              </div>
            </>
          ) : (
            <>
              <div className="px-3 py-2 bg-slate-50 rounded-lg mb-2">
                <p className="text-xs text-slate-500 font-medium">Signed in as</p>
                <p className="text-sm font-bold text-slate-800">{user?.name}</p>
                <p className="text-xs text-slate-500 font-mono">{user?.email} • {user?.userId}</p>
              </div>

              {role === 'student' && (
                <>
                  <NavLink
                    to="/student-dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className={mobileLinkClass}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </NavLink>
                  <NavLink
                    to="/drives"
                    onClick={() => setMobileMenuOpen(false)}
                    className={mobileLinkClass}
                  >
                    <Briefcase className="w-4 h-4" />
                    Placement Drives
                  </NavLink>
                  <NavLink
                    to="/my-applications"
                    onClick={() => setMobileMenuOpen(false)}
                    className={mobileLinkClass}
                  >
                    <FileText className="w-4 h-4" />
                    My Applications
                  </NavLink>
                </>
              )}

              {role === 'company' && (
                <>
                  <NavLink
                    to="/company-dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className={mobileLinkClass}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Company Dashboard
                  </NavLink>
                  <NavLink
                    to="/drives"
                    onClick={() => setMobileMenuOpen(false)}
                    className={mobileLinkClass}
                  >
                    <Briefcase className="w-4 h-4" />
                    Placement Drives
                  </NavLink>
                </>
              )}

              {role === 'admin' && (
                <>
                  <NavLink
                    to="/admin-dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className={mobileLinkClass}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Admin Dashboard
                  </NavLink>
                  <NavLink
                    to="/drives"
                    onClick={() => setMobileMenuOpen(false)}
                    className={mobileLinkClass}
                  >
                    <Briefcase className="w-4 h-4" />
                    Drives Directory
                  </NavLink>
                </>
              )}

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center justify-center gap-2 mt-4 py-2.5 text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
