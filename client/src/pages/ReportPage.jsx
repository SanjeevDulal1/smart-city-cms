import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';
import {
  MapPin, Upload, X, CheckCircle,
  ChevronRight, ChevronLeft, WifiOff,
} from 'lucide-react';
import { complaintAPI } from '../services/api';
import { CATEGORIES } from '../utils/helpers';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import { useOnlineStatus } from '../hooks/useOffline';
import { saveDraft, fileToBase64 } from '../utils/offlineStorage';

// ── Leaflet pin icon ──────────────────────────────────────────
const userPin = L.divIcon({
  className: '',
  html: `<div style="
    width:20px;height:20px;
    background:#4f46e5;
    border:3px solid white;
    border-radius:50%;
    box-shadow:0 0 0 6px rgba(99,102,241,0.25);
  "></div>`,
  iconSize:   [20, 20],
  iconAnchor: [10, 10],
});

// ── Map click handler ─────────────────────────────────────────
const LocationPicker = ({ onSelect }) => {
  useMapEvents({ click: (e) => onSelect(e.latlng) });
  return null;
};

const STEPS = ['Category', 'Location', 'Details', 'Verify'];

// ── Main component ────────────────────────────────────────────
const ReportPage = () => {
  const [step, setStep]               = useState(0);
  const [category, setCategory]       = useState('');
  const [location, setLocation]       = useState(null);
  const [title, setTitle]             = useState('');
  const [description, setDescription] = useState('');
  const [photos, setPhotos]           = useState([]);
  const [otp, setOtp]                 = useState('');
  const [otpSent, setOtpSent]         = useState(false);
  const [loading, setLoading]         = useState(false);

  // ── Offline support ─────────────────────────────────────────
  const isOnline = useOnlineStatus();

  const saveAsDraft = async () => {
    try {
      const photoData = await Promise.all(photos.map((p) => fileToBase64(p)));
      await saveDraft({
        id:          `draft_${Date.now()}`,
        category,
        title,
        description,
        latitude:    location?.lat  || null,
        longitude:   location?.lng  || null,
        photos:      photoData,
        createdAt:   new Date().toISOString(),
      });
      toast.success('Draft saved! Will submit when connection returns.', {
        duration: 4000, icon: '💾',
      });
    } catch (err) {
      toast.error('Failed to save draft');
      console.error(err);
    }
  };

  const navigate = useNavigate();

  // ── Photo dropzone ──────────────────────────────────────────
  const onDrop = useCallback((accepted) => {
    if (photos.length + accepted.length > 3) {
      toast.error('Maximum 3 photos allowed');
      return;
    }
    setPhotos((prev) => [...prev, ...accepted.slice(0, 3 - prev.length)]);
  }, [photos]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept:   { 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] },
    maxFiles: 3,
    maxSize:  5 * 1024 * 1024,
  });

  const removePhoto = (i) => setPhotos((prev) => prev.filter((_, idx) => idx !== i));

  // ── OTP ─────────────────────────────────────────────────────
  const sendOTP = async () => {
    setLoading(true);
    try {
      await complaintAPI.requestOTP();
      setOtpSent(true);
      toast.success('OTP sent to your email!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  // ── Submit ───────────────────────────────────────────────────
  const submit = async () => {
    if (!otp || otp.length !== 6) {
      toast.error('Please enter the 6-digit OTP');
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title',       title);
      formData.append('description', description);
      formData.append('category',    category);
      formData.append('latitude',    location.lat);
      formData.append('longitude',   location.lng);
      formData.append('otp',         otp);
      photos.forEach((p) => formData.append('photos', p));

      await complaintAPI.submit(formData);
      toast.success('Complaint submitted successfully!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  // ── Step validation ──────────────────────────────────────────
  const canNext = () => {
    if (step === 0) return !!category;
    if (step === 1) return !!location;
    if (step === 2) return title.length >= 5 && description.length >= 20 && photos.length > 0;
    return true;
  };

  // ── UI ───────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-10">
      <div className="max-w-2xl mx-auto px-4">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Report an issue</h1>
          <p className="text-gray-500 mt-1">
            Help us improve Kathmandu by reporting city problems
          </p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center mb-8">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center flex-1">
              <div className={`flex items-center justify-center w-9 h-9 rounded-full text-sm font-semibold transition-all
                ${i < step   ? 'bg-green-500 text-white' :
                  i === step  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' :
                                'bg-gray-200 text-gray-500'}`}>
                {i < step ? <CheckCircle className="w-5 h-5" /> : i + 1}
              </div>
              <div className="flex-1 mx-2">
                <p className={`text-xs font-medium ${i === step ? 'text-indigo-600' : 'text-gray-400'}`}>{s}</p>
                {i < STEPS.length - 1 && (
                  <div className={`h-0.5 mt-1 rounded-full transition-all ${i < step ? 'bg-green-400' : 'bg-gray-200'}`} />
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Form card */}
        <div className="card p-6 shadow-sm">

          {/* ── Offline warning ── */}
          {!isOnline && (
            <div className="mb-5 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3 animate-fade-in">
              <WifiOff className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-800">You are offline</p>
                <p className="text-xs text-amber-600 mt-0.5">
                  Fill the form and tap "Save draft". Your complaint will be submitted automatically when your connection returns.
                </p>
              </div>
            </div>
          )}

          {/* ── Step 0: Category ── */}
          {step === 0 && (
            <div className="animate-fade-in">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                What type of issue is it?
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {CATEGORIES.map((cat) => (
                  <button key={cat.value} onClick={() => setCategory(cat.value)}
                    className={`p-4 rounded-xl border-2 text-left transition-all duration-200
                      ${category === cat.value
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-100 hover:border-gray-300 bg-white'}`}>
                    <div className="w-8 h-8 rounded-lg mb-2 flex items-center justify-center"
                      style={{ backgroundColor: cat.color + '20' }}>
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                    </div>
                    <p className={`text-sm font-medium
                      ${category === cat.value ? 'text-indigo-700' : 'text-gray-700'}`}>
                      {cat.label}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Step 1: Location ── */}
          {step === 1 && (
            <div className="animate-fade-in">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Pin the exact location
              </h2>
              <p className="text-sm text-gray-500 mb-4 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-indigo-500" />
                Click anywhere on the map to place your report pin
              </p>
              <div style={{ height: '400px' }} className="rounded-2xl overflow-hidden border border-gray-100">
                <MapContainer center={[27.7172, 85.3240]} zoom={14}
                  style={{ height: '100%', width: '100%' }}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <LocationPicker onSelect={setLocation} />
                  {location && (
                    <Marker position={[location.lat, location.lng]} icon={userPin} />
                  )}
                </MapContainer>
              </div>
              {location && (
                <div className="mt-3 p-3 bg-green-50 rounded-xl flex items-center gap-2 text-sm text-green-700">
                  <CheckCircle className="w-4 h-4 flex-shrink-0" />
                  Location pinned: {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
                </div>
              )}
            </div>
          )}

          {/* ── Step 2: Details ── */}
          {step === 2 && (
            <div className="animate-fade-in space-y-5">
              <h2 className="text-lg font-semibold text-gray-900">Describe the issue</h2>

              <div>
                <label className="label">Title</label>
                <input value={title} onChange={(e) => setTitle(e.target.value)}
                  className="input-field"
                  placeholder="e.g. Large pothole near Baneshwor bus stop"
                  maxLength={100} />
                <p className="text-xs text-gray-400 mt-1">{title.length}/100</p>
              </div>

              <div>
                <label className="label">Description</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)}
                  className="input-field resize-none" rows={4}
                  placeholder="Describe the issue in detail — location landmarks, severity, how long it has been there..."
                  maxLength={1000} />
                <p className="text-xs text-gray-400 mt-1">
                  {description.length}/1000 (min 20 characters)
                </p>
              </div>

              <div>
                <label className="label">Photos (required, max 3)</label>
                <div {...getRootProps()}
                  className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all
                    ${isDragActive
                      ? 'border-indigo-400 bg-indigo-50'
                      : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'}`}>
                  <input {...getInputProps()} />
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">
                    {isDragActive ? 'Drop photos here' : 'Drag & drop or click to upload'}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">JPEG, PNG, WebP · Max 5MB each</p>
                </div>
                {photos.length > 0 && (
                  <div className="flex gap-3 mt-3 flex-wrap">
                    {photos.map((p, i) => (
                      <div key={i} className="relative group">
                        <img src={URL.createObjectURL(p)} alt=""
                          className="w-24 h-24 object-cover rounded-xl border border-gray-100" />
                        <button onClick={() => removePhoto(i)}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Step 3: OTP Verify ── */}
          {step === 3 && (
            <div className="animate-fade-in">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Verify your submission
              </h2>
              <p className="text-sm text-gray-500 mb-6">
                We send a one-time code to your email to prevent spam submissions.
              </p>

              {/* Summary */}
              <div className="bg-gray-50 rounded-xl p-4 mb-6 space-y-2 text-sm">
                {[
                  ['Category', CATEGORIES.find((c) => c.value === category)?.label],
                  ['Title',    title],
                  ['Location', location ? `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` : '—'],
                  ['Photos',   `${photos.length} attached`],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between">
                    <span className="text-gray-500">{k}</span>
                    <span className="font-medium text-gray-900 truncate ml-4">{v}</span>
                  </div>
                ))}
              </div>

              {!otpSent ? (
                <button onClick={sendOTP} disabled={loading} className="btn-primary w-full py-3">
                  {loading
                    ? <LoadingSpinner size="sm" />
                    : 'Send verification code to my email'}
                </button>
              ) : (
                <div className="space-y-4">
                  <div className="bg-blue-50 rounded-xl p-3 text-sm text-blue-700 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 flex-shrink-0" />
                    OTP sent! Check your email inbox.
                  </div>
                  <div>
                    <label className="label">Enter 6-digit OTP</label>
                    <input value={otp} onChange={(e) => setOtp(e.target.value)}
                      className="input-field text-center text-2xl font-bold tracking-widest"
                      placeholder="000000" maxLength={6} />
                  </div>
                  <button onClick={submit} disabled={loading} className="btn-primary w-full py-3">
                    {loading ? <LoadingSpinner size="sm" /> : 'Submit complaint'}
                  </button>
                  <button onClick={sendOTP} disabled={loading}
                    className="text-sm text-indigo-600 hover:underline w-full text-center">
                    Resend OTP
                  </button>
                </div>
              )}
            </div>
          )}

        </div>

        {/* ── Navigation buttons ── */}
        <div className="flex justify-between mt-6">
          <button onClick={() => setStep((s) => s - 1)} disabled={step === 0}
            className="btn-secondary disabled:opacity-40">
            <ChevronLeft className="w-4 h-4" /> Back
          </button>

          <div className="flex gap-2">
            {/* Save draft button — only shown when offline and form has some data */}
            {!isOnline && category && (
              <button onClick={saveAsDraft}
                className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-medium px-4 py-2.5 rounded-xl transition-all text-sm shadow-sm">
                <span>💾</span> Save draft
              </button>
            )}

            {step < 3 && (
              <button onClick={() => setStep((s) => s + 1)} disabled={!canNext()}
                className="btn-primary disabled:opacity-40">
                Next <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ReportPage;