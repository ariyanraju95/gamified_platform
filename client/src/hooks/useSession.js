import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

// Ends the session when the browser tab closes
const useSession = () => {
  const { sessionId, user } = useAuth();

  useEffect(() => {
    if (!sessionId || !user) return;

    const handleUnload = () => {
      // Use sendBeacon for reliable unload requests
      const token = localStorage.getItem('token');
      navigator.sendBeacon(
        `${import.meta.env.VITE_API_BASE_URL}/auth/logout`,
        JSON.stringify({ sessionId })
      );
    };

    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, [sessionId, user]);
};

export default useSession;
