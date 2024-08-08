// src/components/ExerciseItem.jsx

import React from 'react';

function ExerciseItem({ exercise, onClick, onEdit, onDelete, onAddToPlan }) {
  const handleAction = (action, e) => {
    e.stopPropagation();
    action(exercise);
  };

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
        <h3 className="font-heading text-xl font-bold mb-2 text-primary dark:text-blue-400">{exercise.name}</h3>
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