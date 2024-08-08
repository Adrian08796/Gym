// src/components/ExerciseItem.jsx

import React from 'react';

function ExerciseItem({ exercise, onClick }) {
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
        <p className="text-accent dark:text-yellow-300 text-xs">
          Target: {Array.isArray(exercise.target) ? exercise.target.join(', ') : exercise.target}
        </p>
      </div>
    </div>
  );
}

export default ExerciseItem;