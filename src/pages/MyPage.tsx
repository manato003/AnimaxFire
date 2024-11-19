import React, { useState, useEffect } from 'react';
import { useUserStore } from '../store/userStore';
import { AnimeCard } from '../components/AnimeCard';
import { AnimeModal } from '../components/AnimeModal';
import { RatingChart } from '../components/RatingChart';
import { GenreFilter } from '../components/GenreFilter';
import { RecommendationSection } from '../components/RecommendationSection';
import { AnimeBasic, AnimeDetailed } from '../types/anime';
import { getRatingLabel, getRatingColor } from '../types/rating';
import { fetchAnimeDetails } from '../services/animeService';

type TabType = 'watchlist' | 'watched' | 'ratings' | 'recommendations';

export const MyPage: React.FC = () => {
  const { watchlist, watchedList, ratings } = useUserStore();
  const [activeTab, setActiveTab] = useState<TabType>('recommendations');
  const [selectedGenre, setSelectedGenre] = useState<number | null>(null);
  const [selectedAnime, setSelectedAnime] = useState<AnimeDetailed | null>(null);
  const [isModalLoading, setIsModalLoading] = useState(false);
  const [ratedAnime, setRatedAnime] = useState<Map<number, AnimeBasic>>(new Map());

  useEffect(() => {
    const loadRatedAnime = async () => {
      const animeMap = new Map<number, AnimeBasic>();
      
      for (const rating of ratings) {
        try {
          const existingAnime = [...watchlist, ...watchedList].find(
            a => a.mal_id === rating.animeId
          );
          
          if (existingAnime) {
            animeMap.set(rating.animeId, existingAnime);
          } else {
            const details = await fetchAnimeDetails(rating.animeId);
            animeMap.set(rating.animeId, details);
          }
        } catch (error) {
          console.error(`アニメ情報の取得に失敗しました (ID: ${rating.animeId}):`, error);
        }
      }
      
      setRatedAnime(animeMap);
    };

    if (activeTab === 'ratings' && ratings.length > 0) {
      loadRatedAnime();
    }
  }, [activeTab, ratings, watchlist, watchedList]);

  const handleAnimeClick = async (animeId: number) => {
    setIsModalLoading(true);
    try {
      const details = await fetchAnimeDetails(animeId);
      setSelectedAnime(details);
    } catch (error) {
      console.error('アニメ詳細の取得に失敗しました:', error);
    } finally {
      setIsModalLoading(false);
    }
  };

  const filterAnimeByGenre = (animeList: AnimeBasic[]) => {
    if (!selectedGenre) return animeList;
    return animeList.filter(anime => 
      anime.genres.some(genre => genre.mal_id === selectedGenre)
    );
  };

  const renderAnimeGrid = (animeList: AnimeBasic[]) => {
    const filteredAnime = filterAnimeByGenre(animeList);
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {filteredAnime.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-400">
            アニメが見つかりません
          </div>
        ) : (
          filteredAnime.map((anime) => (
            <AnimeCard
              key={anime.mal_id}
              anime={anime}
              onClick={() => handleAnimeClick(anime.mal_id)}
            />
          ))
        )}
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">マイページ</h1>

      <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveTab('recommendations')}
          className={`btn whitespace-nowrap ${
            activeTab === 'recommendations'
              ? 'bg-purple-600 text-white'
              : 'bg-white/10 text-white hover:bg-white/20'
          }`}
        >
          おすすめ
        </button>
        <button
          onClick={() => setActiveTab('watchlist')}
          className={`btn whitespace-nowrap ${
            activeTab === 'watchlist'
              ? 'bg-purple-600 text-white'
              : 'bg-white/10 text-white hover:bg-white/20'
          }`}
        >
          ウォッチリスト ({watchlist.length})
        </button>
        <button
          onClick={() => setActiveTab('watched')}
          className={`btn whitespace-nowrap ${
            activeTab === 'watched'
              ? 'bg-purple-600 text-white'
              : 'bg-white/10 text-white hover:bg-white/20'
          }`}
        >
          視聴済み ({watchedList.length})
        </button>
        <button
          onClick={() => setActiveTab('ratings')}
          className={`btn whitespace-nowrap ${
            activeTab === 'ratings'
              ? 'bg-purple-600 text-white'
              : 'bg-white/10 text-white hover:bg-white/20'
          }`}
        >
          評価済み ({ratings.length})
        </button>
      </div>

      {activeTab !== 'recommendations' && (
        <GenreFilter
          selectedGenre={selectedGenre}
          selectedSort={null}
          onGenreSelect={setSelectedGenre}
          onSortSelect={() => {}}
          showSortOptions={false}
        />
      )}

      {activeTab === 'recommendations' && <RecommendationSection />}
      {activeTab === 'watchlist' && renderAnimeGrid(watchlist)}
      {activeTab === 'watched' && renderAnimeGrid(watchedList)}
      
      {activeTab === 'ratings' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {ratings.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-400">
              評価済みのアニメはありません
            </div>
          ) : (
            ratings.map((rating) => {
              const anime = ratedAnime.get(rating.animeId);
              if (!anime) return null;
              
              if (selectedGenre && !anime.genres.some(g => g.mal_id === selectedGenre)) {
                return null;
              }

              const totalScore = Object.values(rating.ratings).reduce((a, b) => a + b, 0);
              const ratingLabel = getRatingLabel(totalScore);
              const ratingColor = getRatingColor(totalScore);

              return (
                <div
                  key={rating.animeId}
                  className="bg-white/5 rounded-xl p-6 backdrop-blur-sm"
                >
                  <div className="flex gap-4 mb-4">
                    <img
                      src={anime.images.jpg.large_image_url}
                      alt={anime.title}
                      className="w-32 h-48 object-cover rounded-lg cursor-pointer"
                      onClick={() => handleAnimeClick(anime.mal_id)}
                    />
                    <div>
                      <h3 
                        className="text-xl font-bold mb-2 hover:text-purple-400 cursor-pointer"
                        onClick={() => handleAnimeClick(anime.mal_id)}
                      >
                        {anime.title}
                      </h3>
                      <div className={`text-2xl font-bold ${ratingColor} mb-1`}>
                        {ratingLabel}
                      </div>
                      <div className="text-xl font-bold text-purple-400 mb-4">
                        {totalScore}点
                      </div>
                      <p className="text-gray-400 text-sm line-clamp-3">
                        {rating.comment}
                      </p>
                    </div>
                  </div>
                  <RatingChart ratings={rating.ratings} />
                </div>
              );
            })
          )}
        </div>
      )}

      {selectedAnime && (
        <AnimeModal
          anime={selectedAnime}
          onClose={() => setSelectedAnime(null)}
        />
      )}
    </div>
  );
};