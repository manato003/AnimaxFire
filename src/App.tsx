import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { useAnimeStore } from './store/animeStore';
import { useSettingsStore } from './store/settingsStore';
import { useAuthStore } from './store/authStore';
import { auth } from './config/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { AnimeBasic } from './types/anime';
import { HeroSection } from './components/HeroSection';
import { GenreFilter, SortType } from './components/GenreFilter';
import { AnimeGrid } from './components/AnimeGrid';
import { Footer } from './components/Footer';
import { MyPage } from './pages/MyPage';
import { RankingPage } from './pages/RankingPage';
import { SettingsPage } from './pages/SettingsPage';
import { AuthGuard } from './components/AuthGuard';
import { UserMenu } from './components/UserMenu';
import { ScrollToTop } from './components/ScrollToTop';
import { searchAnime, fetchAnimeByGenre } from './services/animeService';

type Page = 'home' | 'mypage' | 'ranking' | 'settings';

function App() {
  const { setTrendingAnime } = useAnimeStore();
  const { showOnlyJapanese } = useSettingsStore();
  const { setUser } = useAuthStore();
  const [selectedGenre, setSelectedGenre] = useState<number | null>(null);
  const [selectedSort, setSelectedSort] = useState<SortType>('popularity');
  const [filteredAnime, setFilteredAnime] = useState<AnimeBasic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [activePage, setActivePage] = useState<Page>('home');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, [setUser]);

  useEffect(() => {
    const loadAnime = async () => {
      try {
        if (searchQuery) {
          const results = await searchAnime(searchQuery, 1);
          setFilteredAnime(results);
        } else {
          const anime = await fetchAnimeByGenre(selectedGenre, selectedSort, 1);
          setFilteredAnime(anime);
          if (!selectedGenre) {
            setTrendingAnime(anime);
          }
        }
      } catch (error) {
        console.error('アニメの取得に失敗しました:', error);
      } finally {
        setIsLoading(false);
      }
    };

    setIsLoading(true);
    setPage(1);
    loadAnime();
  }, [selectedGenre, selectedSort, searchQuery, setTrendingAnime, showOnlyJapanese]);

  const handleGenreSelect = (genreId: number | null) => {
    setSelectedGenre(genreId);
    setPage(1);
    setSearchQuery('');
  };

  const handleSortSelect = (sort: SortType) => {
    setSelectedSort(sort);
    setPage(1);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setSelectedGenre(null);
    setPage(1);
  };

  const handleLoadMore = async () => {
    setIsLoading(true);
    const nextPage = page + 1;

    try {
      let newAnime;
      if (searchQuery) {
        newAnime = await searchAnime(searchQuery, nextPage);
      } else {
        newAnime = await fetchAnimeByGenre(selectedGenre, selectedSort, nextPage);
      }
      
      setFilteredAnime(prev => [...prev, ...newAnime]);
      setPage(nextPage);
    } catch (error) {
      console.error('追加のアニメの取得に失敗しました:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (page: Page) => {
    setActivePage(page);
    setIsMenuOpen(false);
  };

  const renderContent = () => {
    switch (activePage) {
      case 'mypage':
        return (
          <AuthGuard>
            <MyPage />
          </AuthGuard>
        );
      case 'settings':
        return (
          <AuthGuard>
            <SettingsPage />
          </AuthGuard>
        );
      case 'ranking':
        return <RankingPage />;
      default:
        return (
          <>
            <HeroSection onSearch={handleSearch} />
            <main className="container mx-auto px-4 py-8 md:py-12">
              <GenreFilter
                selectedGenre={selectedGenre}
                selectedSort={selectedSort}
                onGenreSelect={handleGenreSelect}
                onSortSelect={handleSortSelect}
              />
              <AnimeGrid 
                isLoading={isLoading}
                anime={filteredAnime}
                selectedGenre={selectedGenre}
                onLoadMore={handleLoadMore}
                searchQuery={searchQuery}
              />
            </main>
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      <nav className="bg-black/30 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-14 md:h-16">
            <div className="h-6 md:h-8 cursor-pointer" onClick={() => handlePageChange('home')}>
              <img 
                src="/animax-logo.svg" 
                alt="ANIMAX" 
                className="h-full w-auto"
                style={{ filter: 'drop-shadow(0 0 10px rgba(255, 255, 255, 0.3))' }}
              />
            </div>

            <div className="flex items-center gap-4">
              {/* Desktop Menu */}
              <div className="hidden md:flex gap-4">
                <button
                  onClick={() => handlePageChange('home')}
                  className={`btn text-base px-4 py-2 ${
                    activePage === 'home'
                      ? 'bg-yellow-500 text-black'
                      : 'text-white/80 hover:text-white'
                  }`}
                >
                  ホーム
                </button>
                <button
                  onClick={() => handlePageChange('ranking')}
                  className={`btn text-base px-4 py-2 ${
                    activePage === 'ranking'
                      ? 'bg-yellow-500 text-black'
                      : 'text-white/80 hover:text-white'
                  }`}
                >
                  ランキング
                </button>
                <button
                  onClick={() => handlePageChange('mypage')}
                  className={`btn text-base px-4 py-2 ${
                    activePage === 'mypage'
                      ? 'bg-yellow-500 text-black'
                      : 'text-white/80 hover:text-white'
                  }`}
                >
                  マイページ
                </button>
                <button
                  onClick={() => handlePageChange('settings')}
                  className={`btn text-base px-4 py-2 ${
                    activePage === 'settings'
                      ? 'bg-yellow-500 text-black'
                      : 'text-white/80 hover:text-white'
                  }`}
                >
                  設定
                </button>
              </div>

              <UserMenu />

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-white/10"
              >
                {isMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Menu Dropdown */}
          <div
            className={`md:hidden absolute left-0 right-0 bg-black/95 backdrop-blur-sm transition-all duration-300 ease-in-out ${
              isMenuOpen
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 -translate-y-2 pointer-events-none'
            }`}
          >
            <div className="container mx-auto px-4 py-4 space-y-2">
              <button
                onClick={() => handlePageChange('home')}
                className={`w-full text-left px-4 py-3 rounded-lg ${
                  activePage === 'home'
                    ? 'bg-yellow-500 text-black'
                    : 'text-white/80 hover:bg-white/10'
                }`}
              >
                ホーム
              </button>
              <button
                onClick={() => handlePageChange('ranking')}
                className={`w-full text-left px-4 py-3 rounded-lg ${
                  activePage === 'ranking'
                    ? 'bg-yellow-500 text-black'
                    : 'text-white/80 hover:bg-white/10'
                }`}
              >
                ランキング
              </button>
              <button
                onClick={() => handlePageChange('mypage')}
                className={`w-full text-left px-4 py-3 rounded-lg ${
                  activePage === 'mypage'
                    ? 'bg-yellow-500 text-black'
                    : 'text-white/80 hover:bg-white/10'
                }`}
              >
                マイページ
              </button>
              <button
                onClick={() => handlePageChange('settings')}
                className={`w-full text-left px-4 py-3 rounded-lg ${
                  activePage === 'settings'
                    ? 'bg-yellow-500 text-black'
                    : 'text-white/80 hover:bg-white/10'
                }`}
              >
                設定
              </button>
            </div>
          </div>
        </div>
      </nav>

      {renderContent()}
      <Footer />
      <ScrollToTop />
    </div>
  );
}

export default App;