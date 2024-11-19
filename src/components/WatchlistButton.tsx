import React from 'react';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import { useUserStore } from '../store/userStore';
import { AnimeBasic } from '../types/anime';

interface WatchlistButtonProps {
  anime: AnimeBasic;
  className?: string;
}

export const WatchlistButton: React.FC<WatchlistButtonProps> = ({ anime, className = '' }) => {
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useUserStore();
  const inWatchlist = isInWatchlist(anime.mal_id);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (inWatchlist) {
      removeFromWatchlist(anime.mal_id);
    } else {
      addToWatchlist(anime);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`p-2 rounded-full transition-colors ${
        inWatchlist
          ? 'bg-yellow-500 text-black hover:bg-yellow-600'
          : 'bg-white/10 hover:bg-white/20'
      } ${className}`}
      title={inWatchlist ? 'ウォッチリストから削除' : 'ウォッチリストに追加'}
    >
      {inWatchlist ? (
        <BookmarkCheck className="w-5 h-5" />
      ) : (
        <Bookmark className="w-5 h-5" />
      )}
    </button>
  );
};