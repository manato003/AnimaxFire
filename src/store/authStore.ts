import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  signInWithPopup, 
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { auth } from '../config/firebase';

interface AuthStore {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string, isRegistering: boolean) => Promise<void>;
  signOut: () => Promise<void>;
  setUser: (user: User | null) => void;
  setError: (error: string | null) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isLoading: true,
      error: null,
      signInWithGoogle: async () => {
        try {
          const provider = new GoogleAuthProvider();
          const result = await signInWithPopup(auth, provider);
          set({ user: result.user, error: null });
        } catch (error) {
          set({ error: 'Googleログインに失敗しました。' });
        }
      },
      signInWithEmail: async (email, password, isRegistering) => {
        try {
          let userCredential;
          if (isRegistering) {
            userCredential = await createUserWithEmailAndPassword(auth, email, password);
          } else {
            userCredential = await signInWithEmailAndPassword(auth, email, password);
          }
          set({ user: userCredential.user, error: null });
        } catch (error: any) {
          let errorMessage = 'ログインに失敗しました。';
          if (error.code === 'auth/email-already-in-use') {
            errorMessage = 'このメールアドレスは既に使用されています。';
          } else if (error.code === 'auth/invalid-email') {
            errorMessage = '無効なメールアドレスです。';
          } else if (error.code === 'auth/operation-not-allowed') {
            errorMessage = 'この操作は許可されていません。';
          } else if (error.code === 'auth/weak-password') {
            errorMessage = 'パスワードが弱すぎます。';
          } else if (error.code === 'auth/user-disabled') {
            errorMessage = 'このアカウントは無効化されています。';
          } else if (error.code === 'auth/user-not-found') {
            errorMessage = 'ユーザーが見つかりません。';
          } else if (error.code === 'auth/wrong-password') {
            errorMessage = 'パスワードが間違っています。';
          }
          set({ error: errorMessage });
        }
      },
      signOut: async () => {
        try {
          await firebaseSignOut(auth);
          set({ user: null, error: null });
        } catch (error) {
          set({ error: 'ログアウトに失敗しました。' });
        }
      },
      setUser: (user) => set({ user, isLoading: false }),
      setError: (error) => set({ error }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user }),
    }
  )
);