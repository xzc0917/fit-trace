import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

// 注册
export async function registerUser(data: { email: string; password: string; nickname: string }) {
  const response = await axios.post(`${API_BASE}/auth/register`, data);
  return response.data; // { token, user }
}

// 登录
export async function loginUser(data: { email: string; password: string }) {
  const response = await axios.post(`${API_BASE}/auth/login`, data);
  return response.data; // { token, user }
}

// 获取当前用户信息（需要 token）
export async function getCurrentUser(token: string) {
  const response = await axios.get(`${API_BASE}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}