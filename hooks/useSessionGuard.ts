import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetcher } from '@/services/apiService';
import { useUser } from '@/contexts/UserContext';
import { router } from 'expo-router';

export const useSessionGuard = () => {
  const { user, setUser } = useUser();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verify = async () => {
      if (user) {
        setLoading(false);
        return;
      }

      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) throw new Error('Token manquant');

        const res = await fetcher('/user');
        if (res?.data) {
          setUser(res.data);
        } else {
          throw new Error('User null');
        }
      } catch (e) {
        console.warn('Session invalide :', e);
        await AsyncStorage.clear();
        router.replace('/login');
      } finally {
        setLoading(false);
      }
    };

    verify();
  }, [user, setUser]);

  return { loading };
};
