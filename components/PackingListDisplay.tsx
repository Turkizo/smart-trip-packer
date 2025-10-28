import React, { useMemo } from 'react';
import type { PackingList } from '../types';
import { PackingCategoryItem } from './PackingCategoryItem';
import { RefineListForm } from './RefineListForm';

interface PackingListDisplayProps {
  list: PackingList;
  tripDescription: string;
  onTogglePacked: (categoryIndex: number, itemIndex: number) => void;
  onReset: () => void;
  onRefine: (request: string) => void;
  isRefining: boolean;
}

export const PackingListDisplay: React.FC<PackingListDisplayProps> = ({ list, tripDescription, onTogglePacked, onReset, onRefine, isRefining }) => {
  const { packedCount, totalCount } = useMemo(() => {
    let packed = 0;
    let total = 0;
    list.forEach(category => {
      total += category.items.length;
      packed += category.items.filter(item => item.packed).length;
    });
    return { packedCount: packed, totalCount: total };
  }, [list]);

  const progressPercentage = totalCount > 0 ? (packedCount / totalCount) * 100 : 0;

  return (
    <div className="w-full animate-fade-in flex flex-col h-full">
      <div className="mb-4 px-1">
        <div className="flex justify-between items-center mb-1 text-slate-300">
            <h2 className="text-2xl font-bold">Your Packing List</h2>
            <span className="font-mono text-sm">{packedCount} / {totalCount} packed</span>
        </div>
        <p className="text-slate-400 mb-3 text-sm italic">For: "{tripDescription}"</p>
        <div className="w-full bg-slate-700 rounded-full h-2.5">
          <div
            className="bg-gradient-to-r from-cyan-500 to-indigo-500 h-2.5 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>

      <div className="space-y-3 flex-grow overflow-y-auto pr-2 mb-4">
        {list.map((category, categoryIndex) => (
          <PackingCategoryItem
            key={category.id}
            category={category}
            onTogglePacked={(itemIndex) => onTogglePacked(categoryIndex, itemIndex)}
          />
        ))}
      </div>
      
      <div className="mt-auto pt-4 border-t border-slate-700/50">
        <RefineListForm onSubmit={onRefine} isLoading={isRefining} />
        <div className="mt-4 text-center">
            <button
            onClick={onReset}
            className="px-6 py-2 bg-slate-700/50 text-slate-400 text-sm font-semibold rounded-lg hover:bg-slate-700 transition-colors"
            >
            Start New Trip
            </button>
        </div>
      </div>
    </div>
  );
};