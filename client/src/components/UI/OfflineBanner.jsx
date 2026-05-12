import { useState, useEffect } from 'react';
import { Wifi, WifiOff, X, FileText, Send, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useOnlineStatus, useOfflineDrafts } from '../../hooks/useOffline';
import { complaintAPI } from '../../services/api';

const OfflineBanner = () => {
  const isOnline                                          = useOnlineStatus();
  const { drafts, submitDraftWithOTP, removeDraft }       = useOfflineDrafts();
  const [showDrafts, setShowDrafts]                       = useState(false);
  const [otpStates, setOtpStates]                         = useState({});
  const [otpSent, setOtpSent]                             = useState({});
  const [submitting, setSubmitting]                       = useState({});
  const [justCameOnline, setJustCameOnline]               = useState(false);

 useEffect(() => {
  if (isOnline && drafts.length > 0) {
    setJustCameOnline(true);
    setShowDrafts(true);
    const t = setTimeout(() => setJustCameOnline(false), 4000);
    return () => clearTimeout(t);
  }
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [isOnline]);

  const requestOTP = async (draftId) => {
    try {
      await complaintAPI.requestOTP();
      setOtpSent((prev) => ({ ...prev, [draftId]: true }));
      toast.success('OTP sent to your email!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP');
    }
  };

  const handleSubmit = async (draftId) => {
    const otp = otpStates[draftId];
    if (!otp || otp.length !== 6) {
      toast.error('Enter the 6-digit OTP first');
      return;
    }
    setSubmitting((prev) => ({ ...prev, [draftId]: true }));
    try {
      await submitDraftWithOTP(draftId, otp);
      toast.success('Draft submitted successfully!');
      setOtpStates((prev)  => { const n = {...prev};  delete n[draftId]; return n; });
      setOtpSent((prev)    => { const n = {...prev};  delete n[draftId]; return n; });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed');
    } finally {
      setSubmitting((prev) => ({ ...prev, [draftId]: false }));
    }
  };

  const CATEGORY_LABELS = {
    live_wire:'Live Wire', gas_leak:'Gas Leak', road_collapse:'Road Collapse',
    sewage_overflow:'Sewage Overflow', flood:'Flood', pothole:'Pothole',
    broken_light:'Broken Light', garbage:'Garbage',
    broken_footpath:'Broken Footpath', noise:'Noise', other:'Other',
  };

  return (
    <>
      {/* Offline banner */}
      {!isOnline && (
        <div className="fixed top-16 left-0 right-0 z-40 animate-slide-up">
          <div className="bg-amber-500 text-white px-4 py-2.5 flex items-center justify-center gap-3 shadow-lg">
            <WifiOff className="w-4 h-4 flex-shrink-0" />
            <p className="text-sm font-medium">
              You're offline — complaint forms will be saved as drafts and submitted when connection returns
            </p>
          </div>
        </div>
      )}

      {/* Back online banner */}
      {isOnline && justCameOnline && drafts.length > 0 && (
        <div className="fixed top-16 left-0 right-0 z-40 animate-slide-up">
          <div className="bg-green-500 text-white px-4 py-2.5 flex items-center justify-center gap-3 shadow-lg">
            <Wifi className="w-4 h-4 flex-shrink-0" />
            <p className="text-sm font-medium">
              Connection restored! You have {drafts.length} saved draft{drafts.length > 1 ? 's' : ''} ready to submit.
            </p>
            <button onClick={() => setShowDrafts(true)}
              className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg text-xs font-semibold transition-all">
              View drafts
            </button>
          </div>
        </div>
      )}

      {/* Drafts floating button */}
      {isOnline && drafts.length > 0 && !showDrafts && (
        <button onClick={() => setShowDrafts(true)}
          className="fixed bottom-6 right-6 z-40 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl shadow-lg px-4 py-3 flex items-center gap-2 transition-all hover:shadow-xl animate-slide-up">
          <FileText className="w-5 h-5" />
          <span className="text-sm font-semibold">{drafts.length} saved draft{drafts.length > 1 ? 's' : ''}</span>
          <span className="bg-amber-400 text-amber-900 text-xs font-bold px-1.5 py-0.5 rounded-full">
            {drafts.length}
          </span>
        </button>
      )}

      {/* Drafts panel */}
      {showDrafts && drafts.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-hidden animate-slide-up">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Saved drafts</h3>
                <p className="text-sm text-gray-500">{drafts.length} complaint{drafts.length > 1 ? 's' : ''} ready to submit</p>
              </div>
              <button onClick={() => setShowDrafts(false)}
                className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100 text-gray-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Draft list */}
            <div className="overflow-y-auto max-h-[60vh] p-4 space-y-4">
              {drafts.map((draft) => (
                <div key={draft.id} className="border border-gray-100 rounded-2xl p-4 bg-gray-50">
                  {/* Draft info */}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{draft.title || 'Untitled draft'}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {CATEGORY_LABELS[draft.category] || draft.category} ·{' '}
                        {new Date(draft.createdAt).toLocaleDateString()}
                      </p>
                      {draft.description && (
                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">{draft.description}</p>
                      )}
                    </div>
                    <button onClick={() => removeDraft(draft.id)}
                      className="text-gray-400 hover:text-red-500 p-1 rounded-lg hover:bg-red-50 transition-all ml-2 flex-shrink-0">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Submit flow */}
                  {!otpSent[draft.id] ? (
                    <button onClick={() => requestOTP(draft.id)}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-2.5 rounded-xl transition-all flex items-center justify-center gap-2">
                      <Send className="w-4 h-4" />
                      Send OTP to submit
                    </button>
                  ) : (
                    <div className="space-y-2">
                      <div className="bg-blue-50 rounded-xl p-2.5 text-xs text-blue-700 text-center">
                        OTP sent to your email — enter it below
                      </div>
                      <div className="flex gap-2">
                        <input
                          value={otpStates[draft.id] || ''}
                          onChange={(e) => setOtpStates((prev) => ({ ...prev, [draft.id]: e.target.value }))}
                          className="input-field text-center font-bold tracking-widest text-lg flex-1"
                          placeholder="000000" maxLength={6}
                        />
                        <button
                          onClick={() => handleSubmit(draft.id)}
                          disabled={submitting[draft.id]}
                          className="bg-green-500 hover:bg-green-600 text-white px-4 rounded-xl font-medium text-sm transition-all disabled:opacity-50 flex items-center gap-1">
                          {submitting[draft.id] ? (
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          ) : (
                            <><Send className="w-4 h-4" /> Submit</>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default OfflineBanner;