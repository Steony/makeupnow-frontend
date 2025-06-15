// utils/AuthContext.tsx

import { jwtDecode } from 'jwt-decode';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { getItem, removeItem } from './authService';

interface User {
  id: string;
  email: string;
  role: string;
  avatar?: string;
  name?: string;
}

interface AuthContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  refreshUser: () => Promise<void>;
  loadingUser: boolean;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  setCurrentUser: () => {},
  refreshUser: async () => {},
  loadingUser: true,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // Permet d'actualiser le user depuis n'importe où (login/logout)
  const refreshUser = useCallback(async () => {
    setLoadingUser(true);
    const token = await getItem('jwtToken');
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        const currentTime = Date.now() / 1000;

        if (decoded.exp && decoded.exp < currentTime) {
          console.warn('⏰ Token expiré, suppression');
          await removeItem('jwtToken');
          setCurrentUser(null);
          setLoadingUser(false);
          return;
        }

        // Normalisation du rôle
        const roleRaw = decoded.role || 'CLIENT';
        const roleNormalized = roleRaw.startsWith('ROLE_') ? roleRaw.substring(5) : roleRaw;

        setCurrentUser({
          id: decoded.id.toString(),
          email: decoded.sub,
          role: roleNormalized.toUpperCase(),
          avatar: decoded.avatar,
          name: decoded.firstname || decoded.given_name || decoded.name || 'Utilisateur',
        });
      } catch (e) {
        console.error('Erreur décodage JWT', e);
        await removeItem('jwtToken');
        setCurrentUser(null);
      }
    } else {
      setCurrentUser(null);
    }
    setLoadingUser(false);
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  return (
    <AuthContext.Provider value={{ currentUser, setCurrentUser, refreshUser, loadingUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
