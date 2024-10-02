// src/components/WorkoutPlanCard.jsx

import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useGymContext } from '../context/GymContext';
import { useAuth } from '../context/AuthContext';
import { FiPlay, FiEdit, FiTrash2, FiShare2, FiUser, FiEyeOff } from 'react-icons/fi';
import { PiBarbellBold, PiHeartbeatBold } from "react-icons/pi";

function WorkoutPlanCard({ plan, onStart, onEdit, onDelete }) {
  const { darkMode } = useTheme();
  const { shareWorkoutPlan, deleteWorkoutPlan, showToast } = useGymContext();
  const { user } = useAuth();
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [shareLink, setShareLink] = useState('');
  const [isSharing, setIsSharing] = useState(false);

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

  const confirmDelete = async (e) => {
    e.stopPropagation();
    try {
      await deleteWorkoutPlan(plan._id);
      setIsDeleteConfirmOpen(false);
    } catch (error) {
      console.error('Error deleting workout plan:', error);
    }
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

  const ActionButton = ({ action, style, icon, text, disabled = false }) => (
    <button 
      onClick={(e) => handleAction(action, e)}
      className={`${buttonStyles.base} ${style} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} text-[10px] sm:text-xs`}
      disabled={disabled}
    >
      {icon}
      <span className="ml-1 hidden sm:inline">{text}</span>
    </button>
  );

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


  const DeleteConfirmation = () => (
    <div className="absolute inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center rounded-lg z-10">
      <div className="bg-white dark:bg-gray-700 p-4 rounded-lg text-center">
        <p className="mb-4 text-sm">
          {plan.isDefault && !user.isAdmin
            ? "Are you sure you want to remove this workout plan from your view?"
            : "Are you sure you want to delete this workout plan?"}
        </p>
        <div className="flex justify-center space-x-2">
          <button onClick={confirmDelete} className={`${buttonStyles.base} ${buttonStyles.delete}`}>
            {plan.isDefault && !user.isAdmin ? <FiEyeOff className="mr-1" /> : <FiTrash2 className="mr-1" />}
            {plan.isDefault && !user.isAdmin ? "Yes, Remove" : "Yes, Delete"}
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
    
    if (plan.isDefault) {
      showToast('warn', 'Warning', 'Only user-created plans can be shared at the moment');
      return;
    }

    setIsSharing(true);
    try {
      console.log('Sharing plan with ID:', plan._id);
      const link = await shareWorkoutPlan(plan._id);
      setShareLink(link);
      // showToast('success', 'Success', 'Workout plan shared successfully');
    } catch (error) {
      console.error('Error sharing workout plan:', error);
      showToast('error', 'Error', `Failed to share workout plan: ${error.message}`);
    } finally {
      setIsSharing(false);
    }
  };

  const copyToClipboard = (text) => {
    if (navigator.clipboard && window.isSecureContext) {
      // Use the Clipboard API when available
      navigator.clipboard.writeText(text).then(() => {
        showToast('success', 'Success', 'Link copied to clipboard');
      }, () => {
        showToast('error', 'Error', 'Failed to copy link');
      });
    } else {
      // Fallback to a manual method
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        showToast('success', 'Success', 'Link copied to clipboard');
      } catch (err) {
        showToast('error', 'Error', 'Failed to copy link');
      }
      document.body.removeChild(textArea);
    }
  };

  return (
    <div className={`row relative border rounded-lg p-4 mb-4 ${darkMode ? 'text-white' : 'bg-white text-gray-800'} transition-transform duration-300 hover:shadow-xl`}>
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg sm:text-xl font-semibold">{plan.name}</h3>
        <TypeIcon />
      </div>
      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mb-2">
        Scheduled: {plan.scheduledDate ? new Date(plan.scheduledDate).toLocaleDateString() : 'Not scheduled'}
      </p>
      {isImported && (
        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mb-2 flex items-center">
          <FiUser className="mr-1" />
          Imported from {plan.importedFrom.username}
        </p>
      )}
      <div className="mb-4 max-h-20 sm:max-h-40 overflow-y-auto">
        <h4 className="text-xs sm:text-sm font-semibold mb-1">Exercises:</h4>
        <ul className="list-disc list-inside text-xs sm:text-sm">
          {plan.exercises.map((exercise) => (
            <li key={exercise._id} className="mb-1">
              <span className="font-medium">{exercise.name}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="flex flex-wrap justify-between mt-4 gap-2">
        <ActionButton action={onStart} style={buttonStyles.start} icon={<FiPlay className="w-3 h-3 sm:w-4 sm:h-4" />} text="Start" />
        {(!plan.isDefault || user.isAdmin) && (
          <ActionButton action={onEdit} style={buttonStyles.edit} icon={<FiEdit className="w-3 h-3 sm:w-4 sm:h-4" />} text="Edit" />
        )}
        <ActionButton 
          action={onDelete} 
          style={buttonStyles.delete} 
          icon={plan.isDefault && !user.isAdmin ? <FiEyeOff className="w-3 h-3 sm:w-4 sm:h-4" /> : <FiTrash2 className="w-3 h-3 sm:w-4 sm:h-4" />} 
          text={plan.isDefault && !user.isAdmin ? "Remove" : "Delete"} 
        />
        <ActionButton 
          action={handleShare} 
          style={buttonStyles.share} 
          icon={<FiShare2 className="w-3 h-3 sm:w-4 sm:h-4" />} 
          text={isSharing ? "Sharing..." : "Share"} 
          disabled={isSharing}
        />
      </div>
      {shareLink && (
        <div className="mt-4">
          <p className="text-xs sm:text-sm">Share this link:</p>
          <div className="flex">
            <input
              type="text"
              value={shareLink}
              readOnly
              className="w-full p-2 mt-2 border rounded-l text-xs sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              onClick={(e) => e.target.select()}
            />
            <button
              onClick={() => copyToClipboard(shareLink)}
              className="bg-emerald-500 text-white px-2 mt-2 rounded-r hover:bg-emerald-600"
            >
              Copy
            </button>
          </div>
        </div>
      )}
      {isDeleteConfirmOpen && <DeleteConfirmation />}
    </div>
  );
}

export default WorkoutPlanCard;