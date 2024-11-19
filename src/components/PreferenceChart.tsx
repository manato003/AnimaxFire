import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import { AnimeBasic } from '../types/anime';
import { AnimeRating } from '../types/rating';
import { analyzeUserPreferences } from '../services/recommendationService';

interface PreferenceChartProps {
  ratings: AnimeRating[];
  watchedList: AnimeBasic[];
}

const COLORS = [
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // yellow
  '#ef4444', // red
];

export const PreferenceChart: React.FC<PreferenceChartProps> = ({ ratings, watchedList }) => {
  const preferences = analyzeUserPreferences(ratings, watchedList);
  const totalWeight = preferences.reduce((sum, p) => sum + p.weight, 0);

  const data = preferences.slice(0, 6).map(pref => {
    const genre = watchedList
      .flatMap(anime => anime.genres)
      .find(g => g.mal_id === pref.genreId);

    return {
      name: genre?.name || '不明',
      value: (pref.weight / totalWeight) * 100,
      weight: pref.weight
    };
  });

  const getAnalysisText = () => {
    if (data.length === 0) return '視聴データが不足しています。';

    const topGenres = data.slice(0, 3);
    const totalPercentage = topGenres.reduce((sum, genre) => sum + genre.value, 0);
    
    const text = [
      `あなたは主に${topGenres[0].name}作品を好む傾向にあります（${topGenres[0].value.toFixed(1)}%）。`,
      topGenres.length > 1 && `次いで${topGenres[1].name}（${topGenres[1].value.toFixed(1)}%）`,
      topGenres.length > 2 && `、${topGenres[2].name}（${topGenres[2].value.toFixed(1)}%）`,
      topGenres.length > 1 && 'の作品に興味を示しています。',
      `\n\nこれらの${topGenres.length}ジャンルで全体の${totalPercentage.toFixed(1)}%を占めており、`,
      totalPercentage > 75 
        ? 'かなり明確な好みを持っていることがわかります。'
        : totalPercentage > 50
        ? '比較的はっきりとした好みを持っていることがわかります。'
        : '幅広いジャンルを楽しんでいることがわかります。'
    ].filter(Boolean).join('');

    return text;
  };

  return (
    <div className="space-y-6">
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((_, index) => (
                <Cell 
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Legend
              layout="vertical"
              align="right"
              verticalAlign="middle"
              formatter={(value: string) => (
                <span className="text-sm text-white">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white/5 rounded-lg p-4">
        <h4 className="text-lg font-semibold mb-2">分析結果</h4>
        <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
          {getAnalysisText()}
        </p>
      </div>
    </div>
  );
};