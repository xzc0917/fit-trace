import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const API_BASE = 'http://localhost:3001/api';

export async function addWeightLog(data: { date: string; weight: number }) {
  const token = useAuthStore.getState().token;
  const response = await axios.post(`${API_BASE}/weight`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

export async function getWeightLogs() {
  const token = useAuthStore.getState().token;
  const response = await axios.get(`${API_BASE}/weight`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}