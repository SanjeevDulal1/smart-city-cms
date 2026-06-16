import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';
import { Upload, X, CheckCircle, ChevronRight, ChevronLeft, WifiOff } from 'lucide-react';
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
  const [gpsCenter, setGpsCenter] = useState(null);
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
  const errorCode = err.response?.data?.code;
  const errorMsg  = err.response?.data?.message;

  if (errorCode === 'OUTSIDE_KMC') {
    toast.error(
      '📍 Location is outside Kathmandu! Please pin within KMC boundaries.',
      { duration: 5000 }
    );
    setStep(1); // Go back to location step
  } else {
    toast.error(errorMsg || 'Submission failed. Please try again.');
  }
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
    <div className="min-h-screen pt-20 pb-10"
  style={{ background: 'linear-gradient(180deg, #f0f1ff 0%, #f9fafb 30%)' }}>
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
    <div key={s} className="flex items-center flex-1 last:flex-none">
      <div className="flex flex-col items-center">
        <div className={`flex items-center justify-center w-10 h-10 rounded-full text-sm font-bold transition-all duration-300
          ${i < step
            ? 'bg-green-500 text-white shadow-md shadow-green-200'
            : i === step
            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 scale-110'
            : 'bg-white text-gray-400 border-2 border-gray-200'}`}>
          {i < step
            ? <CheckCircle className="w-5 h-5" />
            : <span>{i + 1}</span>}
        </div>
        <p className={`text-xs font-semibold mt-1.5 transition-colors
          ${i === step ? 'text-indigo-600' : i < step ? 'text-green-600' : 'text-gray-400'}`}>
          {s}
        </p>
      </div>
      {i < STEPS.length - 1 && (
        <div className={`flex-1 h-0.5 mx-2 mb-4 rounded-full transition-all duration-500
          ${i < step ? 'bg-green-400' : 'bg-gray-200'}`}
        />
      )}
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
            <h2 className="text-lg font-bold text-gray-900 mb-1">
               What type of issue is it?
            </h2>
            <p className="text-sm text-gray-500 mb-5">
             Select the category that best describes the problem
    </p>
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {CATEGORIES.map((cat) => {
        const emojis = {
          live_wire:'⚡', gas_leak:'💨', road_collapse:'🛣️',
          sewage_overflow:'🚰', flood:'🌊', pothole:'🕳️',
          broken_light:'💡', garbage:'🗑️', broken_footpath:'🚶',
          noise:'🔊', other:'📌',
        };
        const isSelected = category === cat.value;
        return (
          <button key={cat.value} onClick={() => setCategory(cat.value)}
            className={`relative p-4 rounded-2xl border-2 text-left transition-all duration-200 group
              ${isSelected
                ? 'border-indigo-500 bg-indigo-50 shadow-md shadow-indigo-100'
                : 'border-gray-100 hover:border-indigo-200 bg-white hover:shadow-sm'}`}>

            {/* Selected checkmark */}
            {isSelected && (
              <div className="absolute top-2 right-2 w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}

            {/* Icon */}
            <div className="w-12 h-12 rounded-2xl mb-3 flex items-center justify-center text-2xl transition-transform group-hover:scale-110"
              style={{ backgroundColor: cat.color + '18' }}>
              {emojis[cat.value]}
            </div>

            <p className={`text-sm font-semibold transition-colors
              ${isSelected ? 'text-indigo-700' : 'text-gray-700'}`}>
              {cat.label}
            </p>

            {/* Bottom color bar */}
            <div className={`absolute bottom-0 left-0 right-0 h-0.5 rounded-b-2xl transition-all duration-200
              ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'}`}
              style={{ backgroundColor: cat.color }}
            />
          </button>
        );
      })}
    </div>
  </div>
)}

{step === 1 && (
  <div className="animate-fade-in">
    {/* KMC boundary notice */}
<div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-xl mb-3">
  <span className="text-lg flex-shrink-0">🗺️</span>
  <p className="text-xs text-blue-700 font-medium">
    Only accepts complaints within{' '}
    <strong>Kathmandu Metropolitan City</strong> boundaries.
  </p>
</div>
    <h2 className="text-lg font-bold text-gray-900 mb-1">
      Pin the exact location
    </h2>
    <p className="text-sm text-gray-500 mb-4">
      Use GPS or tap anywhere on the map to place your report pin
    </p>

    {/* GPS button */}
    <button
      onClick={() => {
        if (!navigator.geolocation) {
          toast.error('GPS not supported on this device');
          return;
        }
        toast.loading('Getting your location...', { id: 'gps' });
        navigator.geolocation.getCurrentPosition(
          (pos) => {
  const coords = {
    lat: pos.coords.latitude,
    lng: pos.coords.longitude,
  };

  // In development, if outside KMC use Kathmandu center
  const outsideKMC =
    coords.lat < 27.62 || coords.lat > 27.81 ||
    coords.lng < 85.23 || coords.lng > 85.42;

  if (outsideKMC) {
    const kathmanduCenter = { lat: 27.7172, lng: 85.3240 };
    setLocation(kathmanduCenter);
    setGpsCenter(kathmanduCenter);
    toast.success(
      '📍 You are outside KMC — using Kathmandu center for testing!',
      { id: 'gps', duration: 4000 }
    );
    return;
  }

  setLocation(coords);
  setGpsCenter(coords);
  toast.success('Location found!', { id: 'gps' });
},
          (err) => {
            toast.error(
              err.code === 1
                ? 'Location permission denied. Please tap the map manually.'
                : 'Could not get location. Tap the map instead.',
              { id: 'gps' }
            );
          },
          { enableHighAccuracy: true, timeout: 10000 }
        );
      }}
      className="w-full mb-4 flex items-center justify-center gap-3 py-4 rounded-2xl font-semibold text-base transition-all duration-200 border-2 border-indigo-200 bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 hover:from-indigo-100 hover:to-purple-100 hover:border-indigo-400 hover:shadow-md active:scale-98">
      <span className="text-2xl">📍</span>
      Use my current GPS location
      <span className="ml-auto bg-indigo-100 text-indigo-600 text-xs font-bold px-2.5 py-1 rounded-full">
        Recommended
      </span>
    </button>

    <div className="flex items-center gap-3 mb-4">
      <div className="flex-1 h-px bg-gray-200" />
      <span className="text-xs text-gray-400 font-medium">or tap on the map</span>
      <div className="flex-1 h-px bg-gray-200" />
    </div>

    {/* Map */}
    <div className="rounded-2xl overflow-hidden shadow-md border border-gray-100"
      style={{ height: '380px' }}>
      <MapContainer
        center={gpsCenter ? [gpsCenter.lat, gpsCenter.lng] : [27.7172, 85.3240]}
        zoom={gpsCenter ? 17 : 14}
        key={gpsCenter ? `${gpsCenter.lat}-${gpsCenter.lng}` : 'default'}
        style={{ height: '100%', width: '100%' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <LocationPicker onSelect={setLocation} />
        {location && (
          <Marker position={[location.lat, location.lng]} icon={userPin} />
        )}
      </MapContainer>
    </div>

    {/* Status */}
    {location ? (
      <div className="mt-3 p-3.5 bg-green-50 border border-green-200 rounded-2xl flex items-center gap-3">
        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
          <CheckCircle className="w-4 h-4 text-green-600" />
        </div>
        <div>
          <p className="text-sm font-semibold text-green-800">Location pinned!</p>
          <p className="text-xs text-green-600 font-mono">
            {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
          </p>
        </div>
      </div>
    ) : (
      <div className="mt-3 p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-3">
        <span className="text-xl flex-shrink-0">👆</span>
        <p className="text-sm text-amber-700 font-medium">
          No location selected yet — use GPS or tap on the map above
        </p>
      </div>
    )}
  </div>
)}

          {/* ── Step 2: Details ── */}
          {step === 2 && (
  <div className="animate-fade-in space-y-5">
    <div>
      <h2 className="text-lg font-bold text-gray-900 mb-1">Describe the issue</h2>
      <p className="text-sm text-gray-500">
        The more detail you provide, the faster it gets resolved
      </p>
    </div>

    {/* Title */}
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="label mb-0">Title</label>
        <span className={`text-xs font-medium ${title.length > 80 ? 'text-amber-500' : 'text-gray-400'}`}>
          {title.length}/100
        </span>
      </div>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="input-field"
        placeholder="e.g. Large pothole near Baneshwor bus stop"
        maxLength={100}
        autoComplete="off"
      />
      {title.length > 0 && title.length < 5 && (
        <p className="text-xs text-red-500 mt-1">Title must be at least 5 characters</p>
      )}
    </div>

    {/* Description */}
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="label mb-0">Description</label>
        <span className={`text-xs font-medium
          ${description.length === 0 ? 'text-gray-400'
            : description.length < 20 ? 'text-red-500'
            : 'text-green-600'}`}>
          {description.length}/1000
          {description.length > 0 && description.length < 20 && ' (min 20)'}
        </span>
      </div>
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="input-field resize-none"
        rows={4}
        placeholder="Describe the issue in detail — nearby landmarks, severity, how long it has been there, any safety concerns..."
        maxLength={1000}
        autoComplete="off"
      />
      {/* Tips */}
      {description.length === 0 && (
        <div className="mt-2 flex gap-2 flex-wrap">
          {['Near a school/hospital', 'Causing accidents', 'Been here for weeks'].map((tip) => (
            <button key={tip} type="button"
              onClick={() => setDescription((prev) => prev + (prev ? ' ' : '') + tip)}
              className="text-xs bg-gray-100 hover:bg-indigo-50 hover:text-indigo-600 text-gray-500 px-2.5 py-1 rounded-full transition-all border border-gray-200 hover:border-indigo-200">
              + {tip}
            </button>
          ))}
        </div>
      )}
    </div>

    {/* Photos */}
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="label mb-0">
          Photos
          <span className="text-red-500 ml-1">*</span>
        </label>
        <span className="text-xs text-gray-400">{photos.length}/3 uploaded</span>
      </div>

      <div {...getRootProps()}
        className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200
          ${isDragActive
            ? 'border-indigo-400 bg-indigo-50 scale-101'
            : photos.length >= 3
            ? 'border-green-300 bg-green-50'
            : 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/50'}`}>
        <input {...getInputProps()} />

        {photos.length >= 3 ? (
          <div className="flex flex-col items-center gap-2">
            <CheckCircle className="w-10 h-10 text-green-500" />
            <p className="text-sm font-semibold text-green-700">Maximum photos added</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors
              ${isDragActive ? 'bg-indigo-100' : 'bg-gray-100'}`}>
              <Upload className={`w-7 h-7 ${isDragActive ? 'text-indigo-500' : 'text-gray-400'}`} />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-700">
                {isDragActive ? 'Drop your photos here' : 'Upload evidence photos'}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                JPEG, PNG, WebP · Max 5MB each · Up to 3 photos
              </p>
            </div>
            <span className="text-xs bg-indigo-100 text-indigo-600 font-semibold px-3 py-1 rounded-full">
              Browse files
            </span>
          </div>
        )}
      </div>

      {/* Photo previews */}
      {photos.length > 0 && (
        <div className="flex gap-3 mt-3 flex-wrap">
          {photos.map((p, i) => (
            <div key={i} className="relative group">
              <img
                src={URL.createObjectURL(p)}
                alt={`Evidence ${i + 1}`}
                className="w-24 h-24 object-cover rounded-2xl border-2 border-gray-100 shadow-sm"
              />
              <div className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button onClick={() => removePhoto(i)}
                  className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                <CheckCircle className="w-3 h-3 text-white" />
              </div>
            </div>
          ))}
          {photos.length < 3 && (
            <div {...getRootProps()}
              className="w-24 h-24 rounded-2xl border-2 border-dashed border-gray-200 hover:border-indigo-300 flex items-center justify-center cursor-pointer transition-all hover:bg-indigo-50">
              <input {...getInputProps()} />
              <span className="text-2xl text-gray-300">+</span>
            </div>
          )}
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