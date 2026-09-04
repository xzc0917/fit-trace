import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

export async function getExercises() {
  const token = useAuthStore.getState().token;
  const response = await axios.get(`${API_BASE}/exercises`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

export async function createCustomExercise(data: { name: string; category: string }) {
  const token = useAuthStore.getState().token;
  const response = await axios.post(`${API_BASE}/exercises`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}
export async function updateCustomExercise(id: number, data: { name: string; category: string }) {
  const token = useAuthStore.getState().token;
  const response = await axios.put(`${API_BASE}/exercises/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

export async function deleteCustomExercise(id: number) {
  const token = useAuthStore.getState().token;
  const response = await axios.delete(`${API_BASE}/exercises/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}