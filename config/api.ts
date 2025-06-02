// config/api.ts
import axios from 'axios';
import Constants from 'expo-constants';
import { getItem } from '../utils/authService';

// Récupère l’URL de l’API depuis app.json (expo.extra.API_URL)
const API_URL = (Constants.expoConfig?.extra as { API_URL: string }).API_URL;

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(async (config) => {
  const token = await getItem('jwtToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
