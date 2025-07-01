import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { router } from 'expo-router';

const BASE_URL = 'https://edunova.api.miantsebastien.com/api';

interface TokenResponse {
  token: string;
  refresh_token: string;
  refresh_token_expiration: number;
}

export const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp < Math.floor(Date.now() / 1000);
  } catch (e) {
    console.error(e);
    return true;
  }
};

export const isRefreshTokenExpired = async (): Promise<boolean> => {
  const expiration = await AsyncStorage.getItem('refresh_token_expiration');
  if (!expiration) return true;
  return parseInt(expiration) < Math.floor(Date.now() / 1000);
};

export const refreshToken = async (): Promise<string> => {
  const refresh_token = await AsyncStorage.getItem('refresh_token');
  const expired = await isRefreshTokenExpired();
  const hadSession = await AsyncStorage.getItem('hasSession');

  // 💡 si l'utilisateur n’a jamais eu de session (pas encore connecté)
  if ((!refresh_token || expired) && hadSession === 'true') {
    throw new Error('Refresh token invalide ou expiré');
  }

  if (!refresh_token || expired) {
    // ⚠️ on retourne une chaîne vide sans throw
    return '';
  }

  const response = await fetch(`${BASE_URL}/token/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token }),
  });

  if (!response.ok) {
    throw new Error('Échec du rafraîchissement du token');
  }

  const data: TokenResponse = await response.json();

  await AsyncStorage.setItem('token', data.token);
  await AsyncStorage.setItem('refresh_token', data.refresh_token);
  await AsyncStorage.setItem('refresh_token_expiration', data.refresh_token_expiration.toString());

  return data.token;
};

const redirectToLogin = async () => {
  const hadSession = await AsyncStorage.getItem('hasSession');

  await AsyncStorage.clear();

  if (hadSession === 'true') {
    Alert.alert('Session expirée', 'Veuillez vous reconnecter.');
  }

  router.replace('/login');
};


const customFetch = async (url: string, options: RequestInit = {}) => {
  try {
    let token = await AsyncStorage.getItem('token');

    if (!token || isTokenExpired(token)) {
      try {
        token = await refreshToken();
      } catch (refreshError) {
        await redirectToLogin();
        console.error(refreshError);
        //throw refreshError;
      }
    }

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    };

    const finalUrl = `${BASE_URL}${url}`;
    const method = options.method || 'GET';

    // 🔍 Log de la requête
    console.log('📤 FETCH →', method, finalUrl);
    if (options.body) {
      try {
        const parsedBody = JSON.parse(options.body as string);
        console.log('📦 PAYLOAD:', parsedBody);
      } catch {
        console.log('📦 PAYLOAD (raw):', options.body);
      }
    }
    console.log('🧾 HEADERS:', headers);

    const response = await fetch(finalUrl, {
      ...options,
      headers,
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error('❌ FETCH ERROR:', response.status, response.statusText);
      console.error('📨 ERROR RESPONSE:', responseData);
      throw responseData;
    }

    // ✅ Réponse OK
    console.log('✅ FETCH SUCCESS:', response.status, response.statusText);
    console.log('📨 RESPONSE DATA:', responseData);

    return responseData;

  } catch (error) {
    console.error('💥 customFetch error:', error);
    throw error;
  }
};

export const fetcher = (url: string, config: RequestInit = {}) =>
  customFetch(url, { method: 'GET', ...config });

export const fetcherPost = (url: string, body: any = {}, config: RequestInit = {}) =>
  customFetch(url, { method: 'POST', body: JSON.stringify(body), ...config });

export const fetcherPut = (url: string, body: any = {}, config: RequestInit = {}) =>
  customFetch(url, { method: 'PUT', body: JSON.stringify(body), ...config });

export const fetcherPatch = (url: string, body: any = {}, config: RequestInit = {}) =>
  customFetch(url, { method: 'PATCH', body: JSON.stringify(body), ...config });

export const fetcherDelete = (url: string, config: RequestInit = {}) =>
  customFetch(url, { method: 'DELETE', ...config });
