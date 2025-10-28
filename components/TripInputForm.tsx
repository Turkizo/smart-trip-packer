
import React, { useState } from 'react';
import { SpinnerIcon } from './icons/SpinnerIcon';

interface TripInputFormProps {
  onSubmit: (description: string) => void;
  isLoading: boolean;
}

export const TripInputForm: React.FC<TripInputFormProps> = ({ onSubmit, isLoading }) => {
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (description.trim() && !isLoading) {
      onSubmit(description.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full flex flex-col items-center">
      <label htmlFor="trip-description" className="sr-only">
        Describe your trip
      </label>
      <textarea
        id="trip-description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="תאר את הטיול שלך... למשל: 'טיול הליכה של 7 ימים בהרים בסתיו' או 'טיול סוף שבוע בחוף עם ילדים'"
        className="w-full h-32 p-4 bg-slate-900 border-2 border-slate-700 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors text-slate-200 placeholder-slate-500 resize-none text-right"
        disabled={isLoading}
      />
      <button
        type="submit"
        disabled={isLoading || !description.trim()}
        className="mt-4 px-8 py-3 w-full sm:w-auto bg-cyan-600 text-white font-bold rounded-lg hover:bg-cyan-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-cyan-900/50 transform hover:scale-105 disabled:scale-100"
      >
        {isLoading ? (
          <>
            <SpinnerIcon className="w-5 h-5" />
            יוצר רשימה...
          </>
        ) : (
          'צור רשימת ציוד'
        )}
      </button>
    </form>
  );
};
