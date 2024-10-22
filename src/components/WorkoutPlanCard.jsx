// src/components/WorkoutPlanCard.jsx

import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useGymContext } from '../context/GymContext';
import { useAuth } from '../context/AuthContext';
import { FiPlay, FiEdit, FiTrash2, FiShare2, FiUser, FiEyeOff, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { PiBarbellBold, PiHeartbeatBold } from "react-icons/pi";
import { useTranslation } from 'react-i18next';

function WorkoutPlanCard({ plan, onStart, onEdit, onDelete }) {
  const { darkMode } = useTheme();
  const { shareWorkoutPlan, deleteWorkoutPlan, showToast } = useGymContext();
  const { user } = useAuth();
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [shareLink, setShareLink] = useState('');
  const [isSharing, setIsSharing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const { t } = useTranslation();
  const cardRef = useRef(null);

  // Determine if the plan was imported
  const isImported = plan.importedFrom && plan.importedFrom.username && !plan.isDefault;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (cardRef.current && !cardRef.current.contains(event.target)) {
        setShareLink('');
        setLinkCopied(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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
    base: 'text-xs font-semibold p-2 rounded transition-all duration-300 flex items-center justify-center',
    start: 'bg-emerald-500 hover:bg-emerald-600 text-white',
    edit: 'bg-emerald-500 hover:bg-emerald-600 text-white',
    delete: 'bg-emerald-500 hover:bg-emerald-600 text-white',
    share: 'bg-emerald-500 hover:bg-emerald-600 text-white'
  };

  const ActionButton = ({ action, style, icon, label }) => (
    <button 
      onClick={(e) => handleAction(action, e)}
      className={`${buttonStyles.base} ${style} opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0`}
      aria-label={label}
    >
      {icon}
    </button>
  );

  const DeleteConfirmation = () => (
    <div className="absolute inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center rounded-lg z-10">
      <div className="bg-white dark:bg-gray-700 p-4 rounded-lg text-center">
        <p className="mb-4 text-sm">
          {t(plan.isDefault && !user.isAdmin
            ? "Are you sure you want to remove this workout plan from your view?"
            : "Are you sure you want to delete this workout plan?")}
        </p>
        <div className="flex justify-center space-x-2">
          <button onClick={confirmDelete} className={`${buttonStyles.base} ${buttonStyles.delete}`}>
            {plan.isDefault && !user.isAdmin ? <FiEyeOff className="mr-1" /> : <FiTrash2 className="mr-1" />}
            {t(plan.isDefault && !user.isAdmin ? "Yes" : "Yes")}
          </button>
          <button onClick={cancelDelete} className={`${buttonStyles.base} bg-gray-300 text-gray-800 hover:bg-gray-400`}>
            {t("Cancel")}
          </button>
        </div>
      </div>
    </div>
  );

  const handleShare = async (e) => {
    if (e && e.stopPropagation) {
      e.stopPropagation();
    }
    if (plan.isDefault) {
      showToast('warn', 'Warning', t("Only user-created plans can be shared at the moment"));
      return;
    }
  
    setIsSharing(true);
    try {
      const link = await shareWorkoutPlan(plan._id);
      setShareLink(link);
      setLinkCopied(false);
    } catch (error) {
      console.error('Error sharing workout plan:', error);
      showToast('error', 'Error', `Failed to share workout plan: ${error.message}`);
    } finally {
      setIsSharing(false);
    }
  };

  const copyToClipboard = (text) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        showToast('success', 'Success', t("Link copied to clipboard"));
        setLinkCopied(true);
      }, () => {
        showToast('error', 'Error', t("Failed to copy link"));
      });
    } else {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        const successful = document.execCommand('copy');
        if (successful) {
          showToast('success', 'Success', t("Link copied to clipboard"));
          setLinkCopied(true);
        } else {
          showToast('error', 'Error', t("Failed to copy link"));
        }
      } catch (err) {
        console.error('Error copying text: ', err);
        showToast('error', 'Error', t("Failed to copy link"));
      }
      document.body.removeChild(textArea);
    }
  };

  const typeIcons = {
    strength: <PiBarbellBold size={20} />,
    cardio: <PiHeartbeatBold size={20} />,
    flexibility: null,
    other: null
  };

  const TypeIcon = () => (
    <div className="absolute top-2 right-2 w-8 h-8 bg-white dark:bg-gray-800 rounded-full shadow-md flex items-center justify-center">
      {typeIcons[plan.type]}
    </div>
  );

  return (
    <div 
      ref={cardRef}
      className={`row group relative bg-white dark:bg-gray-800 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-2xl cursor-pointer h-full flex flex-col`}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <TypeIcon />
      <div className="p-4 flex-grow flex flex-col">
        <h3 className="text-lg sm:text-xl font-semibold mb-2">{plan.name}</h3>
        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mb-2">
          {plan.scheduledDate ? new Date(plan.scheduledDate).toLocaleDateString() : t("Not scheduled")}
        </p>
        {isImported && (
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mb-2 flex items-center">
            <FiUser className="mr-1" />
            {t("Imported from")} {plan.importedFrom.username}
          </p>
        )}
        <div className={`overflow-hidden transition-max-height duration-300 ease-in-out ${isExpanded ? 'max-h-96' : 'max-h-20'}`}>
          <h4 className="text-xs sm:text-sm font-semibold mb-1">{t("Exercises")}</h4>
          <ul className="list-disc list-inside text-xs sm:text-sm">
            {plan.exercises.map((exercise) => (
              <li key={exercise._id} className="mb-1">
                <span className="font-medium">{exercise.name}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-4 mb-8">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            className="text-blue-500 hover:text-blue-700 text-sm"
          >
            {isExpanded ? <FiChevronUp className="inline mr-1" /> : <FiChevronDown className="inline mr-1" />}
            {t(isExpanded ? "Show less" : "Show more")}
          </button>
        </div>
        {shareLink && !linkCopied && (
          <div className="mt-2 p-2 bg-gray-100 dark:bg-gray-700 rounded">
            <p className="text-xs sm:text-sm mb-1">{t("Share this link:")}</p>
            <div className="flex">
              <input
                type="text"
                value={shareLink}
                readOnly
                className="flex-grow p-1 text-xs sm:text-sm bg-white dark:bg-gray-600 border rounded-l"
                onClick={(e) => e.target.select()}
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  copyToClipboard(shareLink);
                }}
                className="bg-emerald-500 text-white px-2 rounded-r text-xs sm:text-sm"
              >
                {t("Copy")}
              </button>
            </div>
          </div>
        )}
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-2 bg-white dark:bg-gray-800 bg-opacity-90 dark:bg-opacity-90 transition-opacity duration-300 opacity-0 group-hover:opacity-100">
        <div className="flex justify-end space-x-2">
          <ActionButton action={onStart} style={buttonStyles.start} icon={<FiPlay />} label={t("Start workout")} />
          {(!plan.isDefault || user.isAdmin) && (
            <ActionButton action={onEdit} style={buttonStyles.edit} icon={<FiEdit />} label={t("Edit plan")} />
          )}
          <ActionButton 
            action={onDelete} 
            style={buttonStyles.delete} 
            icon={plan.isDefault && !user.isAdmin ? <FiEyeOff /> : <FiTrash2 />} 
            label={t(plan.isDefault && !user.isAdmin ? "Remove plan" : "Delete plan")} 
          />
          <ActionButton 
            action={handleShare} 
            style={buttonStyles.share} 
            icon={<FiShare2 />} 
            label={t(isSharing ? "Sharing..." : "Share plan")} 
          />
        </div>
      </div>
      {isDeleteConfirmOpen && <DeleteConfirmation />}
    </div>
  );
}

export default WorkoutPlanCard;