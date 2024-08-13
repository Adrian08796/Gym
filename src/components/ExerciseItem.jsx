// src/components/ExerciseItem.jsx

import React from 'react';

function ExerciseItem({ exercise, onClick, onEdit, onDelete, onAddToPlan, viewMode }) {
  const handleAction = (action, e) => {
    e.stopPropagation();
    action(exercise);
  };

  const categoryColors = {
    Strength: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    Cardio: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    Flexibility: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
  };

  const CategoryBadge = () => (
    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${categoryColors[exercise.category] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}>
      {exercise.category}
    </span>
  );

  if (viewMode === 'list') {
    return (
      <div 
        className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:scale-105 cursor-pointer flex items-center"
        onClick={() => onClick(exercise)}
      >
        <img 
          src={exercise.imageUrl} 
          alt={exercise.name} 
          className="w-24 h-24 object-cover"
        />
        <div className="flex-grow p-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-heading text-xl font-bold text-primary dark:text-blue-400">{exercise.name}</h3>
            <CategoryBadge />
          </div>
          <p className="text-gray-700 dark:text-gray-300 text-sm mb-2 line-clamp-1">{exercise.description}</p>
          <p className="text-accent dark:text-yellow-300 text-xs">
            Target: {Array.isArray(exercise.target) ? exercise.target.join(', ') : exercise.target}
          </p>
        </div>
        <div className="flex flex-col space-y-2 p-4">
          <button 
            onClick={(e) => handleAction(onEdit, e)}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded text-xs"
          >
            Edit
          </button>
          <button 
            onClick={(e) => handleAction(onDelete, e)}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-xs"
          >
            Delete
          </button>
          <button 
            onClick={(e) => handleAction(onAddToPlan, e)}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 rounded text-xs"
          >
            Add to Plan
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:scale-105 cursor-pointer"
      onClick={() => onClick(exercise)}
    >
      <img 
        src={exercise.imageUrl} 
        alt={exercise.name} 
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-heading text-xl font-bold text-primary dark:text-blue-400">{exercise.name}</h3>
          <CategoryBadge />
        </div>
        <p className="text-gray-700 dark:text-gray-300 text-sm mb-2 line-clamp-2">{exercise.description}</p>
        <p className="text-accent dark:text-yellow-300 text-xs mb-4">
          Target: {Array.isArray(exercise.target) ? exercise.target.join(', ') : exercise.target}
        </p>
        <div className="flex justify-between mt-4">
          <button 
            onClick={(e) => handleAction(onEdit, e)}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded text-xs"
          >
            Edit
          </button>
          <button 
            onClick={(e) => handleAction(onDelete, e)}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-xs"
          >
            Delete
          </button>
          <button 
            onClick={(e) => handleAction(onAddToPlan, e)}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 rounded text-xs"
          >
            Add to Plan
          </button>
        </div>
      </div>
    </div>
  );
}

export default ExerciseItem;