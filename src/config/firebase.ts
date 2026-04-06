import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

function getRequiredEnvVar(name: string): string {
  const value = import.meta.env[name];

  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`Missing required Firebase environment variable: ${name}`);
  }

  return value;
}

// Firebase configuration
const firebaseConfig = {
  apiKey: getRequiredEnvVar('VITE_FIREBASE_API_KEY'),
  authDomain: getRequiredEnvVar('VITE_FIREBASE_AUTH_DOMAIN'),
  projectId: getRequiredEnvVar('VITE_FIREBASE_PROJECT_ID'),
  storageBucket: getRequiredEnvVar('VITE_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: getRequiredEnvVar('VITE_FIREBASE_MESSAGING_SENDER_ID'),
  appId: getRequiredEnvVar('VITE_FIREBASE_APP_ID')
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
