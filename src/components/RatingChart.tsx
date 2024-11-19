import React from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
} from 'recharts';
import { RATING_CRITERIA } from '../types/rating';

interface RatingChartProps {
  ratings: Record<string, number>;
}

export const RatingChart: React.FC<RatingChartProps> = ({ ratings }) => {
  const data = RATING_CRITERIA.map((criteria) => ({
    subject: criteria.name,
    value: ratings[criteria.id] || 0,
    fullMark: 10,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
        <PolarGrid stroke="#ffffff20" />
        <PolarAngleAxis
          dataKey="subject"
          tick={{ fill: '#fff', fontSize: 12 }}
        />
        <Radar
          name="評価"
          dataKey="value"
          stroke="#8b5cf6"
          fill="#8b5cf6"
          fillOpacity={0.5}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
};