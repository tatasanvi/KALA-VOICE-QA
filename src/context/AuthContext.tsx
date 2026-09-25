// =============================================================================
// KALA VOICE QA — Contexte d'Authentification & Session (RBAC)
// Gestion de la session persistante, synchronisation JWT et rôles applicatifs
// =============================================================================
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '../types';
import { INITIAL_USERS } from '../data/initialData';
import { authApi, tokenStore } from '../services/apiClient';
import { storageService } from '../services/storageService';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  role: UserRole | null;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateUserProfile: (updates: Partial<User>) => void;
  switchRole: (newRole: UserRole) => void;
  hasRole: (allowedRoles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Comptes utilisateurs pré-configurés pour la plateforme (password: kala2024!)
const DEMO_CREDENTIALS: Record<string, UserRole> = {
  'a.moreau@kalavoice.ai': 'ADMIN',
  'c.delattre@kalavoice.ai': 'QA_MANAGER',
  's.laurent@kalavoice.ai': 'MANAGER',
  'm.vasseur@kalavoice.ai': 'SUPERVISOR',
  'p.simon@kalavoice.ai': 'TRAINER',
  'j.dupont@kalavoice.ai': 'AGENT',
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialisation : vérification de la session existante
  useEffect(() => {
    const initSession = async () => {
      const storedToken = tokenStore.get();
      const storedUser = tokenStore.getUser();

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(storedUser);
        storageService.setCurrentUser(storedUser);

        // Si l'API est en ligne, rafraîchir les informations utilisateur via /api/auth/me
        try {
          const res = await authApi.me();
          if (res.ok && res.data) {
            setUser(res.data);
            tokenStore.setUser(res.data);
            storageService.setCurrentUser(res.data);
          }
        } catch {
          // Si l'API est injoignable, la session stockée reste valide en mode local
        }
      } else {
        // Aucun token stocké -> utilisateur non authentifié
        setToken(null);
        setUser(null);
      }

      setIsLoading(false);
    };

    initSession();

    // Écoute de l'événement global de déconnexion automatique (401 API)
    const handleRemoteLogout = () => {
      logout();
    };
    window.addEventListener('kala:logout', handleRemoteLogout);
    return () => window.removeEventListener('kala:logout', handleRemoteLogout);
  }, []);

  const login = async (email: string, password: string, rememberMe = true): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    const cleanEmail = email.toLowerCase().trim();

    try {
      // 1. Tenter la connexion auprès du backend REST (Express + SQLite + JWT)
      const res = await authApi.login(cleanEmail, password);

      if (res.ok && res.data) {
        const authUser = res.data.user;
        const authToken = res.data.token;

        setToken(authToken);
        setUser(authUser);
        storageService.setCurrentUser(authUser);

        if (rememberMe) {
          tokenStore.set(authToken);
          tokenStore.setUser(authUser);
        }

        setIsLoading(false);
        return { success: true };
      }

      // 2. Si le backend retourne une erreur d'identifiants explicite
      if (res.status === 401 || res.status === 400) {
        setIsLoading(false);
        return { success: false, error: res.error || 'Email ou mot de passe incorrect.' };
      }

      // 3. Fallback hors-ligne intelligent pour les comptes de démonstration (password: kala2024!)
      if (password === 'kala2024!' && DEMO_CREDENTIALS[cleanEmail]) {
        const matchedRole = DEMO_CREDENTIALS[cleanEmail];
        const initialUser = INITIAL_USERS.find(u => u.email.toLowerCase() === cleanEmail) || {
          id: `user-${Date.now()}`,
          name: cleanEmail.split('@')[0].replace('.', ' ').toUpperCase(),
          email: cleanEmail,
          role: matchedRole,
          department: 'Centre de Contacts KALA',
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
          isActive: true,
          createdAt: new Date().toISOString()
        };

        const syntheticToken = `demo_jwt_${btoa(cleanEmail)}_${Date.now()}`;
        setToken(syntheticToken);
        setUser(initialUser);
        storageService.setCurrentUser(initialUser);

        if (rememberMe) {
          tokenStore.set(syntheticToken);
          tokenStore.setUser(initialUser);
        }

        setIsLoading(false);
        return { success: true };
      }

      setIsLoading(false);
      return { success: false, error: 'Identifiants incorrects ou compte inactif. Utilisez le mot de passe démo : kala2024!' };
    } catch {
      setIsLoading(false);
      return { success: false, error: 'Erreur lors de la tentative d\'authentification.' };
    }
  };

  const logout = () => {
    try {
      authApi.logout();
    } catch {
      // Ignorer si hors-ligne
    }

    tokenStore.clearAll();
    setToken(null);
    setUser(null);
  };

  const updateUserProfile = (updates: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    setUser(updated);
    tokenStore.setUser(updated);
    storageService.setCurrentUser(updated);
  };

  const switchRole = (newRole: UserRole) => {
    if (!user) return;
    const updated: User = { ...user, role: newRole };
    setUser(updated);
    tokenStore.setUser(updated);
    storageService.setCurrentUserRole(newRole);
  };

  const hasRole = (allowedRoles: UserRole[]): boolean => {
    if (!user) return false;
    return allowedRoles.includes(user.role);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(user && token),
        isLoading,
        role: user ? user.role : null,
        login,
        logout,
        updateUserProfile,
        switchRole,
        hasRole
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé à l\'intérieur d\'un AuthProvider');
  }
  return context;
};
