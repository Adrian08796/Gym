// src/components/ExerciseItem.jsx

import React from 'react';

function ExerciseItem({ exercise, onEdit, onDelete, onAddToPlan }) {
  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <img 
        src={exercise.imageUrl} 
        alt={exercise.name} 
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <h3 className="font-bold text-xl mb-2">{exercise.name}</h3>
        <p className="text-gray-700 text-base mb-2">{exercise.description}</p>
        <p className="text-gray-600 text-sm mb-4">Target: {exercise.target}</p>
        <div className="flex justify-between">
          <button 
            onClick={() => onEdit(exercise)} 
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Edit
          </button>
          <button 
            onClick={() => onDelete(exercise._id)} 
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          >
            Delete
          </button>
          <button 
            onClick={() => onAddToPlan(exercise)} 
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          >
            Add to Plan
          </button>
        </div>
      </div>
    </div>
  );
}

export default ExerciseItem;