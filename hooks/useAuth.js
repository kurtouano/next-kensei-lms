// hooks/useAuth.js
import { useSession } from 'next-auth/react';

export const useAuth = () => {
  const { data: session, status } = useSession();
  
  const loading = status === 'loading';
  const user = session?.user || null;
  const error = status === 'unauthenticated' ? 'Not authenticated' : null;

  return { user, loading, error };
};