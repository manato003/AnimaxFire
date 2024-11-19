import React, { useState, useEffect, useCallback } from 'react';
import { Sparkles, TrendingUp, ChevronDown } from 'lucide-react';
import { useUserStore } from '../store/userStore';
import { AnimeBasic, AnimeDetailed } from '../types/anime';
import { AnimeCard } from './AnimeCard';
import { AnimeModal } from './AnimeModal';
import { analyzeUserPreferences, getRecommendations } from '../services/recommendationService';
import { PreferenceChart } from './PreferenceChart';

interface CachedRecommendations {
  recommendations: AnimeBasic[];
  watchlistHash: string;
  watchedListHash: string;
  ratingsHash: string;
}

export const RecommendationSection: React.FC = () => {
  const { watchedList, ratings, watchlist } = useUserStore();
  const [recommendations, setRecommendations] = useState<AnimeBasic[]>([]);
  const [selectedAnime, setSelectedAnime] = useState<AnimeDetailed | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [isMobile, setIsMobile] = useState(false);
  const [cachedRecommendations, setCachedRecommendations] = useState<CachedRecommendations | null>(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const generateHash = (data: any[]): string => {
    return JSON.stringify(data.map(item => item.mal_id)).split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0).toString();
  };

  const shouldRefreshRecommendations = useCallback(() => {
    if (!cachedRecommendations) return true;
    const currentWatchlistHash = generateHash(watchlist);
    const currentWatchedListHash = generateHash(watchedList);
    const currentRatingsHash = generateHash(ratings);
    return currentWatchlistHash !== cachedRecommendations.watchlistHash ||
           currentWatchedListHash !== cachedRecommendations.watchedListHash ||
           currentRatingsHash !== cachedRecommendations.ratingsHash;
  }, [cachedRecommendations, watchlist, watchedList, ratings]);

  useEffect(() => {
    const loadRecommendations = async () => {
      if (!shouldRefreshRecommendations() && cachedRecommendations) {
        setRecommendations(cachedRecommendations.recommendations);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const preferences = analyzeUserPreferences(ratings, watchedList);
        const recommendedAnime = await getRecommendations(preferences, watchedList, 12);
        setRecommendations(recommendedAnime);
        
        setCachedRecommendations({
          recommendations: recommendedAnime,
          watchlistHash: generateHash(watchlist),
          watchedListHash: generateHash(watchedList),
          ratingsHash: generateHash(ratings)
        });
      } catch (error) {
        console.error('レコメンデーションの取得に失敗しました:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadRecommendations();
  }, [watchedList, ratings, watchlist, shouldRefreshRecommendations, cachedRecommendations]);

  const handleLoadMore = async () => {
    if (isLoadingMore) return;
    setIsLoadingMore(true);
    try {
      const preferences = analyzeUserPreferences(ratings, watchedList);
      const moreAnime = await getRecommendations(preferences, watchedList, 6);
      setRecommendations(prev => [...prev, ...moreAnime]);
      setPage(prev => prev + 1);
    } catch (error) {
      console.error('追加のアニメの取得に失敗しました:', error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const renderRecommendationsContent = () => (
    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6">
      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="w-6 h-6 text-yellow-400" />
        <h3 className="text-xl font-bold">あなたにおすすめのアニメ</h3>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-400">AIがあなたの視聴傾向を分析中です...</p>
        </div>
      ) : recommendations.length === 0 ? (
        <p className="text-center text-gray-400 py-8">
          おすすめのアニメを取得できませんでした
        </p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {recommendations.map((anime) => (
            <AnimeCard
              key={anime.uniqueId}
              anime={anime}
              onClick={() => setSelectedAnime(anime)}
            />
          ))}
        </div>
      )}

      {!isLoading && recommendations.length > 0 && (
        <div className="flex justify-center mt-8">
          <button
            onClick={handleLoadMore}
            disabled={isLoadingMore}
            className="btn bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2 disabled:opacity-50"
          >
            {isLoadingMore ? (
              <span className="animate-pulse">読み込み中...</span>
            ) : (
              <>
                もっと見る
                <ChevronDown className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );

  const renderPreferenceChart = () => (
    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6">
      <h3 className="text-xl font-bold mb-6">あなたの好み分析</h3>
      <PreferenceChart
        ratings={ratings}
        watchedList={watchedList}
      />
    </div>
  );

  return (
    <>
      {watchedList.length === 0 ? (
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-8 text-center">
          <TrendingUp className="w-12 h-12 text-purple-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">
            アニメを視聴して、パーソナライズされたおすすめを受け取ろう
          </h3>
          <p className="text-gray-400">
            視聴したアニメを記録すると、あなたの好みに合わせたアニメをおすすめします。
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {isMobile ? (
            <>
              {renderPreferenceChart()}
              {renderRecommendationsContent()}
            </>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                {renderRecommendationsContent()}
              </div>
              <div>
                {renderPreferenceChart()}
              </div>
            </div>
          )}
        </div>
      )}

      {selectedAnime && (
        <AnimeModal
          anime={selectedAnime}
          onClose={() => setSelectedAnime(null)}
        />
      )}
    </>
  );
};