// src/components/WorkoutPlanModal.jsx

import React from 'react';
import { useTheme } from '../context/ThemeContext'; // Import the useTheme hook

function WorkoutPlanModal({ plan, onClose }) {
  const { darkMode } = useTheme(); // Use the useTheme hook to get the current theme

  if (!plan) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50" id="my-modal">
      <div className={`relative mx-auto p-5 border w-full max-w-md shadow-lg rounded-md ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}>
        <div className="mt-3">
          <h3 className="text-lg leading-6 font-medium">{plan.name}</h3>
          <div className="mt-2 px-7 py-3">
            <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
              Type: {plan.type || 'Not specified'}
            </p>
            <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
              Scheduled: {plan.scheduledDate ? new Date(plan.scheduledDate).toLocaleString() : 'Not scheduled'}
            </p>
            <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
              Status: {plan.completed ? 'Completed' : 'Scheduled'}
            </p>
            <div className="mt-4">
              <h4 className="text-md font-medium">Exercises:</h4>
              <ul className="list-disc list-inside">
                {plan.exercises.map((exercise, index) => (
                  <li key={index} className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>{exercise.name}</li>
                ))}
              </ul>
            </div>
          </div>
          <div className="items-center px-4 py-3">
            <button
              id="ok-btn"
              className={`px-4 py-2 ${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white text-base font-medium rounded-md w-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300`}
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WorkoutPlanModal;