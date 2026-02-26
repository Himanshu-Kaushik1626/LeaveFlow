import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getMessaging } from 'firebase/messaging';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDCCtSVZa77rH6_kJlNJDO9VYZ_nIAHzF4",
  authDomain: "leaveflow-48949.firebaseapp.com",
  projectId: "leaveflow-48949",
  storageBucket: "leaveflow-48949.firebasestorage.app",
  messagingSenderId: "17002628484",
  appId: "1:17002628484:web:cf7288b4933b5b35ef89d1",
  measurementId: "G-YF1N16XF43"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const messaging = getMessaging(app);
export const storage = getStorage(app);

export default app;