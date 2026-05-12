import { create } from 'zustand';
import { complaintAPI } from '../services/api';

const useComplaintStore = create((set) => ({
  mapComplaints: [],
  myComplaints:  [],
  loading:       false,
  error:         null,

  fetchMapComplaints: async () => {
    set({ loading: true });
    try {
      const { data } = await complaintAPI.getMapComplaints();
      set({ mapComplaints: data.complaints, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  fetchMyComplaints: async (params) => {
    set({ loading: true });
    try {
      const { data } = await complaintAPI.getMyComplaints(params);
      set({ myComplaints: data.complaints, loading: false });
    } catch {
      set({ loading: false });
    }
  },
}));

export default useComplaintStore;