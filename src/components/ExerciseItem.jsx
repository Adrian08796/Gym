// src/components/ExerciseItem.jsx

import React from 'react';

function ExerciseItem({ exercise, onEdit, onDelete, onAddToPlan }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:scale-105">
      <img 
        src={exercise.imageUrl} 
        alt={exercise.name} 
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <h3 className="font-heading text-xl font-bold mb-2 text-primary dark:text-blue-400">{exercise.name}</h3>
        <p className="text-text-light dark:text-text-dark text-sm mb-2">{exercise.description}</p>
        <p className="text-accent dark:text-yellow-300 text-xs mb-4">
          Target: {Array.isArray(exercise.target) ? exercise.target.join(', ') : exercise.target}
        </p>
        <div className="flex justify-between">
          <button 
            onClick={() => onEdit(exercise)} 
            className="bg-primary hover:bg-primary-dark text-white font-bold py-1 px-2 rounded text-sm"
          >
            Edit
          </button>
          <button 
            onClick={() => onDelete(exercise._id)} 
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-sm"
          >
            Delete
          </button>
          <button 
            onClick={() => onAddToPlan(exercise)} 
            className="bg-accent hover:bg-accent-dark text-white font-bold py-1 px-2 rounded text-sm"
          >
            Add to Plan
          </button>
        </div>
      </div>
    </div>
  );
}

export default ExerciseItem;