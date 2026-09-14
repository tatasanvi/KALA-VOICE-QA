// =============================================================================
// KALA VOICE QA — Gardes de Sécurité de Routage (ProtectedRoute & RoleGuard)
// Contrôle d'authentification et permissions RBAC pour React Router
// =============================================================================
import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { AccessDeniedView } from '../views/AccessDeniedView';

interface ProtectedRouteProps {
  children?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#050505',
        color: '#ffffff'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid rgba(59, 130, 246, 0.2)',
          borderTopColor: '#60a5fa',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
          marginBottom: '16px'
        }} />
        <div style={{ fontSize: '13px', color: 'var(--text-muted)', letterSpacing: '0.5px' }}>
          Vérification de la session KALA VOICE QA...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirection automatique vers /login en conservant l'URL d'origine pour redirection post-connexion
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

interface RoleGuardProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ allowedRoles, children }) => {
  const { user, hasRole } = useAuth();

  if (!user || !hasRole(allowedRoles)) {
    return <AccessDeniedView requiredRoles={allowedRoles} currentRole={user ? user.role : null} />;
  }

  return <>{children}</>;
};
