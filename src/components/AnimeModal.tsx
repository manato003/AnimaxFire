import React, { useState } from 'react';
import { X, Star, Calendar, Clock, Users, Building2, BarChart, Mic } from 'lucide-react';
import { AnimeDetailed } from '../types/anime';
import { RatingForm } from './RatingForm';
import { WatchlistButton } from './WatchlistButton';
import { WatchedButton } from './WatchedButton';

interface AnimeModalProps {
  anime: AnimeDetailed | null;
  onClose: () => void;
}

export const AnimeModal: React.FC<AnimeModalProps> = ({ anime, onClose }) => {
  const [showRatingForm, setShowRatingForm] = useState(false);

  if (!anime) return null;

  const handleRatingSubmit = (ratings: Record<string, number>, comment: string) => {
    console.log('Rating submitted:', { animeId: anime.mal_id, ratings, comment });
    setShowRatingForm(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-4xl bg-gray-900 rounded-xl shadow-xl overflow-hidden">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 p-1 rounded-full bg-black/20 hover:bg-black/40 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="max-h-[85vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
            <div className="md:col-span-1">
              <div className="relative w-full">
                <img
                  src={anime.images.jpg.large_image_url}
                  alt={anime.title}
                  className="w-full h-auto rounded-lg"
                />
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => setShowRatingForm(!showRatingForm)}
                    className="flex-1 btn btn-primary flex items-center justify-center gap-2"
                  >
                    <BarChart className="w-5 h-5" />
                    {showRatingForm ? '詳細に戻る' : '評価する'}
                  </button>
                  <div className="flex gap-2">
                    <WatchedButton anime={anime} />
                    <WatchlistButton anime={anime} />
                  </div>
                </div>
              </div>
            </div>

            <div className="md:col-span-2">
              {showRatingForm ? (
                <RatingForm
                  animeId={anime.mal_id}
                  onSubmit={handleRatingSubmit}
                />
              ) : (
                <>
                  <h2 className="text-2xl font-bold mb-4">{anime.title}</h2>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="flex items-center gap-2">
                      <Star className="w-5 h-5 text-yellow-400" />
                      <span>{anime.score.toFixed(1)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-purple-400" />
                      <span>{`${anime.year}年 ${anime.season}`}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-blue-400" />
                      <span>{anime.episodes}話</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-green-400" />
                      <span>{anime.status}</span>
                    </div>
                  </div>

                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-2">
                      <Building2 className="w-5 h-5 text-orange-400" />
                      <span className="font-semibold">制作会社</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {anime.studios.map((studio) => (
                        <span
                          key={studio.mal_id}
                          className="px-3 py-1 bg-white/10 rounded-full text-sm"
                        >
                          {studio.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mb-6">
                    <h3 className="font-semibold mb-2">ジャンル</h3>
                    <div className="flex flex-wrap gap-2">
                      {anime.genres.map((genre) => (
                        <span
                          key={genre.mal_id}
                          className="px-3 py-1 bg-purple-500/20 rounded-full text-sm"
                        >
                          {genre.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  {anime.voiceActors?.length > 0 && (
                    <div className="mb-6">
                      <div className="flex items-center gap-2 mb-2">
                        <Mic className="w-5 h-5 text-pink-400" />
                        <span className="font-semibold">声優・キャラクター</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {anime.voiceActors.map((va) => (
                          <div
                            key={`${va.person.mal_id}-${va.character.mal_id}`}
                            className="flex items-center gap-3 bg-white/5 rounded-lg p-2"
                          >
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <div className="flex-shrink-0 w-10 h-10">
                                <img
                                  src={va.character.images.jpg.image_url}
                                  alt={va.character.name}
                                  className="w-full h-full object-cover rounded-full"
                                />
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-medium truncate">
                                  {va.character.name}
                                </p>
                                <p className="text-xs text-gray-400 truncate">
                                  CV: {va.person.name}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <h3 className="font-semibold mb-2">あらすじ</h3>
                    <p className="text-gray-300 leading-relaxed">
                      {anime.synopsis}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};