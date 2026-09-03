import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const API_BASE = 'http://localhost:3001/api';

// 获取当前用户资料
export async function getProfile(token: string) {
  const response = await axios.get(`${API_BASE}/user/profile`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

// 更新用户资料
export async function updateProfile(token: string, data: { nickname?: string; height?: number; weight?: number; age?: number; gender?: string }) {
  const response = await axios.put(`${API_BASE}/user/profile`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}