import React from 'react';
import { GraduationCap, Database, Server, Code, ShieldCheck } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="mt-auto bg-slate-900 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Column 1: Info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5 text-white font-bold text-lg">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                <GraduationCap className="w-5 h-5" />
              </div>
              <span>Campus Placement Management Portal</span>
            </div>
            <p className="text-sm text-slate-400 max-w-md leading-relaxed">
              A complete MERN Stack Mini Project streamlining college recruitment drives,
              student registrations, job applications, company selection results, and placement reports.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-blue-900/50 text-blue-300 border border-blue-800">
                <Code className="w-3 h-3" /> ReactJS
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-900/50 text-emerald-300 border border-emerald-800">
                <Server className="w-3 h-3" /> ExpressJS & NodeJS
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-green-900/50 text-green-300 border border-green-800">
                <Database className="w-3 h-3" /> MongoDB Atlas
              </span>
            </div>
          </div>

          {/* Column 2: User Roles */}
          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">
              User Portals
            </h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li className="hover:text-white transition-colors">
                <span className="font-semibold text-blue-400">Student:</span> Browse Drives & Apply
              </li>
              <li className="hover:text-white transition-colors">
                <span className="font-semibold text-emerald-400">Company:</span> Post Drives & Select
              </li>
              <li className="hover:text-white transition-colors">
                <span className="font-semibold text-purple-400">Admin:</span> Manage & Reports
              </li>
            </ul>
          </div>

          {/* Column 3: Architecture & Security */}
          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">
              System Specifications
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li>• Inspired by SIH 2025 Career Platform</li>
              <li>• JWT Token Authentication & bcrypt Hashing</li>
              <li>• MongoDB Atlas CRUD & Aggregation</li>
              <li>• Standardized REST API Architecture</li>
              <li>• Role-Based Access Control (RBAC)</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <p>© {new Date().getFullYear()} Campus Placement Management Portal. All rights reserved.</p>
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>REST API & MongoDB Atlas Active</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
