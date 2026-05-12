import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 15000,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  register:      (data) => API.post('/auth/register', data),
  verifyEmail:   (data) => API.post('/auth/verify-email', data),
  login:         (data) => API.post('/auth/login', data),
  adminLogin:    (data) => API.post('/auth/admin/login', data),
  getMe:         ()     => API.get('/auth/me'),
  forgotPassword:(data) => API.post('/auth/forgot-password', data),
  resetPassword: (data) => API.post('/auth/reset-password', data),
};

export const complaintAPI = {
  getMapComplaints: ()       => API.get('/complaints/map'),
  getMyComplaints:  (params) => API.get('/complaints/mine', { params }),
  getById:          (id)     => API.get(`/complaints/${id}`),
  requestOTP:       ()       => API.post('/complaints/request-otp'),
  submit:           (data)   => API.post('/complaints/submit', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  upvote:           (id)     => API.post(`/complaints/${id}/upvote`),
};

export const wardAPI = {
  getAll:    ()       => API.get('/wards'),
  getStats:  (id)     => API.get(`/wards/${id}/stats`),
  create:    (data)   => API.post('/wards', data),
  update:    (id, d)  => API.put(`/wards/${id}`, d),
  remove:    (id)     => API.delete(`/wards/${id}`),
};

export const adminAPI = {
  getDashboard:       ()       => API.get('/admin/dashboard'),
  getComplaints:      (params) => API.get('/admin/complaints', { params }),
  getAllComplaints:    (params) => API.get('/admin/complaints/all', { params }),
  updateStatus:       (id, d)  => API.put(`/admin/complaints/${id}/status`, d),
  createWardAdmin:    (data)   => API.post('/admin/ward-admin', data),
  getAdmins:          ()       => API.get('/admin/admins'),
};

export default API;