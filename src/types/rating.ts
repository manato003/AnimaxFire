export interface RatingCriteria {
  id: string;
  name: string;
  description: string;
  category: 'story' | 'visual' | 'audio' | 'character';
}

export interface AnimeRating {
  animeId: number;
  userId: string;
  ratings: Record<string, number>;
  comment: string;
  createdAt: string;
}

export const getRatingLabel = (score: number): string => {
  if (score >= 108) return '神作';
  if (score >= 96) return '名作';
  if (score >= 84) return '傑作';
  if (score >= 72) return '佳作';
  if (score >= 60) return '良作';
  if (score >= 48) return '凡作';
  if (score >= 36) return '駄作';
  return '迷作';
};

export const getRatingColor = (score: number): string => {
  if (score >= 108) return 'text-yellow-400';
  if (score >= 96) return 'text-purple-400';
  if (score >= 84) return 'text-blue-400';
  if (score >= 72) return 'text-green-400';
  if (score >= 60) return 'text-cyan-400';
  if (score >= 48) return 'text-gray-400';
  if (score >= 36) return 'text-red-400';
  return 'text-red-600';
};

export const RATING_CRITERIA: RatingCriteria[] = [
  {
    id: 'story',
    name: 'ストーリー',
    description: '物語の質、展開の面白さ、一貫性、結末の満足度',
    category: 'story'
  },
  {
    id: 'character',
    name: 'キャラクター',
    description: '登場人物の魅力、キャラクター同士の相性',
    category: 'character'
  },
  {
    id: 'animation',
    name: '作画',
    description: '絵の美しさ、動きの滑らかさ、細部の描写',
    category: 'visual'
  },
  {
    id: 'music',
    name: '音楽',
    description: 'BGM、主題歌、効果音の質と適合性、楽曲の魅力、場面との調和',
    category: 'audio'
  },
  {
    id: 'voiceActing',
    name: '声優',
    description: 'キャラクターとの適合性、演技力、他の声優との調和',
    category: 'audio'
  },
  {
    id: 'worldBuilding',
    name: '世界観・設定',
    description: '詳細さや背景の質、一貫性、ストーリーとの調和',
    category: 'story'
  },
  {
    id: 'theme',
    name: 'テーマ性・メッセージ性',
    description: '深さ、普遍性、刺激されたか',
    category: 'story'
  },
  {
    id: 'originality',
    name: 'オリジナリティ',
    description: '既存作品との差別化、新しいアイディアの提示',
    category: 'story'
  },
  {
    id: 'reality',
    name: 'リアリティ',
    description: 'キャラクターの言動の妥当性、世界観や設定の整合性',
    category: 'character'
  },
  {
    id: 'genreAccuracy',
    name: 'ジャンル適正',
    description: '作品がそのジャンルの特徴を適切に反映しているか',
    category: 'story'
  },
  {
    id: 'universality',
    name: '普遍性',
    description: '時代や文化を超えて共感を得られるか、10年後観ても面白いか',
    category: 'story'
  },
  {
    id: 'overall',
    name: '総合評価',
    description: '作品全体の印象や満足感、感動の度合い、再視聴意欲',
    category: 'story'
  }
];