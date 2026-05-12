import { useState, useEffect, useCallback } from 'react';
import { getAllDrafts, deleteDraft, base64ToFile } from '../utils/offlineStorage';
import { complaintAPI } from '../services/api';
import toast from 'react-hot-toast';

export const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const goOnline  = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);
    window.addEventListener('online',  goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online',  goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  return isOnline;
};

export const useOfflineDrafts = () => {
  const isOnline                    = useOnlineStatus();
  const [drafts, setDrafts]         = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const loadDrafts = useCallback(async () => {
    try {
      const all = await getAllDrafts();
      setDrafts(all);
    } catch (err) {
      console.error('Failed to load drafts:', err);
    }
  }, []);

  useEffect(() => { loadDrafts(); }, [loadDrafts]);

  useEffect(() => {
    if (!isOnline || drafts.length === 0) return;

    const autoSubmit = async () => {
      const pending = drafts.filter((d) => d.status === 'pending');
      if (pending.length === 0) return;

      setSubmitting(true);

      for (const draft of pending) {
        try {
          await complaintAPI.requestOTP();
          toast(
            (t) => (
              <div>
                <p style={{ fontWeight: 600, fontSize: 14 }}>Draft ready to submit</p>
                <p style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>
                  "{draft.title}" — check your email for OTP
                </p>
                <button
                  onClick={() => toast.dismiss(t.id)}
                  style={{ marginTop: 8, fontSize: 12, color: '#4f46e5', fontWeight: 500 }}>
                  Got it
                </button>
              </div>
            ),
            { duration: 10000, icon: '📋' }
          );
        } catch (err) {
          console.error('Auto-submit failed for draft:', draft.id, err);
        }
      }

      setSubmitting(false);
      loadDrafts();
    };

    autoSubmit();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOnline]);

  const submitDraftWithOTP = useCallback(async (draftId, otp) => {
    const draft = drafts.find((d) => d.id === draftId);
    if (!draft) throw new Error('Draft not found');

    const formData = new FormData();
    formData.append('title',       draft.title);
    formData.append('description', draft.description);
    formData.append('category',    draft.category);
    formData.append('latitude',    draft.latitude);
    formData.append('longitude',   draft.longitude);
    formData.append('otp',         otp);

    if (draft.photos?.length > 0) {
      for (const photoData of draft.photos) {
        if (photoData.base64) {
          const file = base64ToFile(photoData);
          formData.append('photos', file);
        }
      }
    }

    await complaintAPI.submit(formData);
    await deleteDraft(draftId);
    await loadDrafts();
  }, [drafts, loadDrafts]);

  const removeDraft = useCallback(async (id) => {
    await deleteDraft(id);
    await loadDrafts();
  }, [loadDrafts]);

  return { drafts, isOnline, submitting, submitDraftWithOTP, removeDraft, loadDrafts };
};