import { useEffect, useState } from 'react';
import { useSessionStore } from '../store/sessionStore';
import { verifyToken } from '../api/auth';
import { getCurrentUser } from '../api/users';

export function useAuth() {
  const { token, setIsAdmin, login, isAdmin } = useSessionStore();
  const [isVerifying, setIsVerifying] = useState(Boolean(token));

  useEffect(() => {
    let mounted = true;

    async function verify() {
      if (!token) {
        setIsVerifying(false);
        return;
      }

      setIsVerifying(true);
      // First try admin verify (admin tokens go to /api/auth/verify)
      try {
        const data = await verifyToken(token);
        if (!mounted) return;
        setIsAdmin(true);
        // Set session as admin (displayName set to Admin)
        login(token, true, '', 'Admin', data.username || 'admin');
        setIsVerifying(false);
        return;
      } catch {
        // Not an admin token or invalid. Try user verification via /api/users/me
      }

      try {
        const user = await getCurrentUser();
        if (!mounted) return;
        setIsAdmin(false);
        // login(token, isAdmin=false, currentUID=username, displayName, username)
        login(token, false, user.username, user.displayName, user.username);
        setIsVerifying(false);
      } catch {
        // Token invalid for both admin and user -> logout
        useSessionStore.getState().logout();
        setIsVerifying(false);
      }
    }

    verify();

    return () => {
      mounted = false;
    };
  }, [token, setIsAdmin, login]);

  return { isAuthenticated: !!token, token, isAdmin, isVerifying };
}

