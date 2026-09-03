import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const API_BASE = 'http://localhost:3001/api';

export async function addRecord(data: {
  exerciseId: number;
  date: string;
  sets?: number;
  reps?: number;
  weight?: number;
  durationMin?: number;
}) {
  const token = useAuthStore.getState().token;
  const response = await axios.post(`${API_BASE}/records`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

export async function getRecords(date?: string) {
  const token = useAuthStore.getState().token;
  const response = await axios.get(`${API_BASE}/records`, {
    headers: { Authorization: `Bearer ${token}` },
    params: date ? { date } : {},
  });
  return response.data;
}
export async function deleteRecord(id: number) {
  const token = useAuthStore.getState().token;
  const response = await axios.delete(`${API_BASE}/records/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}