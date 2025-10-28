import React from 'react';
import type { TripHistoryItem } from '../types';
import { PlusIcon } from './icons/PlusIcon';
import { CloseIcon } from './icons/CloseIcon';

interface HistorySidebarProps {
  history: TripHistoryItem[];
  activeTripId: string | null;
  onSelectTrip: (id: string) => void;
  onNewTrip: () => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export const HistorySidebar: React.FC<HistorySidebarProps> = ({
  history,
  activeTripId,
  onSelectTrip,
  onNewTrip,
  isOpen,
  setIsOpen,
}) => {
  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-30"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        ></div>
      )}
      <aside
        className={`fixed top-0 right-0 h-full w-full md:w-80 bg-slate-800 border-l border-slate-700/50 flex flex-col z-40 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-4 flex justify-between items-center border-b border-slate-700">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-slate-700 rounded-md transition-colors"
              aria-label="סגור תפריט"
            >
              <CloseIcon className="w-6 h-6" />
            </button>
            <button
                onClick={onNewTrip}
                className="flex items-center gap-2 px-3 py-1.5 bg-cyan-600/50 hover:bg-cyan-600/80 rounded-md text-sm font-semibold transition-colors"
                title="התחל טיול חדש"
            >
                <PlusIcon className="w-4 h-4" />
                <span>חדש</span>
            </button>
          </div>
          <h2 className="text-lg font-semibold">היסטוריית טיולים</h2>
        </div>
        <nav className="flex-1 overflow-y-auto p-2">
          {history.length === 0 ? (
            <div className="text-center text-slate-400 p-4">
              רשימות הציוד שיצרת יופיעו כאן.
            </div>
          ) : (
            <ul>
              {history.map(trip => (
                <li key={trip.id}>
                  <button
                    onClick={() => onSelectTrip(trip.id)}
                    className={`w-full text-right p-3 my-1 rounded-lg transition-colors ${
                      activeTripId === trip.id
                        ? 'bg-slate-700'
                        : 'hover:bg-slate-700/50'
                    }`}
                  >
                    <p className="font-semibold truncate text-slate-200">
                      {trip.tripDescription}
                    </p>
                    <time className="text-xs text-slate-400">
                      {formatDate(trip.createdAt)}
                    </time>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </nav>
      </aside>
    </>
  );
};
