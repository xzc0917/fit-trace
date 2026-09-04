import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

export async function getHistory(from?: string, to?: string) {
  const token = useAuthStore.getState().token;
  const response = await axios.get(`${API_BASE}/history`, {
    headers: { Authorization: `Bearer ${token}` },
    params: { from, to },
  });
  return response.data;
}