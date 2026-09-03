import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const API_BASE = 'http://localhost:3001/api';

export async function getSummary(date?: string) {
  const token = useAuthStore.getState().token;
  const response = await axios.get(`${API_BASE}/summary`, {
    headers: { Authorization: `Bearer ${token}` },
    params: date ? { date } : {},
  });
  return response.data;
}