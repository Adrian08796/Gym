// src/components/WorkoutPlanCard.jsx

import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useGymContext } from '../context/GymContext';
import { FiPlay, FiEdit, FiTrash2, FiShare2, FiUser } from 'react-icons/fi';
import { PiBarbellBold, PiHeartbeatBold } from "react-icons/pi";

function WorkoutPlanCard({ plan, onStart, onEdit, onDelete }) {
  const { darkMode } = useTheme();
  const { shareWorkoutPlan } = useGymContext();
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [shareLink, setShareLink] = useState('');

  const handleAction = (action, e) => {
    if (e && e.stopPropagation) {
      e.stopPropagation();
    }
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

  const buttonStyles = {
    base: 'text-xs font-semibold py-1 px-2 rounded transition-all duration-200 flex items-center justify-center',
    start: 'bg-emerald-500 text-white hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700 hover:shadow-md',
    edit: 'bg-emerald-500 text-white hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700 hover:shadow-md',
    delete: 'bg-emerald-500 text-white hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700 hover:shadow-md',
    share: 'bg-emerald-500 text-white hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700 hover:shadow-md'
  };

  const typeIcons = {
    strength: <PiBarbellBold size={20} />,
    cardio: <PiHeartbeatBold size={20} />,
    flexibility: null,
    other: null
  };

  const TypeIcon = () => (
    <div className="w-8 h-8 bg-white dark:bg-gray-800 rounded-full shadow-md flex items-center justify-center">
      {typeIcons[plan.type]}
    </div>
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
  // Identify if the workout plan was imported from another user
  const isImported = plan.importedFrom && plan.importedFrom.username;

  const handleShare = async (e) => {
    if (e && e.stopPropagation) {
      e.stopPropagation();
    }
    try {
      const link = await shareWorkoutPlan(plan._id);
      setShareLink(link);
    } catch (error) {
      console.error('Error sharing workout plan:', error);
    }
  };

  return (
    <div className={`row relative border rounded-lg p-4 mb-4  ${darkMode ? ' text-white' : 'bg-white text-gray-800'} transition-transform duration-300 hover:shadow-xl`}>
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-xl font-semibold">{plan.name}</h3>
        <TypeIcon />
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
        Scheduled: {plan.scheduledDate ? new Date(plan.scheduledDate).toLocaleDateString() : 'Not scheduled'}
      </p>
      {isImported && (
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-2 flex items-center">
          <FiUser className="mr-1" />
          Imported from {plan.importedFrom.username}
        </p>
      )}
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
      <div className="flex justify-between mt-4">
        <ActionButton action={onStart} style={buttonStyles.start} icon={<FiPlay className="mr-1" />} text="Start Workout" />
        <ActionButton action={onEdit} style={buttonStyles.edit} icon={<FiEdit className="mr-1" />} text="Edit Plan" />
        <ActionButton action={onDelete} style={buttonStyles.delete} icon={<FiTrash2 className="mr-1" />} text="Delete Plan" />
        <ActionButton action={handleShare} style={buttonStyles.share} icon={<FiShare2 className="mr-1" />} text="Share Plan" />
      </div>
      {shareLink && (
        <div className="mt-4">
          <p>Share this link:</p>
          <input
            type="text"
            value={shareLink}
            readOnly
            className="w-full p-2 mt-2 border rounded"
            onClick={(e) => e.target.select()}
          />
        </div>
      )}
      {isDeleteConfirmOpen && <DeleteConfirmation />}
    </div>
  );
}

export default WorkoutPlanCard;