import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const API_BASE = 'http://localhost:3001/api';

export async function addFoodEntry(data: {
  date: string;
  mealType: string;
  foodName: string;
  quantity: number;
  unit: string;
}) {
  const token = useAuthStore.getState().token;
  const response = await axios.post(`${API_BASE}/food`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

export async function getFoodEntries(date?: string) {
  const token = useAuthStore.getState().token;
  const response = await axios.get(`${API_BASE}/food`, {
    headers: { Authorization: `Bearer ${token}` },
    params: date ? { date } : {},
  });
  return response.data;
}