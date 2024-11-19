import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { SearchBar } from './SearchBar';
import { AnimeBasic } from '../types/anime';
import { fetchAnimeByGenre } from '../services/animeService';
import { AnimeModal } from './AnimeModal';
import { fetchAnimeDetails } from '../services/animeService';

interface HeroSectionProps {
  onSearch: (query: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onSearch }) => {
  const [featuredAnime, setFeaturedAnime] = useState<AnimeBasic[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [selectedAnime, setSelectedAnime] = useState<AnimeBasic | null>(null);
  const [isModalLoading, setIsModalLoading] = useState(false);
  const autoPlayRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const loadFeaturedAnime = async () => {
      try {
        const anime = await fetchAnimeByGenre(null, 'popularity', 1);
        setFeaturedAnime(anime);
      } catch (error) {
        console.error('人気アニメの取得に失敗しました:', error);
      }
    };
    loadFeaturedAnime();
  }, []);

  useEffect(() => {
    if (isAutoPlaying && featuredAnime.length > 0) {
      autoPlayRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % featuredAnime.length);
      }, 7000);
    }
    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [isAutoPlaying, featuredAnime.length]);

  const handlePrevious = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => 
      prev === 0 ? featuredAnime.length - 1 : prev - 1
    );
  };

  const handleNext = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev + 1) % featuredAnime.length);
  };

  const handleDotClick = (index: number) => {
    setIsAutoPlaying(false);
    setCurrentIndex(index);
  };

  const handleAnimeClick = async (anime: AnimeBasic) => {
    setIsModalLoading(true);
    try {
      const details = await fetchAnimeDetails(anime.mal_id);
      setSelectedAnime(details);
    } catch (error) {
      console.error('アニメ詳細の取得に失敗しました:', error);
    } finally {
      setIsModalLoading(false);
    }
  };

  return (
    <header className="relative h-[60vh] md:h-[80vh] overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/30 to-black/90 z-10" />
      
      {featuredAnime.length > 0 && (
        <>
          <div className="absolute inset-0">
            {featuredAnime.map((anime, index) => (
              <div
                key={anime.uniqueId}
                className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
                  index === currentIndex
                    ? 'opacity-100'
                    : 'opacity-0'
                }`}
              >
                <div className="absolute inset-0 bg-black">
                  <div
                    className="absolute inset-0 bg-cover bg-center md:bg-left"
                    style={{
                      backgroundImage: `url(${anime.images.jpg.large_image_url})`,
                    }}
                  >
                    <div 
                      className="absolute inset-0"
                      style={{
                        background: 'inherit',
                        filter: 'blur(20px)',
                        transform: 'scale(1.1)',
                      }}
                    />
                  </div>
                  <div
                    className="absolute inset-0 bg-contain bg-center md:bg-left bg-no-repeat"
                    style={{
                      backgroundImage: `url(${anime.images.jpg.large_image_url})`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="relative z-20 h-full flex flex-col items-center justify-center px-4 md:px-0">
            <div className="container mx-auto">
              <div className="max-w-2xl mx-auto">
                <SearchBar onSearch={onSearch} />
              </div>
            </div>
          </div>

          <div className="absolute bottom-4 md:bottom-8 left-4 right-4 md:right-8 z-20 flex flex-col md:flex-row md:items-end md:justify-end gap-4 md:gap-8">
            <button
              onClick={() => handleAnimeClick(featuredAnime[currentIndex])}
              className="text-center md:text-right transition-all duration-300 hover:text-yellow-400"
            >
              <h2 className="text-xl md:text-2xl font-bold leading-tight line-clamp-2 text-shadow">
                {featuredAnime[currentIndex].title}
              </h2>
            </button>

            <div className="flex items-center justify-center md:justify-end gap-4">
              <button
                onClick={handlePrevious}
                className="p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
              >
                <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
              </button>

              <div className="flex gap-2">
                {featuredAnime.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => handleDotClick(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === currentIndex
                        ? 'w-6 md:w-8 bg-white'
                        : 'bg-white/50 hover:bg-white/80'
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={handleNext}
                className="p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
              >
                <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
              </button>
            </div>
          </div>

          {selectedAnime && (
            <AnimeModal
              anime={selectedAnime}
              onClose={() => setSelectedAnime(null)}
            />
          )}
        </>
      )}
    </header>
  );
};