import { useSettingsStore } from '../store/settingsStore';
import { AnimeBasic, AnimeDetailed } from '../types/anime';

const BASE_URL = 'https://api.jikan.moe/v4';
const RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 1000;

// 日本の主要アニメスタジオリスト
const JAPANESE_STUDIOS = [
  'Kyoto Animation', 'Studio Ghibli', 'Madhouse', 'Production I.G', 'A-1 Pictures',
  'ufotable', 'MAPPA', 'Shaft', 'Sunrise', 'TRIGGER', 'WIT STUDIO', 'P.A.Works',
  'J.C.Staff', 'Toei Animation', 'OLM', 'GAINAX', 'Kinema Citrus', 'GONZO',
  'GoHands', 'Satellite', 'Sanzigen', 'SILVER LINK.', 'XEBEC', 'Studio GoHands',
  'Studio Comet', 'Studio DEEN', 'ZEXCS', 'Zero-G', 'Tatsunoko Production',
  'Diomedéa', 'DLE', 'david production', 'TMS Entertainment', 'Fanworks', 'feel.',
  'Brains Base', 'project No.9', 'Production IMS', 'WHITE FOX', 'Bones',
  'Polygon Pictures', 'LIDEN FILMS', 'Lerche'
];

const GENRE_MAP: { [key: number]: string } = {
  1: 'アクション',
  2: 'アドベンチャー',
  4: 'コメディ',
  8: 'ドラマ',
  9: '青年向け',
  10: 'ファンタジー',
  14: 'ホラー',
  18: 'ロボット',
  19: '音楽',
  22: '恋愛',
  23: '学園',
  24: 'SF',
  30: 'スポーツ',
  36: '日常',
  42: '青春',
  46: '受賞歴のある作品',
  62: '異世界'
};

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const fetchWithRetry = async (url: string, attempts = RETRY_ATTEMPTS): Promise<any> => {
  for (let i = 0; i < attempts; i++) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      if (i === attempts - 1) throw error;
      await sleep(RETRY_DELAY * (i + 1));
    }
  }
};

const isJapaneseAnime = (anime: any): boolean => {
  const hasJapaneseStudio = anime.studios?.some((studio: any) => 
    JAPANESE_STUDIOS.includes(studio.name) || 
    /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(studio.name)
  );
  
  const isFromJapan = anime.origin_country === 'Japan';
  const hasJapaneseStudioName = anime.studios?.some((studio: any) =>
    /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(studio.name)
  );

  return hasJapaneseStudio || isFromJapan || hasJapaneseStudioName;
};

export const fetchAnimeByGenre = async (
  genreId: number | null,
  sortType: 'popularity' | 'rating' | 'airing' | 'newest' | null,
  page: number = 1
): Promise<AnimeBasic[]> => {
  try {
    const { showOnlyJapanese } = useSettingsStore.getState();
    let url = `${BASE_URL}/anime?page=${page}&limit=12`; // Changed from 24 to 12 for faster initial load
    
    if (genreId) {
      url += `&genres=${genreId}`;
    }

    switch (sortType) {
      case 'rating':
        url += '&order_by=score&sort=desc&min_scoring_users=1000';
        break;
      case 'airing':
        url += '&status=airing&order_by=score&sort=desc';
        break;
      case 'newest':
        url += '&order_by=start_date&sort=desc';
        break;
      case 'popularity':
      default:
        url += '&order_by=members&sort=desc';
    }

    const data = await fetchWithRetry(url);
    let animeList = data.data
      .map((anime: any) => ({
        ...formatAnimeData(anime),
        uniqueId: `${anime.mal_id}-${Date.now()}-${Math.random()}`
      }));

    if (showOnlyJapanese) {
      animeList = animeList.filter(anime => isJapaneseAnime(anime));
    }

    return animeList;
  } catch (error) {
    console.error('アニメデータの取得に失敗しました:', error);
    return [];
  }
};

export const searchAnime = async (query: string, page: number = 1): Promise<AnimeBasic[]> => {
  try {
    const { showOnlyJapanese } = useSettingsStore.getState();
    const data = await fetchWithRetry(
      `${BASE_URL}/anime?q=${encodeURIComponent(query)}&page=${page}&limit=12`
    );
    
    let animeList = data.data
      .map((anime: any) => ({
        ...formatAnimeData(anime),
        uniqueId: `${anime.mal_id}-${Date.now()}-${Math.random()}`
      }));

    if (showOnlyJapanese) {
      animeList = animeList.filter(anime => isJapaneseAnime(anime));
    }

    return animeList;
  } catch (error) {
    console.error('アニメの検索に失敗しました:', error);
    return [];
  }
};

export const fetchAnimeDetails = async (id: number): Promise<AnimeDetailed> => {
  try {
    const [animeData, charactersData] = await Promise.all([
      fetchWithRetry(`${BASE_URL}/anime/${id}/full`),
      fetchWithRetry(`${BASE_URL}/anime/${id}/characters`)
    ]);

    const voiceActors = charactersData.data
      .filter((char: any) => 
        char.voice_actors?.some((va: any) => va.language === 'Japanese')
      )
      .map((char: any) => {
        const japaneseVA = char.voice_actors.find((va: any) => va.language === 'Japanese');
        return {
          person: {
            ...japaneseVA,
            name: japaneseVA.person.name
          },
          character: char.character
        };
      })
      .slice(0, 6);

    return {
      ...formatAnimeData(animeData.data),
      synopsis: animeData.data.synopsis || animeData.data.background || 'No synopsis available.',
      rating: animeData.data.rating,
      status: formatStatus(animeData.data.status),
      episodes: animeData.data.episodes || 0,
      duration: animeData.data.duration,
      aired: animeData.data.aired,
      voiceActors,
      uniqueId: `${animeData.data.mal_id}-${Date.now()}-${Math.random()}`
    };
  } catch (error) {
    console.error('アニメ詳細の取得に失敗しました:', error);
    throw error;
  }
};

const formatAnimeData = (anime: any): AnimeBasic => ({
  mal_id: anime.mal_id,
  title: anime.title_japanese || anime.title,
  images: anime.images,
  score: anime.score || 0,
  genres: anime.genres.map((genre: any) => ({
    mal_id: genre.mal_id,
    name: GENRE_MAP[genre.mal_id] || genre.name
  })),
  year: anime.year || new Date(anime.aired?.from).getFullYear() || null,
  season: formatSeason(anime.season),
  studios: anime.studios,
  uniqueId: `${anime.mal_id}-${Date.now()}-${Math.random()}`
});

const formatSeason = (season: string): string => {
  const seasonMap: { [key: string]: string } = {
    'spring': '春',
    'summer': '夏',
    'fall': '秋',
    'winter': '冬'
  };
  return seasonMap[season] || '';
};

const formatStatus = (status: string): string => {
  const statusMap: { [key: string]: string } = {
    'Finished Airing': '放送終了',
    'Currently Airing': '放送中',
    'Not yet aired': '放送予定'
  };
  return statusMap[status] || status;
};