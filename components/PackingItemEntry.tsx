
import React from 'react';
import type { PackingItem } from '../types';
import { CheckIcon } from './icons/CheckIcon';

interface PackingItemEntryProps {
  item: PackingItem;
  onToggle: () => void;
}

export const PackingItemEntry: React.FC<PackingItemEntryProps> = ({ item, onToggle }) => {
  return (
    <li className="flex items-center py-3">
      <label className="flex items-center cursor-pointer group w-full">
        <input
          type="checkbox"
          checked={item.packed}
          onChange={onToggle}
          className="sr-only"
        />
        <div
          className={`w-6 h-6 flex-shrink-0 border-2 rounded-md flex items-center justify-center mr-3 transition-all duration-200 ${
            item.packed
              ? 'bg-cyan-500 border-cyan-500'
              : 'bg-slate-900 border-slate-600 group-hover:border-cyan-500'
          }`}
        >
          {item.packed && <CheckIcon className="w-4 h-4 text-white" />}
        </div>
        <span
          className={`flex items-center text-slate-300 transition-colors duration-200 ${
            item.packed ? 'line-through text-slate-500' : 'group-hover:text-cyan-300'
          }`}
        >
          {item.name}
          {item.source === 'ai' && <span className="ml-2 text-amber-300" title="AI Suggestion">✨</span>}
        </span>
      </label>
    </li>
  );
};
