// src/components/WorkoutPlanCard.jsx

import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
// Import icons from react-icons
import { FiPlay, FiEdit, FiTrash2 } from 'react-icons/fi';

function WorkoutPlanCard({ plan, onStart, onEdit, onDelete }) {
  const { darkMode } = useTheme();
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const handleAction = (action, e) => {
    e.stopPropagation();
    if (action === onDelete) {
      setIsDeleteConfirmOpen(true);
    } else {
      action(plan);
    }
  };

  const confirmDelete = (e) => {
    e.stopPropagation();
    onDelete(plan._id);
    setIsDeleteConfirmOpen(false);
  };

  const cancelDelete = (e) => {
    e.stopPropagation();
    setIsDeleteConfirmOpen(false);
  };

  const typeColors = {
    strength: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    cardio: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    flexibility: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    other: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
  };

  const buttonStyles = {
    base: 'text-xs font-semibold py-1 px-2 rounded transition-all duration-200 flex items-center justify-center',
    start: 'bg-emerald-500 text-white hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700 hover:shadow-md',
    edit: 'bg-emerald-500 text-white hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700 hover:shadow-md',
    delete: 'bg-emerald-500 text-white hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700 hover:shadow-md'
  };

  const TypeBadge = () => (
    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${typeColors[plan.type] || typeColors.other}`}>
      {plan.type || 'Other'}
    </span>
  );

  const ActionButton = ({ action, style, icon, text }) => (
    <button 
      onClick={(e) => handleAction(action, e)}
      className={`${buttonStyles.base} ${style}`}
    >
      {icon}
      <span className="ml-1">{text}</span>
    </button>
  );

  const DeleteConfirmation = () => (
    <div className="absolute inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center rounded-lg z-10">
      <div className="bg-white dark:bg-gray-700 p-4 rounded-lg text-center">
        <p className="mb-4 text-sm">Are you sure you want to delete this workout plan?</p>
        <div className="flex justify-center space-x-2">
          <button onClick={confirmDelete} className={`${buttonStyles.base} ${buttonStyles.delete}`}>
            <FiTrash2 className="mr-1" />
            Yes, Delete
          </button>
          <button onClick={cancelDelete} className={`${buttonStyles.base} bg-gray-300 text-gray-800 hover:bg-gray-400`}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`relative border rounded-lg p-4 mb-4 shadow-sm ${darkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-800'} transition-transform duration-300 hover:scale-105`}>
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-xl font-semibold">{plan.name}</h3>
        <TypeBadge />
      </div>
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
        <ActionButton action={onStart} style={buttonStyles.start} icon={<FiPlay className="mr-1" />} text="Start Workout" />
        <ActionButton action={onEdit} style={buttonStyles.edit} icon={<FiEdit className="mr-1" />} text="Edit Plan" />
        <ActionButton action={onDelete} style={buttonStyles.delete} icon={<FiTrash2 className="mr-1" />} text="Delete Plan" />
      </div>
      {isDeleteConfirmOpen && <DeleteConfirmation />}
    </div>
  );
}

export default WorkoutPlanCard;