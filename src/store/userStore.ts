import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AnimeBasic } from '../types/anime';
import { AnimeRating } from '../types/rating';
import { useAuthStore } from './authStore';
import * as userDataService from '../services/userDataService';
import { onSnapshot, doc } from 'firebase/firestore';
import { db } from '../config/firebase';

interface UserStore {
  watchlist: AnimeBasic[];
  watchedList: AnimeBasic[];
  ratings: AnimeRating[];
  isLoading: boolean;
  error: string | null;
  initialized: boolean;
  isSyncing: boolean;
  lastSynced: Date | null;
  isOnline: boolean;
  unsubscribeSnapshot: (() => void) | null;
  addToWatchlist: (anime: AnimeBasic) => Promise<void>;
  removeFromWatchlist: (animeId: number) => Promise<void>;
  isInWatchlist: (animeId: number) => boolean;
  addToWatchedList: (anime: AnimeBasic) => Promise<void>;
  removeFromWatchedList: (animeId: number) => Promise<void>;
  isInWatchedList: (animeId: number) => boolean;
  addRating: (rating: AnimeRating) => Promise<void>;
  getRating: (animeId: number) => AnimeRating | undefined;
  initializeUserData: () => Promise<void>;
  setError: (error: string | null) => void;
  subscribeToUserData: (userId: string) => void;
  unsubscribeFromUserData: () => void;
  syncUserData: () => Promise<void>;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      watchlist: [],
      watchedList: [],
      ratings: [],
      isLoading: false,
      error: null,
      initialized: false,
      isSyncing: false,
      lastSynced: null,
      isOnline: navigator.onLine,
      unsubscribeSnapshot: null,

      subscribeToUserData: (userId: string) => {
        const unsubscribe = onSnapshot(
          doc(db, 'users', userId),
          {
            next: (snapshot) => {
              if (snapshot.exists()) {
                const data = snapshot.data();
                set({
                  watchlist: data.watchlist || [],
                  watchedList: data.watchedList || [],
                  ratings: data.ratings || [],
                  lastSynced: new Date(),
                  initialized: true
                });
              }
            },
            error: (error) => {
              console.error('Realtime sync error:', error);
              set({ error: 'データの同期に失敗しました' });
            }
          },
          { includeMetadataChanges: true }
        );

        set({ unsubscribeSnapshot: unsubscribe });

        // Online/Offline detection
        window.addEventListener('online', () => set({ isOnline: true }));
        window.addEventListener('offline', () => set({ isOnline: false }));
      },

      unsubscribeFromUserData: () => {
        const { unsubscribeSnapshot } = get();
        if (unsubscribeSnapshot) {
          unsubscribeSnapshot();
          set({ unsubscribeSnapshot: null });
        }
      },

      syncUserData: async () => {
        const user = useAuthStore.getState().user;
        if (!user || !get().isOnline) return;

        set({ isSyncing: true, error: null });
        try {
          const userData = await userDataService.getUserData(user.uid);
          if (userData) {
            set({
              watchlist: userData.watchlist || [],
              watchedList: userData.watchedList || [],
              ratings: userData.ratings || [],
              lastSynced: new Date(),
              initialized: true
            });
          }
        } catch (error) {
          set({ error: 'データの同期に失敗しました' });
        } finally {
          set({ isSyncing: false });
        }
      },

      initializeUserData: async () => {
        const user = useAuthStore.getState().user;
        if (!user || get().initialized) return;

        set({ isLoading: true, error: null });
        try {
          // Initial data load
          await get().syncUserData();
          
          // Subscribe to real-time updates
          get().subscribeToUserData(user.uid);
        } catch (error) {
          set({ error: 'Failed to load user data' });
        } finally {
          set({ isLoading: false });
        }
      },

      addToWatchlist: async (anime) => {
        const user = useAuthStore.getState().user;
        if (!user) return;

        const isAlreadyInWatchlist = get().watchlist.some(
          (item) => item.mal_id === anime.mal_id
        );
        
        if (!isAlreadyInWatchlist) {
          set({ isLoading: true, error: null });
          try {
            if (get().isOnline) {
              await userDataService.addToWatchlist(user.uid, anime);
            }
            set((state) => ({
              watchlist: [...state.watchlist, anime],
            }));
          } catch (error) {
            set({ error: 'Failed to add to watchlist' });
          } finally {
            set({ isLoading: false });
          }
        }
      },

      removeFromWatchlist: async (animeId) => {
        const user = useAuthStore.getState().user;
        if (!user) return;

        const anime = get().watchlist.find((a) => a.mal_id === animeId);
        if (!anime) return;

        set({ isLoading: true, error: null });
        try {
          if (get().isOnline) {
            await userDataService.removeFromWatchlist(user.uid, anime);
          }
          set((state) => ({
            watchlist: state.watchlist.filter((a) => a.mal_id !== animeId),
          }));
        } catch (error) {
          set({ error: 'Failed to remove from watchlist' });
        } finally {
          set({ isLoading: false });
        }
      },

      isInWatchlist: (animeId) => {
        return get().watchlist.some((anime) => anime.mal_id === animeId);
      },

      addToWatchedList: async (anime) => {
        const user = useAuthStore.getState().user;
        if (!user) return;

        const isAlreadyWatched = get().watchedList.some(
          (item) => item.mal_id === anime.mal_id
        );
        
        if (!isAlreadyWatched) {
          set({ isLoading: true, error: null });
          try {
            if (get().isOnline) {
              await userDataService.addToWatchedList(user.uid, anime);
            }
            set((state) => ({
              watchedList: [...state.watchedList, anime],
              watchlist: state.watchlist.filter((item) => item.mal_id !== anime.mal_id),
            }));
          } catch (error) {
            set({ error: 'Failed to add to watched list' });
          } finally {
            set({ isLoading: false });
          }
        }
      },

      removeFromWatchedList: async (animeId) => {
        const user = useAuthStore.getState().user;
        if (!user) return;

        const anime = get().watchedList.find((a) => a.mal_id === animeId);
        if (!anime) return;

        set({ isLoading: true, error: null });
        try {
          if (get().isOnline) {
            await userDataService.removeFromWatchedList(user.uid, anime);
          }
          set((state) => ({
            watchedList: state.watchedList.filter((a) => a.mal_id !== animeId),
          }));
        } catch (error) {
          set({ error: 'Failed to remove from watched list' });
        } finally {
          set({ isLoading: false });
        }
      },

      isInWatchedList: (animeId) => {
        return get().watchedList.some((anime) => anime.mal_id === animeId);
      },

      addRating: async (rating) => {
        const user = useAuthStore.getState().user;
        if (!user) return;

        set({ isLoading: true, error: null });
        try {
          if (get().isOnline) {
            await userDataService.addRating(user.uid, rating);
          }
          set((state) => ({
            ratings: [
              ...state.ratings.filter((r) => r.animeId !== rating.animeId),
              rating,
            ],
          }));
        } catch (error) {
          set({ error: 'Failed to add rating' });
        } finally {
          set({ isLoading: false });
        }
      },

      getRating: (animeId) => {
        return get().ratings.find((rating) => rating.animeId === animeId);
      },

      setError: (error) => set({ error }),
    }),
    {
      name: 'anime-user-storage',
    }
  )
);

// Initialize user data when auth state changes
useAuthStore.subscribe((state) => {
  if (state.user) {
    useUserStore.getState().initializeUserData();
  } else {
    useUserStore.getState().unsubscribeFromUserData();
  }
});