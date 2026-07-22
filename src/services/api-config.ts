import Constants from 'expo-constants';
import { Platform } from 'react-native';

export function getApiBaseUrl(): string {
  const configured = Constants.expoConfig?.extra?.API_URL as string | undefined;
  let baseUrl = configured?.replace(/\/$/, '') ?? 'http://127.0.0.1:8000';

  if (Platform.OS === 'android') {
    baseUrl = baseUrl
      .replace('http://127.0.0.1', 'http://10.0.2.2')
      .replace('http://localhost', 'http://10.0.2.2');
  }

  return baseUrl;
}
