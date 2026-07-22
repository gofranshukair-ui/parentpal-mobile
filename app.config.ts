import type { ExpoConfig } from 'expo/config';

const API_URL = process.env.API_URL ?? 'http://127.0.0.1:8000';

const config: ExpoConfig = {
  name: 'ParentPal',
  slug: 'parentpal',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: 'parentpal',
  userInterfaceStyle: 'automatic',
  ios: {
    icon: './assets/expo.icon',
    bundleIdentifier: 'com.parentpal.app',
    supportsTablet: true,
  },
  android: {
    adaptiveIcon: {
      backgroundColor: '#FFD1DC',
      foregroundImage: './assets/images/android-icon-foreground.png',
      backgroundImage: './assets/images/android-icon-background.png',
      monochromeImage: './assets/images/android-icon-monochrome.png',
    },
    predictiveBackGestureEnabled: false,
    package: 'com.parentpal.app',
  },
  web: {
    output: 'static',
    favicon: './assets/images/favicon.png',
  },
  plugins: [
    'expo-router',
    [
      'expo-splash-screen',
      {
        backgroundColor: '#FFDAB9',
        android: {
          image: './assets/images/splash-icon.png',
          imageWidth: 76,
        },
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
  extra: {
    API_URL,
    SUPABASE_URL: 'https://fxwffsqczgqtzshhxbnw.supabase.co',
    SUPABASE_ANON_KEY: 'sb_publishable_ljewqyvNZkLARv_pI-sT2g_N_d6JqIr',
    eas: {
      projectId: '222b4496-5966-4f3b-b66e-9c888acc04d9',
    },
  },
};

export default config;
