import React from 'react';
import { Tag, TrendingUp, Users, Clock, Star } from 'lucide-react';

interface Genre {
  id: number;
  name: string;
}

const GENRES: Genre[] = [
  { id: 0, name: 'すべて' },
  { id: 46, name: '受賞歴のある作品' },
  { id: 1, name: 'アクション' },
  { id: 2, name: 'アドベンチャー' },
  { id: 8, name: 'ドラマ' },
  { id: 10, name: 'ファンタジー' },
  { id: 62, name: '異世界' },
  { id: 24, name: 'SF' },
  { id: 18, name: 'ロボット' },
  { id: 22, name: '恋愛' },
  { id: 42, name: '青春' },
  { id: 23, name: '学園' },
  { id: 36, name: '日常' },
  { id: 4, name: 'コメディ' },
  { id: 19, name: '音楽' },
  { id: 30, name: 'スポーツ' },
  { id: 14, name: 'ホラー' },
  { id: 9, name: '青年向け' }
];

export type SortType = 'popularity' | 'rating' | 'airing' | 'newest';

interface SortOption {
  id: SortType;
  name: string;
  icon: React.ReactNode;
}

const SORT_OPTIONS: SortOption[] = [
  {
    id: 'popularity',
    name: '人気順',
    icon: <Users className="w-4 h-4" />,
  },
  {
    id: 'rating',
    name: '評価順',
    icon: <Star className="w-4 h-4" />,
  },
  {
    id: 'airing',
    name: '放送中',
    icon: <TrendingUp className="w-4 h-4" />,
  },
  {
    id: 'newest',
    name: '新着順',
    icon: <Clock className="w-4 h-4" />,
  },
];

interface GenreFilterProps {
  selectedGenre: number | null;
  selectedSort: SortType | null;
  onGenreSelect: (genreId: number | null) => void;
  onSortSelect: (sort: SortType) => void;
  showSortOptions?: boolean;
}

export const GenreFilter: React.FC<GenreFilterProps> = ({
  selectedGenre,
  selectedSort,
  onGenreSelect,
  onSortSelect,
  showSortOptions = true,
}) => {
  return (
    <div className="space-y-6 mb-6">
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Tag className="w-5 h-5 text-yellow-500" />
          <h3 className="text-lg font-semibold">ジャンル</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {GENRES.map((genre) => (
            <button
              key={genre.id}
              onClick={() => onGenreSelect(genre.id === 0 ? null : genre.id)}
              className={`btn ${
                (genre.id === 0 && selectedGenre === null) || genre.id === selectedGenre
                  ? 'bg-yellow-500 text-black'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              {genre.name}
            </button>
          ))}
        </div>
      </div>

      {showSortOptions && (
        <div className="flex flex-wrap gap-2">
          {SORT_OPTIONS.map((option) => (
            <button
              key={option.id}
              onClick={() => onSortSelect(option.id)}
              className={`btn flex items-center gap-2 ${
                selectedSort === option.id
                  ? 'bg-yellow-500 text-black'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              {option.icon}
              {option.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};