import React, { useState } from 'react';
import { AnimeCard } from './AnimeCard';
import { AnimeModal } from './AnimeModal';
import { AnimeBasic, AnimeDetailed } from '../types/anime';
import { ChevronDown } from 'lucide-react';
import { fetchAnimeDetails } from '../services/animeService';

interface AnimeGridProps {
  isLoading: boolean;
  anime: AnimeBasic[];
  selectedGenre: number | null;
  searchQuery?: string;
  onLoadMore: () => void;
}

export const AnimeGrid: React.FC<AnimeGridProps> = ({ 
  isLoading, 
  anime, 
  selectedGenre,
  searchQuery,
  onLoadMore 
}) => {
  const [selectedAnime, setSelectedAnime] = useState<AnimeDetailed | null>(null);
  const [isModalLoading, setIsModalLoading] = useState(false);

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

  const getTitle = () => {
    if (searchQuery) return `"${searchQuery}" の検索結果`;
    if (selectedGenre) return 'ジャンル別アニメ';
    return 'トレンドアニメ';
  };

  return (
    <section className="mb-16">
      <h2 className="text-2xl font-bold mb-6">{getTitle()}</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 mb-8">
        {isLoading && anime.length === 0 ? (
          Array.from({ length: 10 }, (_, i) => (
            <div key={`skeleton-${i}`} className="animate-pulse">
              <div className="bg-white/10 rounded-xl aspect-[2/3]"></div>
            </div>
          ))
        ) : anime.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-400">アニメが見つかりませんでした</p>
          </div>
        ) : (
          anime.map((anime) => (
            <AnimeCard 
              key={anime.uniqueId}
              anime={anime}
              onClick={() => handleAnimeClick(anime.mal_id)}
            />
          ))
        )}
      </div>

      {anime.length > 0 && (
        <div className="flex justify-center">
          <button
            onClick={onLoadMore}
            disabled={isLoading}
            className="btn bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
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

      {selectedAnime && (
        <AnimeModal
          anime={selectedAnime}
          onClose={() => setSelectedAnime(null)}
        />
      )}
    </section>
  );
};