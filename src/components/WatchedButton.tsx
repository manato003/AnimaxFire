import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { useUserStore } from '../store/userStore';
import { AnimeBasic } from '../types/anime';

interface WatchedButtonProps {
  anime: AnimeBasic;
  className?: string;
}

export const WatchedButton: React.FC<WatchedButtonProps> = ({ anime, className = '' }) => {
  const { addToWatchedList, removeFromWatchedList, isInWatchedList } = useUserStore();
  const isWatched = isInWatchedList(anime.mal_id);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isWatched) {
      removeFromWatchedList(anime.mal_id);
    } else {
      addToWatchedList(anime);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`p-2 rounded-full transition-colors ${
        isWatched
          ? 'bg-green-500 text-white hover:bg-green-600'
          : 'bg-white/10 hover:bg-white/20'
      } ${className}`}
      title={isWatched ? '視聴済みから削除' : '視聴済みに追加'}
    >
      <CheckCircle2 className="w-5 h-5" />
    </button>
  );
};