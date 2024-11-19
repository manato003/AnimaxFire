import React, { useState, useEffect } from 'react';
import { Users, TrendingUp, Clock, Star } from 'lucide-react';
import { AnimeBasic, AnimeDetailed } from '../types/anime';
import { AnimeCard } from '../components/AnimeCard';
import { AnimeModal } from '../components/AnimeModal';
import { GenreFilter } from '../components/GenreFilter';
import { fetchAnimeByGenre } from '../services/animeService';

type SortType = 'popularity' | 'rating' | 'airing' | 'newest';

interface RankingTab {
  id: SortType;
  name: string;
  icon: React.ReactNode;
  description: string;
}

const RANKING_TABS: RankingTab[] = [
  {
    id: 'popularity',
    name: '人気順',
    icon: <Users className="w-5 h-5" />,
    description: '累計視聴者数が多い作品をランキング',
  },
  {
    id: 'rating',
    name: '評価順',
    icon: <Star className="w-5 h-5" />,
    description: '評価の高い作品をランキング',
  },
  {
    id: 'airing',
    name: '放送中',
    icon: <TrendingUp className="w-5 h-5" />,
    description: '現在放送中で高評価の作品',
  },
  {
    id: 'newest',
    name: '新着順',
    icon: <Clock className="w-5 h-5" />,
    description: '放送開始日が新しい順に表示',
  },
];

export const RankingPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SortType>('popularity');
  const [selectedGenre, setSelectedGenre] = useState<number | null>(null);
  const [animeList, setAnimeList] = useState<AnimeBasic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [selectedAnime, setSelectedAnime] = useState<AnimeDetailed | null>(null);

  useEffect(() => {
    const loadRanking = async () => {
      setIsLoading(true);
      try {
        const data = await fetchAnimeByGenre(selectedGenre, activeTab, 1);
        setAnimeList(data);
        setPage(1);
      } catch (error) {
        console.error('ランキングの取得に失敗しました:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadRanking();
  }, [activeTab, selectedGenre]);

  const handleLoadMore = async () => {
    setIsLoading(true);
    try {
      const nextPage = page + 1;
      const moreAnime = await fetchAnimeByGenre(selectedGenre, activeTab, nextPage);
      setAnimeList(prev => [...prev, ...moreAnime]);
      setPage(nextPage);
    } catch (error) {
      console.error('追加のアニメの取得に失敗しました:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnimeClick = (anime: AnimeDetailed) => {
    setSelectedAnime(anime);
  };

  const activeTabData = RANKING_TABS.find(tab => tab.id === activeTab);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">アニメランキング</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {RANKING_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`p-4 rounded-xl transition-all ${
              activeTab === tab.id
                ? 'bg-purple-600 text-white'
                : 'bg-white/5 hover:bg-white/10'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              {tab.icon}
              <span className="font-semibold">{tab.name}</span>
            </div>
            <p className="text-sm text-left text-gray-400">
              {tab.description}
            </p>
          </button>
        ))}
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-2">
          {activeTabData?.name}ランキング
        </h2>
        <p className="text-gray-400 mb-6">
          {activeTabData?.description}
        </p>

        <GenreFilter
          selectedGenre={selectedGenre}
          selectedSort={null}
          onGenreSelect={setSelectedGenre}
          onSortSelect={() => {}}
          showSortOptions={false}
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 mb-8">
        {isLoading && animeList.length === 0 ? (
          Array.from({ length: 10 }, (_, i) => (
            <div key={`skeleton-${i}`} className="animate-pulse">
              <div className="bg-white/10 rounded-xl aspect-[2/3]"></div>
            </div>
          ))
        ) : animeList.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-400">
            アニメが見つかりませんでした
          </div>
        ) : (
          animeList.map((anime, index) => (
            <div key={`${anime.mal_id}-${index}`} className="relative">
              <div className="absolute top-2 left-2 z-10 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-lg font-bold">
                {index + 1}
              </div>
              <AnimeCard
                anime={anime}
                onClick={() => handleAnimeClick(anime)}
              />
            </div>
          ))
        )}
      </div>

      {animeList.length > 0 && (
        <div className="flex justify-center">
          <button
            onClick={handleLoadMore}
            disabled={isLoading}
            className="btn bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? '読み込み中...' : 'もっと見る'}
          </button>
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