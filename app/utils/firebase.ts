import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';

const firebaseConfig = {
  projectId: "elaborate-achievment-2w1xt",
  appId: "1:884662428462:web:6476c5ce9147085717d0bf",
  apiKey: "AIzaSyCDBRBJ530VNtdHHWkD_xk0HXyfYB__cLM",
  authDomain: "elaborate-achievment-2w1xt.firebaseapp.com",
  storageBucket: "elaborate-achievment-2w1xt.firebasestorage.app",
  messagingSenderId: "884662428462"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const loginWithGoogle = async () => {
  try {
    const cred = await signInWithPopup(auth, googleProvider);
    if (cred.user) {
      localStorage.setItem('user_session_start', Date.now().toString());
    }
  } catch (error) {
    console.error('Login failed', error);
  }
};

export const logout = () => {
  localStorage.removeItem('user_session_start');
  return signOut(auth);
};

// Helper for listening to auth changes
export const subscribeToAuth = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};
