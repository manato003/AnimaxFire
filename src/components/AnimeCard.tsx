import React from 'react';
import { Star, Users } from 'lucide-react';
import { AnimeBasic } from '../types/anime';
import { WatchlistButton } from './WatchlistButton';
import { WatchedButton } from './WatchedButton';

interface AnimeCardProps {
  anime: AnimeBasic;
  onClick: () => void;
}

export const AnimeCard: React.FC<AnimeCardProps> = ({ anime, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="group relative overflow-hidden rounded-xl bg-white/5 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:bg-white/10 cursor-pointer"
    >
      <div className="aspect-[2/3] overflow-hidden">
        <img
          src={anime.images.jpg.large_image_url}
          alt={anime.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent">
        <div className="absolute top-2 right-2 flex gap-2">
          <WatchedButton anime={anime} />
          <WatchlistButton anime={anime} />
        </div>
        <div className="absolute bottom-0 p-4 text-white">
          <h3 className="text-lg font-bold leading-tight line-clamp-2">
            {anime.title}
          </h3>
          <div className="mt-2 flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 text-yellow-400" />
              <span className="text-sm">{anime.score.toFixed(1)}</span>
            </div>
            {anime.year && (
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4 text-purple-400" />
                <span className="text-sm">
                  {`${anime.year}年${anime.season ? ` ${anime.season}` : ''}`}
                </span>
              </div>
            )}
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {anime.genres.slice(0, 2).map((genre) => (
              <span
                key={genre.mal_id}
                className="rounded-full bg-purple-500/20 px-2 py-1 text-xs backdrop-blur-sm"
              >
                {genre.name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};