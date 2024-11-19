import { AnimeBasic } from '../types/anime';
import { AnimeRating } from '../types/rating';
import { fetchAnimeByGenre } from './animeService';

interface GenrePreference {
  genreId: number;
  weight: number;
}

interface RecommendationScore {
  animeId: number;
  score: number;
}

export const analyzeUserPreferences = (ratings: AnimeRating[], watchedList: AnimeBasic[]): GenrePreference[] => {
  const genreScores = new Map<number, { total: number; count: number }>();

  // レーティングからジャンル選好度を計算
  ratings.forEach(rating => {
    const anime = watchedList.find(a => a.mal_id === rating.animeId);
    if (!anime) return;

    const totalScore = Object.values(rating.ratings).reduce((a, b) => a + b, 0);
    
    anime.genres.forEach(genre => {
      const current = genreScores.get(genre.mal_id) || { total: 0, count: 0 };
      genreScores.set(genre.mal_id, {
        total: current.total + totalScore,
        count: current.count + 1
      });
    });
  });

  // 視聴履歴からもジャンル選好度を計算
  watchedList.forEach(anime => {
    anime.genres.forEach(genre => {
      const current = genreScores.get(genre.mal_id) || { total: 0, count: 0 };
      genreScores.set(genre.mal_id, {
        total: current.total + 60, // デフォルトスコアとして60点を付与
        count: current.count + 1
      });
    });
  });

  // 平均スコアを計算し、重み付けを行う
  const preferences: GenrePreference[] = Array.from(genreScores.entries())
    .map(([genreId, { total, count }]) => ({
      genreId,
      weight: total / count
    }))
    .sort((a, b) => b.weight - a.weight);

  return preferences;
};

export const getRecommendations = async (
  preferences: GenrePreference[],
  watchedList: AnimeBasic[],
  limit: number = 10
): Promise<AnimeBasic[]> => {
  const watchedIds = new Set(watchedList.map(anime => anime.mal_id));
  const recommendationScores = new Map<number, RecommendationScore>();
  
  // 上位3ジャンルからアニメを取得
  const topGenres = preferences.slice(0, 3);
  
  for (const { genreId, weight } of topGenres) {
    const animeList = await fetchAnimeByGenre(genreId, 'popularity', 1);
    
    animeList.forEach(anime => {
      if (watchedIds.has(anime.mal_id)) return;
      
      const genreMatch = anime.genres.filter(g => 
        topGenres.some(p => p.genreId === g.mal_id)
      ).length;

      const current = recommendationScores.get(anime.mal_id)?.score || 0;
      recommendationScores.set(anime.mal_id, {
        animeId: anime.mal_id,
        score: current + (weight * genreMatch * (anime.score / 10))
      });
    });
  }

  // スコアでソートし、上位のアニメを返す
  const sortedRecommendations = Array.from(recommendationScores.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  const recommendedAnime: AnimeBasic[] = [];
  for (const rec of sortedRecommendations) {
    const animeList = await fetchAnimeByGenre(null, 'popularity', 1);
    const anime = animeList.find(a => a.mal_id === rec.animeId);
    if (anime) recommendedAnime.push(anime);
  }

  return recommendedAnime;
};