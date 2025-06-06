import axios from 'axios';
import Constants from 'expo-constants';
import { getItem } from '../utils/authService';

const API_URL = (Constants.expoConfig?.extra as { API_URL: string }).API_URL;

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(async (config) => {
  const token = await getItem('jwtToken');

  console.log("✅ Token JWT récupéré :", token);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ✅ Ajoute ici la méthode pour récupérer les reviews d’un provider
export const getReviewsByProvider = async (providerId: number) => {
  const response = await api.get(`/reviews/provider/${providerId}`);
  return response.data;
};


export const updateUser = async (updateData: any) => {
  return api.put('/users/update', updateData);
};

export const updatePassword = async (passwordData: any) => {
  return api.put('/users/update-password', passwordData);
};
