
import React, { useState } from 'react';
import type { PackingCategory } from '../types';
import { PackingItemEntry } from './PackingItemEntry';
import { ChevronDownIcon } from './icons/ChevronDownIcon';

interface PackingCategoryItemProps {
  category: PackingCategory;
  onTogglePacked: (itemIndex: number) => void;
}

export const PackingCategoryItem: React.FC<PackingCategoryItemProps> = ({ category, onTogglePacked }) => {
  const [isOpen, setIsOpen] = useState(true);

  const packedCount = category.items.filter(item => item.packed).length;
  const totalCount = category.items.length;

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 transition-all duration-300">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center p-4 text-left"
      >
        <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold text-slate-200">{category.category}</h3>
            <span className="text-sm font-mono bg-slate-700 text-slate-400 px-2 py-0.5 rounded-full">
                {packedCount}/{totalCount}
            </span>
        </div>
        <ChevronDownIcon
          className={`w-6 h-6 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-0' : 'rotate-180'}`}
        />
      </button>
      {isOpen && (
        <div className="border-t border-slate-700 px-4 pb-4">
          <ul className="divide-y divide-slate-700/50">
            {category.items.map((item, itemIndex) => (
              <PackingItemEntry
                key={item.id}
                item={item}
                onToggle={() => onTogglePacked(itemIndex)}
              />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
