import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

export async function searchUsers(query: string) {
  const token = useAuthStore.getState().token;
  const response = await axios.get(`${API_BASE}/friends/search`, {
    headers: { Authorization: `Bearer ${token}` },
    params: { q: query },
  });
  return response.data;
}

export async function sendFriendRequest(friendId: string) {
  const token = useAuthStore.getState().token;
  const response = await axios.post(`${API_BASE}/friends/request`, { friendId }, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

export async function acceptFriendRequest(friendId: string) {
  const token = useAuthStore.getState().token;
  const response = await axios.post(`${API_BASE}/friends/accept`, { friendId }, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

export async function getFriends() {
  const token = useAuthStore.getState().token;
  const response = await axios.get(`${API_BASE}/friends`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

export async function getRanking() {
  const token = useAuthStore.getState().token;
  const response = await axios.get(`${API_BASE}/friends/ranking`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}
export async function getFriendRequests() {
  const token = useAuthStore.getState().token;
  const response = await axios.get(`${API_BASE}/friends/requests`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}
export async function likeFriend(friendId: string) {
  const token = useAuthStore.getState().token;
  const response = await axios.post(`${API_BASE}/friends/like/${friendId}`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}
export async function getReceivedLikes() {
  const token = useAuthStore.getState().token;
  const response = await axios.get(`${API_BASE}/friends/likes/received`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}