import axios from 'axios';

const API = axios.create({
  baseURL: 'http://127.0.0.1:5000/api'
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const registerUser      = (data)         => API.post('/auth/register', data);
export const loginUser         = (data)         => API.post('/auth/login', data);
export const createJob         = (data)         => API.post('/jobs/create', data);
export const getAllJobs         = ()             => API.get('/jobs/all');
export const getJob            = (id)           => API.get(`/jobs/${id}`);
export const deleteJob         = (id)           => API.delete(`/jobs/delete/${id}`);
export const uploadCVs         = (jobId, form)  => API.post(`/candidates/upload/${jobId}`, form);
export const getRankings       = (jobId)        => API.get(`/candidates/rankings/${jobId}`);
export const getCandidateDetail = (id)          => API.get(`/candidates/detail/${id}`);
export const getBiasReport     = (jobId)        => API.get(`/bias/report/${jobId}`);

export default API;