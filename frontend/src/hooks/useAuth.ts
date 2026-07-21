import { useEffect } from 'react';
import { useSessionStore } from '../store/sessionStore';
import { verifyToken } from '../api/auth';

export function useAuth() {
  const { token, setIsAdmin, isAdmin } = useSessionStore();

  useEffect(() => {
    if (token && !isAdmin) {
      // Verify token validity
      verifyToken(token).then(() => {
        setIsAdmin(true);
      }).catch(() => {
        // Token is invalid or expired
        useSessionStore.getState().logout();
      });
    }
  }, [token, isAdmin, setIsAdmin]);

  return { isAuthenticated: !!token && isAdmin, token, isAdmin };
}

