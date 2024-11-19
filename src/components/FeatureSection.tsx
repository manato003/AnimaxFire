import React from 'react';
import { Tv2, TrendingUp, Star } from 'lucide-react';

const FEATURES = [
  {
    id: 'feature-1',
    icon: <Tv2 className="w-8 h-8 text-purple-400" />,
    title: "詳細な評価システム",
    description: "12項目の評価基準で、アニメを多角的に分析"
  },
  {
    id: 'feature-2',
    icon: <TrendingUp className="w-8 h-8 text-purple-400" />,
    title: "トレンド分析",
    description: "リアルタイムで人気のアニメをチェック"
  },
  {
    id: 'feature-3',
    icon: <Star className="w-8 h-8 text-purple-400" />,
    title: "パーソナライズ推薦",
    description: "あなたの好みに合わせたアニメを提案"
  }
];

export const FeatureSection: React.FC = () => {
  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
      {FEATURES.map((feature) => (
        <div key={feature.id} className="bg-white/5 backdrop-blur-sm rounded-xl p-6">
          {feature.icon}
          <h3 className="text-xl font-semibold mt-4">{feature.title}</h3>
          <p className="text-gray-400 mt-2">{feature.description}</p>
        </div>
      ))}
    </section>
  );
};