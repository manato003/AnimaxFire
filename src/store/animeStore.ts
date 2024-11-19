import { create } from 'zustand';
import { AnimeBasic } from '../types/anime';

interface AnimeStore {
  trendingAnime: AnimeBasic[];
  searchResults: AnimeBasic[];
  setTrendingAnime: (anime: AnimeBasic[]) => void;
  setSearchResults: (results: AnimeBasic[]) => void;
}

export const useAnimeStore = create<AnimeStore>((set) => ({
  trendingAnime: [],
  searchResults: [],
  setTrendingAnime: (anime) => set({ trendingAnime: anime }),
  setSearchResults: (results) => set({ searchResults: results }),
}));