import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  FileCheck,
  Building2,
  Calendar,
  MapPin,
  Users,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  GraduationCap,
  ShieldCheck,
} from 'lucide-react';

const ApplyJob = () => {
  const { driveId: urlDriveId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [availableDrives, setAvailableDrives] = useState([]);
  const [selectedDriveId, setSelectedDriveId] = useState(urlDriveId || '');
  const [selectedDrive, setSelectedDrive] = useState(null);
  const [loadingDrives, setLoadingDrives] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successData, setSuccessData] = useState(null);
  const [agreeEligibility, setAgreeEligibility] = useState(false);

  useEffect(() => {
    const fetchDrives = async () => {
      try {
        const response = await api.get('/drives');
        if (response.data.success) {
          const drives = response.data.data;
          setAvailableDrives(drives);

          const initialId = urlDriveId || (drives.length > 0 ? drives[0].driveId : '');
          setSelectedDriveId(initialId);

          const found = drives.find((d) => d.driveId === initialId);
          setSelectedDrive(found || null);
        }
      } catch (err) {
        console.error('Error fetching drives:', err);
        setError('Failed to load placement drives list.');
      } finally {
        setLoadingDrives(false);
      }
    };

    fetchDrives();
  }, [urlDriveId]);

  const handleDriveChange = (e) => {
    const dId = e.target.value;
    setSelectedDriveId(dId);
    setError('');
    const found = availableDrives.find((d) => d.driveId === dId);
    setSelectedDrive(found || null);
  };

  const handleApply = async (e) => {
    e.preventDefault();
    setError('');

    if (!selectedDriveId) {
      setError('Please select a placement drive.');
      return;
    }

    if (!agreeEligibility) {
      setError('Please review and check the eligibility confirmation box.');
      return;
    }

    // Check application deadline
    if (selectedDrive && new Date() > new Date(selectedDrive.lastDateToApply)) {
      setError('The deadline for applying to this placement drive has passed.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await api.post('/apply', {
        driveId: selectedDriveId,
        studentId: user?.userId,
      });

      if (response.data.success) {
        setSuccessData(response.data.data);
      } else {
        setError(response.data.message || 'Application submission failed.');
      }
    } catch (err) {
      console.error('Apply error:', err);
      setError(
        err.response?.data?.message || 'Failed to submit application. Please check eligibility or duplicates.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingDrives) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-sm font-medium text-slate-600">Loading placement drive details...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      {/* Back button */}
      <div>
        <Link
          to="/drives"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Placement Drives
        </Link>
      </div>

      {/* Success Modal / State */}
      {successData ? (
        <div className="bg-white rounded-2xl border border-emerald-200 shadow-xl p-8 text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-black text-slate-900">Application Submitted!</h2>
            <p className="text-sm text-slate-600">
              Your application has been recorded in the placement portal.
            </p>
          </div>

          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-left text-xs space-y-2 max-w-md mx-auto">
            <div className="flex justify-between">
              <span className="text-slate-500">Application ID:</span>
              <span className="font-mono font-bold text-slate-800">{successData.applicationId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Student ID:</span>
              <span className="font-mono font-bold text-slate-800">{successData.studentId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Role & Company:</span>
              <span className="font-bold text-slate-800">
                {selectedDrive?.jobRole} ({selectedDrive?.company?.companyName})
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Initial Status:</span>
              <span className="font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                {successData.status || 'Applied'}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              to="/my-applications"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-xs"
            >
              <span>View My Applications</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/drives"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200"
            >
              Browse Other Drives
            </Link>
          </div>
        </div>
      ) : (
        /* Application Form */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
          {/* Header */}
          <div className="p-6 bg-gradient-to-r from-blue-700 to-indigo-700 text-white space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-200 uppercase tracking-wider">
              <FileCheck className="w-4 h-4" />
              <span>Online Job Application</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black">
              Apply for Placement Opportunity
            </h1>
            <p className="text-xs text-blue-100">
              Submit your formal application to the campus recruitment coordinator.
            </p>
          </div>

          <form onSubmit={handleApply} className="p-6 sm:p-8 space-y-6">
            {/* Error banner */}
            {error && (
              <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 text-red-700 border border-red-200 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Student Info Card */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Applicant Information
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block">Candidate Name:</span>
                  <span className="font-bold text-slate-800">{user?.name}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Student ID:</span>
                  <span className="font-mono font-bold text-slate-800">{user?.userId}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Registered Email:</span>
                  <span className="font-medium text-slate-800">{user?.email}</span>
                </div>
              </div>
            </div>

            {/* Select Placement Drive */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Select Placement Drive *
              </label>
              <select
                value={selectedDriveId}
                onChange={handleDriveChange}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:border-transparent font-medium"
              >
                {availableDrives.map((d) => (
                  <option key={d.driveId} value={d.driveId}>
                    {d.jobRole} — {d.company?.companyName || d.companyId} (Drive Date:{' '}
                    {new Date(d.driveDate).toLocaleDateString()})
                  </option>
                ))}
              </select>
            </div>

            {/* Drive Details Preview Card */}
            {selectedDrive && (
              <div className="p-5 bg-blue-50/50 rounded-xl border border-blue-200/60 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-blue-200/60 pb-3">
                  <div>
                    <h3 className="font-bold text-base text-slate-900">
                      {selectedDrive.jobRole}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 mt-0.5">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      <span>{selectedDrive.company?.companyName}</span>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300 self-start sm:self-auto">
                    <DollarSign className="w-3.5 h-3.5" />
                    Package: {selectedDrive.company?.packageOffered}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Drive Date: {new Date(selectedDrive.driveDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>Venue: {selectedDrive.venue}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>Total Vacancies: {selectedDrive.vacancies}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      Deadline:{' '}
                      <strong className="text-slate-800 font-semibold">
                        {new Date(selectedDrive.lastDateToApply).toLocaleDateString()}
                      </strong>
                    </span>
                  </div>
                </div>

                {/* Eligibility criteria display */}
                <div className="pt-3 border-t border-blue-200/60 text-xs">
                  <span className="font-bold text-slate-800 block mb-1">
                    Company Eligibility Requirements:
                  </span>
                  <p className="text-slate-700 bg-white/80 p-3 rounded-lg border border-blue-100">
                    {selectedDrive.company?.eligibilityCriteria || 'Standard placement guidelines apply.'}
                  </p>
                </div>
              </div>
            )}

            {/* Checkbox confirmation */}
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <input
                type="checkbox"
                id="eligibilityAgreement"
                checked={agreeEligibility}
                onChange={(e) => {
                  setAgreeEligibility(e.target.checked);
                  if (error) setError('');
                }}
                className="mt-0.5 w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer"
              />
              <label
                htmlFor="eligibilityAgreement"
                className="text-xs text-slate-700 leading-relaxed cursor-pointer select-none"
              >
                I confirm that I satisfy the stated eligibility criteria and wish to submit my official
                application for this placement drive.
              </label>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={submitting}
              className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md transition-all ${
                submitting ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {submitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Confirm & Submit Application</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ApplyJob;
