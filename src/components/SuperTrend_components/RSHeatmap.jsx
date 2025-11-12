/**
 * RS Score Heatmap Component
 */
import React from 'react';
import { Card } from 'antd';

const RSHeatmap = ({ candidates }) => {
  if (!candidates || candidates.length === 0) {
    return (
      <Card className="shadow-lg">
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-400">No RS data available</p>
        </div>
      </Card>
    );
  }

  // Sort candidates by RS score
  const sortedCandidates = [...candidates].sort((a, b) => b.rs_score - a.rs_score);

  // Get color based on RS score
  const getColor = (score) => {
    if (score > 10) return 'bg-green-600';
    if (score > 5) return 'bg-green-500';
    if (score > 0) return 'bg-green-400';
    if (score > -5) return 'bg-red-400';
    if (score > -10) return 'bg-red-500';
    return 'bg-red-600';
  };

  return (
    <Card title="RS Score Heatmap" className="shadow-lg">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
        {sortedCandidates.map((candidate) => (
          <div
            key={candidate.symbol}
            className={`${getColor(candidate.rs_score)} text-white p-3 rounded text-center transition-all hover:scale-105`}
          >
            <div className="font-semibold text-sm">{candidate.symbol}</div>
            <div className="text-xs mt-1">{candidate.rs_score.toFixed(2)}%</div>
            <div className="text-xs opacity-75">Rank #{candidate.rank}</div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 flex items-center justify-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-600 rounded"></div>
          <span>Strong (+10%+)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-400 rounded"></div>
          <span>Moderate (0-10%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-400 rounded"></div>
          <span>Weak (0 to -10%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-600 rounded"></div>
          <span>Very Weak (-10%+)</span>
        </div>
      </div>
    </Card>
  );
};

export default RSHeatmap;

