import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const API_BASE = 'http://localhost:3001/api';

export async function getTemplates() {
  const token = useAuthStore.getState().token;
  const response = await axios.get(`${API_BASE}/templates`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

export async function createTemplate(data: {
  name: string;
  exercises: {
    exerciseId: number;
    sets?: number;
    reps?: number;
    weight?: number;
    durationMin?: number;
  }[];
}) {
  const token = useAuthStore.getState().token;
  const response = await axios.post(`${API_BASE}/templates`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

export async function deleteTemplate(id: number) {
  const token = useAuthStore.getState().token;
  const response = await axios.delete(`${API_BASE}/templates/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}
export async function applyTemplate(id: number, date?: string) {
  const token = useAuthStore.getState().token;
  const response = await axios.post(`${API_BASE}/templates/${id}/apply`, { date }, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}
