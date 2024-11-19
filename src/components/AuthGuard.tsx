import React, { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useUserStore } from '../store/userStore';
import { LoginPrompt } from './LoginPrompt';

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { user, isLoading: authLoading } = useAuthStore();
  const { isLoading: dataLoading, initialized, initializeUserData } = useUserStore();

  useEffect(() => {
    if (user && !initialized) {
      initializeUserData();
    }
  }, [user, initialized, initializeUserData]);

  if (authLoading || (user && dataLoading && !initialized)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!user) {
    return <LoginPrompt />;
  }

  return <>{children}</>;
};