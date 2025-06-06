// utils/AuthContext.tsx

import { jwtDecode } from 'jwt-decode';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { getItem } from './authService';

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
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  setCurrentUser: () => {},
  refreshUser: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Permet d'actualiser le user depuis n'importe où (login/logout)
 const refreshUser = useCallback(async () => {
  const token = await getItem('jwtToken');
  if (token) {
    try {
      const decoded: any = jwtDecode(token);
      console.log('Decoded JWT:', decoded);  // <-- ajoute ça pour debugger
      setCurrentUser({
        id: decoded.id,
        email: decoded.sub,
        role: decoded.role,
        avatar: decoded.avatar,
        name: decoded.firstname || decoded.given_name || decoded.name ||  'Utilisateur',

      });
    } catch (e) {
      console.error('Erreur décodage JWT', e);
      setCurrentUser(null);
    }
  } else {
    setCurrentUser(null);
  }
}, []);


  useEffect(() => {
    refreshUser();
    // Si tu veux forcer l'update en cas de changement de token, 
    // tu pourrais utiliser un event listener custom ici.
  }, [refreshUser]);

  return (
    <AuthContext.Provider value={{ currentUser, setCurrentUser, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
