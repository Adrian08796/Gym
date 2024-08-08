// src/components/ExerciseModal.jsx

import React, { useEffect, useCallback } from 'react';

function ExerciseModal({ exercise, onClose, onEdit, onDelete, onAddToPlan }) {
  const handleEscapeKey = useCallback((event) => {
    if (event.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [handleEscapeKey]);

  const handleOverlayClick = (event) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  if (!exercise) return null;

  return (
    <div 
      className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50"
      onClick={handleOverlayClick}
    >
      <div 
        className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl lg:max-w-6xl xl:max-w-7xl mx-4 p-6 lg:p-8 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <div className="flex-grow overflow-y-auto">
          <div className="flex flex-col lg:flex-row">
            <div className="lg:w-1/2 pr-0 lg:pr-8 mb-6 lg:mb-0">
              <img 
                src={exercise.imageUrl} 
                alt={exercise.name} 
                className="w-full h-64 md:h-96 lg:h-[500px] object-cover rounded-lg"
              />
            </div>
            <div className="lg:w-1/2 pl-0 lg:pl-8">
              <h3 className="text-3xl lg:text-4xl font-bold mb-6 text-gray-900 dark:text-gray-100">{exercise.name}</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-6 text-lg lg:text-xl">{exercise.description}</p>
              <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg lg:text-xl">
                Target: {Array.isArray(exercise.target) ? exercise.target.join(', ') : exercise.target}
              </p>
            </div>
          </div>
        </div>
        <div className="flex justify-end space-x-4 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button 
            onClick={() => onEdit(exercise)}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm"
          >
            Edit
          </button>
          <button 
            onClick={() => onDelete(exercise)}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded text-sm"
          >
            Delete
          </button>
          <button 
            onClick={() => onAddToPlan(exercise)}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded text-sm"
          >
            Add to Plan
          </button>
        </div>
      </div>
    </div>
  );
}

export default ExerciseModal;