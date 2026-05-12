import { create } from 'zustand';
import { authAPI } from '../services/api';

const useAuthStore = create((set, get) => ({
  user:      JSON.parse(localStorage.getItem('user'))  || null,
  admin:     JSON.parse(localStorage.getItem('admin')) || null,
  token:     localStorage.getItem('token') || null,
  loading:   false,
  error:     null,

  loginUser: async (credentials) => {
    set({ loading: true, error: null });
    try {
      const { data } = await authAPI.login(credentials);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      set({ token: data.token, user: data.user, loading: false });
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed';
      set({ error: msg, loading: false });
      return { success: false, message: msg };
    }
  },

  loginAdmin: async (credentials) => {
    set({ loading: true, error: null });
    try {
      const { data } = await authAPI.adminLogin(credentials);
      localStorage.setItem('token', data.token);
      localStorage.setItem('admin', JSON.stringify(data.admin));
      set({ token: data.token, admin: data.admin, loading: false });
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed';
      set({ error: msg, loading: false });
      return { success: false, message: msg };
    }
  },

  logout: () => {
    localStorage.clear();
    set({ user: null, admin: null, token: null });
    window.location.href = '/login';
  },

  isUser:       () => !!get().user && !!get().token,
  isAdmin:      () => !!get().admin && !!get().token,
  isSuperAdmin: () => get().admin?.role === 'super_admin',
}));

export default useAuthStore;