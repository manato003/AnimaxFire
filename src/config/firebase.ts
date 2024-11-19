import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyD1MOV3zfyrg3ZC4nWj1QgGwGWHzN9Q5FY",
  authDomain: "animax-c6699.firebaseapp.com",
  projectId: "animax-c6699",
  storageBucket: "animax-c6699.appspot.com",
  messagingSenderId: "568496924186",
  appId: "1:568496924186:web:abc123def456ghi789jkl"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Initialize Firebase Auth settings
auth.useDeviceLanguage();

// Enable emulator in development
if (import.meta.env.DEV) {
  auth.settings.appVerificationDisabledForTesting = true;
  connectAuthEmulator(auth, 'http://127.0.0.1:9099');
  connectFirestoreEmulator(db, '127.0.0.1', 8080);
}