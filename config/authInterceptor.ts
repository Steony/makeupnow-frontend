// config/authInterceptor.ts
import { getItem } from '../utils/authService';
import { api } from './api';

api.interceptors.request.use(async (config) => {
  const token = await getItem('jwtToken');

  // ⛔ N'ajoute pas le token sur /users/login ni /users/register
  if (
    config.url?.includes('/users/login') ||
    config.url?.includes('/users/register')
  ) {
    return config;
  }

  if (token) {
    console.log("✅ Token JWT injecté dans les headers :", token);
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});
