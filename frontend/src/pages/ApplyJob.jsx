import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  ArrowLeft, ArrowRight, BriefcaseBusiness, CalendarDays, CheckCircle2,
  ChevronDown, FileText, GraduationCap,
  Mail, MapPin, Phone, Upload, UserRound, X, AlertCircle
} from 'lucide-react';

const initialForm = {
  phone: '',
  alternatePhone: '',
  dateOfBirth: '',
  gender: '',
  address: '',
  city: '',
  state: '',
  pincode: '',
  preferredLocation: '',
  consent: false,
};

const ApplyJob = () => {
  const { driveId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [drive, setDrive] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [resume, setResume] = useState(null);
  const resumeInputRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const loadDrive = async () => {
      try {
        const res = await api.get('/drives');
        const drives = Array.isArray(res.data?.data) ? res.data.data : [];
        const found = drives.find((d) => d.driveId === driveId);
        if (!found) {
          setError('Placement drive not found or no longer available.');
        } else {
          setDrive(found);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load placement drive.');
      } finally {
        setLoading(false);
      }
    };
    loadDrive();
  }, [driveId]);

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const deadlinePassed = useMemo(() => {
    if (!drive?.lastDateToApply) return false;
    const end = new Date(`${drive.lastDateToApply}T23:59:59`);
    return Number.isFinite(end.getTime()) && end < new Date();
  }, [drive]);

  const handleResume = (file) => {
    setError('');

    if (!file) {
      return;
    }

    const fileName = file.name || '';
    const extension = fileName.includes('.')
      ? fileName.split('.').pop().toLowerCase()
      : '';

    const allowedExtensions = ['pdf', 'doc', 'docx'];
    const allowedMimeTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    const validByExtension = allowedExtensions.includes(extension);
    const validByMime = allowedMimeTypes.includes(file.type);

    if (!validByExtension && !validByMime) {
      setResume(null);
      if (resumeInputRef.current) {
        resumeInputRef.current.value = '';
      }
      setError('Resume must be a PDF, DOC, or DOCX file.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setResume(null);
      if (resumeInputRef.current) {
        resumeInputRef.current.value = '';
      }
      setError('Resume must be 5 MB or smaller.');
      return;
    }

    setResume(file);
    setError('');
  };

  const handleResumeChange = (event) => {
    const file = event.target.files?.[0] || null;
    handleResume(file);
  };

  const removeResume = () => {
    setResume(null);
    setError('');
    if (resumeInputRef.current) {
      resumeInputRef.current.value = '';
    }
  };

  const validate = () => {
    if (!user?.userId) return 'Please sign in as a student before applying.';
    if (!form.phone.trim()) return 'Phone number is required.';
    if (!resume) return 'Please upload your latest resume.';
    if (!form.consent) return 'Please confirm that the information provided is accurate.';
    if (deadlinePassed) return 'The application deadline has passed.';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const validation = validate();
    if (validation) {
      setError(validation);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setSubmitting(true);
    try {
      const data = new FormData();
      data.append('driveId', driveId);
      data.append('studentId', user.userId);
      Object.entries(form).forEach(([key, value]) => {
        if (key !== 'consent') data.append(key, typeof value === 'string' ? value : String(value));
      });
      data.append('consent', String(form.consent));

      // Send the actual selected File object as multipart/form-data.
      data.append('resume', resume, resume.name);

      const res = await api.post('/apply', data, {
        // Do not force application/json here. Axios/browser must generate
        // the multipart boundary for the uploaded resume.
        headers: {
          'Content-Type': undefined,
        },
      });

      if (!res.data?.success) throw new Error(res.data?.message || 'Application failed.');
      setSuccess('Application submitted successfully. Your application is now under review.');
      setTimeout(() => navigate('/my-applications'), 1200);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to submit application.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="max-w-4xl mx-auto p-10 text-center text-slate-500">Loading application...</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-16">
      <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 mb-5">
        <ArrowLeft className="w-4 h-4" /> Back to Placement Drives
      </button>

      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-violet-700 rounded-2xl p-6 sm:p-8 text-white shadow-lg mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-blue-100 text-xs font-semibold mb-3">
              <BriefcaseBusiness className="w-4 h-4" /> Job Application
            </div>
            <h1 className="text-2xl sm:text-3xl font-black">{drive?.jobRole || 'Placement Application'}</h1>
            <p className="text-blue-100 mt-2">{drive?.company?.companyName || drive?.companyName || 'Company'}</p>
          </div>
          <div className="text-sm space-y-2 md:text-right">
            <div className="flex items-center gap-2 md:justify-end"><CalendarDays className="w-4 h-4" /> Drive: {drive?.driveDate ? new Date(drive.driveDate).toLocaleDateString() : '-'}</div>
            <div className="flex items-center gap-2 md:justify-end"><MapPin className="w-4 h-4" /> {drive?.venue || '-'}</div>
            <div className="font-bold">Apply by: {drive?.lastDateToApply ? new Date(drive.lastDateToApply).toLocaleDateString() : '-'}</div>
          </div>
        </div>
      </div>

      {error && <div className="mb-5 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm flex gap-2"><AlertCircle className="w-5 h-5 shrink-0" />{error}</div>}
      {success && <div className="mb-5 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex gap-2"><CheckCircle2 className="w-5 h-5 shrink-0" />{success}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Section title="Applicant Information" icon={<UserRound className="w-5 h-5" />}>
          <div className="grid sm:grid-cols-3 gap-4">
            <ReadOnly label="Full Name" value={user?.name || ''} />
            <ReadOnly label="Student ID" value={user?.userId || ''} />
            <ReadOnly label="Registered Email" value={user?.email || ''} />
          </div>
          <div className="grid sm:grid-cols-2 gap-4 mt-4">
            <Field label="Phone Number *" icon={<Phone className="w-4 h-4" />} value={form.phone} onChange={(v) => update('phone', v)} type="tel" placeholder="+91 98765 43210" />
            <Field label="Alternate Phone" value={form.alternatePhone} onChange={(v) => update('alternatePhone', v)} type="tel" placeholder="Optional" />
          </div>
          <div className="grid sm:grid-cols-3 gap-4 mt-4">
            <Field label="Date of Birth" value={form.dateOfBirth} onChange={(v) => update('dateOfBirth', v)} type="date" />
            <Select label="Gender" value={form.gender} onChange={(v) => update('gender', v)} options={['Male','Female','Non-binary','Prefer not to say']} />
            <Field label="Pincode" value={form.pincode} onChange={(v) => update('pincode', v)} placeholder="500001" />
          </div>
          <div className="grid sm:grid-cols-3 gap-4 mt-4">
            <Field label="City" value={form.city} onChange={(v) => update('city', v)} placeholder="Hyderabad" />
            <Field label="State" value={form.state} onChange={(v) => update('state', v)} placeholder="Telangana" />
            <Field label="Preferred Work Location" value={form.preferredLocation} onChange={(v) => update('preferredLocation', v)} placeholder="Bengaluru / Hyderabad / Remote" />
          </div>
          <TextArea label="Current Address" value={form.address} onChange={(v) => update('address', v)} placeholder="House / street / area" />
        </Section>

        <Section title="Resume" icon={<FileText className="w-5 h-5" />}>
          <div className="border-2 border-dashed border-blue-200 rounded-2xl p-6 bg-blue-50/40">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0"><Upload className="w-5 h-5" /></div>
              <div className="flex-1">
                <h3 className="font-bold text-slate-900">Upload Latest Resume *</h3>
                <p className="text-xs text-slate-500 mt-1">PDF, DOC or DOCX • Maximum 5 MB</p>
                <input
                  ref={resumeInputRef}
                  id="resume"
                  name="resume"
                  type="file"
                  accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  className="hidden"
                  onChange={handleResumeChange}
                />
                <label
                  htmlFor="resume"
                  className="inline-flex items-center gap-2 mt-4 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold cursor-pointer hover:bg-blue-700"
                >
                  <Upload className="w-4 h-4" /> Choose Resume
                </label>

                {resume && (
                  <div className="mt-3 flex items-center justify-between gap-3 bg-white border border-blue-200 rounded-xl p-3 text-sm">
                    <div className="min-w-0">
                      <div className="truncate font-semibold text-slate-900">{resume.name}</div>
                      <div className="text-xs text-emerald-600 mt-1">Resume selected successfully</div>
                    </div>
                    <button type="button" onClick={removeResume} aria-label="Remove resume">
                      <X className="w-4 h-4 text-slate-400" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Section>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <label className="flex items-start gap-3 text-sm text-slate-700 cursor-pointer">
            <input type="checkbox" checked={form.consent} onChange={(e) => update('consent', e.target.checked)} className="mt-1 w-4 h-4" />
            <span>I confirm that the information and documents provided are accurate and belong to me. I authorize the placement cell and recruiting company to use this information for recruitment purposes.</span>
          </label>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-xs text-slate-500">Your application will initially be marked <strong>Applied</strong> and can later be verified/shortlisted/selected by the recruiting team.</div>
          <button disabled={submitting || deadlinePassed} type="submit" className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold shadow-md min-w-64">
            {submitting ? 'Submitting Application...' : deadlinePassed ? 'Application Closed' : 'Submit Job Application'}
            {!submitting && <ArrowRight className="w-4 h-4" />}
          </button>
        </div>
      </form>
    </div>
  );
};

const Section = ({ title, icon, children }) => (
  <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
    <div className="px-5 sm:px-6 py-4 border-b border-slate-100 bg-slate-50/70 flex items-center gap-2.5"><span className="text-blue-600">{icon}</span><h2 className="font-bold text-slate-900">{title}</h2></div>
    <div className="p-5 sm:p-6">{children}</div>
  </section>
);

const Field = ({ label, value, onChange, type='text', placeholder='', icon, step, min }) => (
  <label className="block"><span className="block text-xs font-bold text-slate-700 mb-1.5">{label}</span><div className="relative">{icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">{icon}</span>}<input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} step={step} min={min} className={`w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${icon ? 'pl-9' : ''}`} /></div></label>
);

const Select = ({ label, value, onChange, options }) => (
  <label className="block"><span className="block text-xs font-bold text-slate-700 mb-1.5">{label}</span><div className="relative"><select value={value} onChange={(e) => onChange(e.target.value)} className="appearance-none w-full px-3 py-2.5 pr-9 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"><option value="">Select</option>{options.map((o) => <option key={o} value={o}>{o}</option>)}</select><ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" /></div></label>
);

const TextArea = ({ label, value, onChange, placeholder }) => (
  <label className="block mt-4 first:mt-0"><span className="block text-xs font-bold text-slate-700 mb-1.5">{label}</span><textarea rows={3} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-blue-500" /></label>
);

const ReadOnly = ({ label, value }) => <div><span className="block text-xs font-bold text-slate-500 mb-1.5">{label}</span><div className="px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-800">{value || '-'}</div></div>;

export default ApplyJob;
