// src/components/WorkoutPlanCard.jsx

import React from 'react';
import { useTheme } from '../context/ThemeContext';

function WorkoutPlanCard({ plan, onStart, onEdit, onDelete }) {
  const { darkMode } = useTheme();

  return (
    <div className={`border rounded-lg p-4 mb-4 shadow-sm ${darkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-800'}`}>
      <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
        Type: {plan.type || 'Not specified'}
      </p>
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
        Scheduled: {plan.scheduledDate ? new Date(plan.scheduledDate).toLocaleDateString() : 'Not scheduled'}
      </p>
      <div className="mb-4 max-h-40 overflow-y-auto">
        <h4 className="font-semibold mb-1">Exercises:</h4>
        <ul className="list-disc list-inside">
          {plan.exercises.map((exercise) => (
            <li key={exercise._id} className="mb-1">
              <span className="font-medium">{exercise.name}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="flex justify-between">
        <button
          onClick={() => onStart(plan)}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 rounded text-sm"
        >
          Start Workout
        </button>
        <button
          onClick={() => onEdit(plan)}
          className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-2 rounded text-sm mx-2"
        >
          Edit Plan
        </button>
        <button
          onClick={() => onDelete(plan._id)}
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-sm"
        >
          Delete Plan
        </button>
      </div>
    </div>
  );
}

export default WorkoutPlanCard;