// src/components/WorkoutPlanModal.jsx

import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';

function WorkoutPlanModal({ plan, onClose, onEdit, onStart }) {
  const { t } = useTranslation();
  const { darkMode } = useTheme();

  if (!plan) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50" id="my-modal">
      <div className={`relative mx-auto p-5 border w-full max-w-md shadow-lg rounded-md ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}>
        <div className="mt-3">
          <h3 className="text-lg leading-6 font-medium">{plan.name}</h3>
          <div className="mt-2 px-7 py-3">
            <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
              {t("Type")}: {plan.type || 'Not specified'}
            </p>
            <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
              {t("Scheduled")}: {plan.scheduledDate ? new Date(plan.scheduledDate).toLocaleString() : 'Not scheduled'}
            </p>
            <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
              {t("Status")}: {plan.completed ? 'Completed' : 'Scheduled'}
            </p>
            <div className="mt-4">
              <h4 className="text-md font-medium">{t("Exercises")}:</h4>
              <ul className="list-disc list-inside">
                {plan.exercises.map((exercise, index) => (
                  <li key={exercise._id || index} className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                    {exercise.name}
                    {exercise.importedFrom && (
                      <span className="text-xs ml-2">
                        ({t("Imported from")} {exercise.importedFrom.username})
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="flex justify-between items-center px-4 py-3">
            <button
              className={`px-4 py-2 ${darkMode ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600'} text-white text-base font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-300`}
              onClick={() => {
                onEdit(plan);
                onClose();
              }}
            >
              {t("Edit")}
            </button>
            <button
              className={`px-4 py-2 ${darkMode ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600'} text-white text-base font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-300`}
              onClick={() => {
                onStart(plan);
                onClose();
              }}
            >
              {t("Start Workout")}
            </button>
            <button
              className={`px-4 py-2 ${darkMode ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600'} text-white text-base font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-300`}
              onClick={onClose}
            >
              {t("Close")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WorkoutPlanModal;