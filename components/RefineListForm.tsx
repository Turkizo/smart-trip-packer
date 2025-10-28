import React, { useState } from 'react';
import { SpinnerIcon } from './icons/SpinnerIcon';
import { PaperAirplaneIcon } from './icons/PaperAirplaneIcon';

interface RefineListFormProps {
  onSubmit: (request: string) => void;
  isLoading: boolean;
}

export const RefineListForm: React.FC<RefineListFormProps> = ({ onSubmit, isLoading }) => {
  const [request, setRequest] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (request.trim() && !isLoading) {
      onSubmit(request.trim());
      setRequest('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full flex items-center gap-2">
      <label htmlFor="refine-request" className="sr-only">
        Add, remove, or change items
      </label>
      <input
        id="refine-request"
        type="text"
        value={request}
        onChange={(e) => setRequest(e.target.value)}
        placeholder="Add, remove, or change items..."
        className="flex-grow p-3 bg-slate-900 border-2 border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-slate-200 placeholder-slate-500"
        disabled={isLoading}
      />
      <button
        type="submit"
        disabled={isLoading || !request.trim()}
        className="p-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center shadow-lg shadow-indigo-900/50 transform hover:scale-105 disabled:scale-100"
        aria-label="Submit changes"
      >
        {isLoading ? (
          <SpinnerIcon className="w-6 h-6" />
        ) : (
          <PaperAirplaneIcon className="w-6 h-6" />
        )}
      </button>
    </form>
  );
};
