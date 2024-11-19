import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc,
  arrayUnion, 
  arrayRemove,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { AnimeBasic } from '../types/anime';
import { AnimeRating } from '../types/rating';

export interface UserData {
  watchlist: AnimeBasic[];
  watchedList: AnimeBasic[];
  ratings: AnimeRating[];
  lastUpdated: any; // Firestore Timestamp
}

export const saveUserData = async (userId: string, data: Partial<UserData>) => {
  try {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, {
      ...data,
      lastUpdated: serverTimestamp()
    }, { merge: true });
  } catch (error) {
    console.error('Failed to save user data:', error);
    throw error;
  }
};

export const getUserData = async (userId: string): Promise<UserData | null> => {
  try {
    const userRef = doc(db, 'users', userId);
    const docSnap = await getDoc(userRef);
    
    if (docSnap.exists()) {
      return docSnap.data() as UserData;
    }
    return null;
  } catch (error) {
    console.error('Failed to get user data:', error);
    throw error;
  }
};

export const addToWatchlist = async (userId: string, anime: AnimeBasic) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      watchlist: arrayUnion(anime),
      lastUpdated: serverTimestamp()
    });
  } catch (error) {
    console.error('Failed to add to watchlist:', error);
    throw error;
  }
};

export const removeFromWatchlist = async (userId: string, anime: AnimeBasic) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      watchlist: arrayRemove(anime),
      lastUpdated: serverTimestamp()
    });
  } catch (error) {
    console.error('Failed to remove from watchlist:', error);
    throw error;
  }
};

export const addToWatchedList = async (userId: string, anime: AnimeBasic) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      watchedList: arrayUnion(anime),
      watchlist: arrayRemove(anime),
      lastUpdated: serverTimestamp()
    });
  } catch (error) {
    console.error('Failed to add to watched list:', error);
    throw error;
  }
};

export const removeFromWatchedList = async (userId: string, anime: AnimeBasic) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      watchedList: arrayRemove(anime),
      lastUpdated: serverTimestamp()
    });
  } catch (error) {
    console.error('Failed to remove from watched list:', error);
    throw error;
  }
};

export const addRating = async (userId: string, rating: AnimeRating) => {
  try {
    const userRef = doc(db, 'users', userId);
    const docSnap = await getDoc(userRef);
    
    if (docSnap.exists()) {
      const userData = docSnap.data() as UserData;
      const ratings = userData.ratings || [];
      const updatedRatings = ratings.filter(r => r.animeId !== rating.animeId);
      updatedRatings.push(rating);
      
      await updateDoc(userRef, {
        ratings: updatedRatings,
        lastUpdated: serverTimestamp()
      });
    } else {
      await setDoc(userRef, {
        ratings: [rating],
        lastUpdated: serverTimestamp()
      });
    }
  } catch (error) {
    console.error('Failed to add rating:', error);
    throw error;
  }
};