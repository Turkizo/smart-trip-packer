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
          className="fixed inset-0 bg-black/60 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        ></div>
      )}
      <aside
        className={`fixed top-0 left-0 h-full w-72 bg-slate-800 border-r border-slate-700/50 flex flex-col z-40 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:relative md:translate-x-0 md:z-auto`}
      >
        <div className="p-4 flex justify-between items-center border-b border-slate-700">
          <h2 className="text-lg font-semibold">Trip History</h2>
          <div className="flex items-center gap-2">
            <button
                onClick={onNewTrip}
                className="flex items-center gap-2 px-3 py-1.5 bg-cyan-600/50 hover:bg-cyan-600/80 rounded-md text-sm font-semibold transition-colors"
                title="Start a new trip"
            >
                <PlusIcon className="w-4 h-4" />
                <span>New</span>
            </button>
            <button 
              onClick={() => setIsOpen(false)}
              className="md:hidden p-1"
              aria-label="Close menu"
            >
              <CloseIcon className="w-6 h-6" />
            </button>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto p-2">
          {history.length === 0 ? (
            <div className="text-center text-slate-400 p-4">
              Your generated packing lists will appear here.
            </div>
          ) : (
            <ul>
              {history.map(trip => (
                <li key={trip.id}>
                  <button
                    onClick={() => onSelectTrip(trip.id)}
                    className={`w-full text-left p-3 my-1 rounded-lg transition-colors ${
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
