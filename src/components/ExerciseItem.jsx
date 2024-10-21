// src/components/ExerciseItem.jsx

import React, { useState, useMemo } from 'react';
import { FiEdit, FiTrash2, FiPlus, FiTarget, FiUser, FiEye } from 'react-icons/fi';
import { PiBarbellBold, PiHeartbeatBold } from "react-icons/pi";
import { useAuth } from '../context/AuthContext';
import '../components/ExerciseItem.css';
import { useTranslation } from 'react-i18next';

function ExerciseItem({ exercise, onEdit, onDelete, onAddToPlan, onView, isDragging }) {
  const { t } = useTranslation();
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const { user } = useAuth();

  const handleAction = (action, e) => {
    e.stopPropagation();
    if (action === onDelete) {
      setIsDeleteConfirmOpen(true);
    } else {
      action(exercise);
    }
  };

  const confirmDelete = (e) => {
    e.stopPropagation();
    onDelete(exercise);
    setIsDeleteConfirmOpen(false);
  };

  const cancelDelete = (e) => {
    e.stopPropagation();
    setIsDeleteConfirmOpen(false);
  };

  const categoryIcons = {
    Strength: <PiBarbellBold size={20} />,
    Cardio: <PiHeartbeatBold size={20} />,
    Flexibility: null // You can add an icon for Flexibility if desired
  };

  const buttonStyles = {
    base: 'text-xs font-semibold p-2 rounded transition-all duration-300 flex items-center justify-center',
    edit: 'bg-emerald-500 hover:bg-emerald-600 text-white',
    delete: 'bg-emerald-500 hover:bg-emerald-600 text-white',
    addToPlan: 'bg-emerald-500 hover:bg-emerald-600 text-white',
    view: 'bg-emerald-500 hover:bg-emerald-600 text-white'
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
        <p className="mb-4 text-sm">{t("Are you sure you want to delete this exercise?")}</p>
        <div className="flex justify-center space-x-2">
          <button onClick={confirmDelete} className={`${buttonStyles.base} ${buttonStyles.delete}`}>{t("Yes")}</button>
          <button onClick={cancelDelete} className={`${buttonStyles.base} bg-gray-300 text-gray-800 hover:bg-gray-400`}>{t("Cancel")}</button>
        </div>
      </div>
    </div>
  );

  const isImported = exercise.importedFrom && exercise.importedFrom.username;
  const experienceLevel = useMemo(() => {
    return user?.experienceLevel || t("beginner");
  }, [user]);

  const userExerciseData = useMemo(() => {
    return exercise.userExercises?.find(ue => ue.user === user.id) || {};
  }, [exercise.userExercises, user.id]);

  const recommendation = useMemo(() => {
    if (userExerciseData.recommendation) {
      return userExerciseData.recommendation;
    }
    if (exercise.recommendations && exercise.recommendations[experienceLevel]) {
      return exercise.recommendations[experienceLevel];
    }
    // Provide a default recommendation if none is found
    return { weight: 0, reps: 0, sets: 0, duration: 0, distance: 0, intensity: 0, incline: 0 };
  }, [userExerciseData, exercise.recommendations, experienceLevel]);

  const displayName = userExerciseData.name || exercise.name;
  const displayDescription = t(userExerciseData.description || exercise.description);
  const displayTarget = userExerciseData.target || exercise.target;
  const displayImageUrl = userExerciseData.imageUrl || exercise.imageUrl;

  const renderRecommendation = () => {
    if (exercise.category === 'Strength') {
      return (
        <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          <p>{t("Your Recommendation")}</p>
          <p>{t("Weight")}: {recommendation?.weight || 0} kg</p>
          <p>{t("Reps")}: {recommendation?.reps || 0}</p>
          <p>{t("Sets")}: {recommendation?.sets || 0}</p>
        </div>
      );
    } else if (exercise.category === 'Cardio') {
      return (
        <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          <p>{t("Your Recommendation")}:</p>
          <p>{t("Duration")}: {recommendation?.duration || 0} {t("minutes")}</p>
          {recommendation?.distance && <p>{t("Distance")}: {recommendation.distance} km</p>}
          {recommendation?.intensity && <p>{t("Intensity")}: {recommendation.intensity}</p>}
          {recommendation?.incline && <p>{t("Incline")}: {recommendation.incline}%</p>}
        </div>
      );
    }
    return null;
  };

  return (
    <div 
      className={`row group relative bg-white dark:bg-gray-800 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-2xl cursor-move h-full flex flex-col ${isDragging ? 'opacity-50' : ''}`}
    >
      <div className="relative h-48 overflow-hidden">
        <img 
          src={displayImageUrl} 
          alt={displayName} 
          className="w-full h-full object-cover transition-transform duration-300 transform group-hover:scale-110"
        />
        <div className="absolute top-2 right-2 w-8 h-8 bg-white dark:bg-gray-800 rounded-full shadow-md flex items-center justify-center">
          {categoryIcons[exercise.category]}
        </div>
      </div>
      <div className="p-4 flex-grow flex flex-col">
        <h3 className="font-heading text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">{displayName}</h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 flex-grow line-clamp-3">{displayDescription}</p>
        <div className="flex items-center text-gray-500 dark:text-gray-400 text-xs mb-2">
          <FiTarget className="mr-1" />
          <span>
            {Array.isArray(displayTarget) 
              ? displayTarget.join(', ') 
              : typeof displayTarget === 'string' 
                ? displayTarget 
                : t('No target specified')}
          </span>
        </div>
        {renderRecommendation()}
        {isImported && (
          <div className="flex items-center text-gray-500 dark:text-gray-400 text-xs mb-2">
            <FiUser className="mr-1" />
            <span>{t("Imported from")} {exercise.importedFrom.username}</span>
          </div>
        )}
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-2 bg-white dark:bg-gray-800 bg-opacity-90 dark:bg-opacity-90 transition-opacity duration-300 opacity-0 group-hover:opacity-100">
        <div className="flex justify-end space-x-2">
          <ActionButton action={onView} style={buttonStyles.view} icon={<FiEye />} label={t("View exercise")} />
          <ActionButton action={onEdit} style={buttonStyles.edit} icon={<FiEdit />} label={t("Edit exercise")} />
          <ActionButton action={onDelete} style={buttonStyles.delete} icon={<FiTrash2 />} label={t("Delete exercise")} />
          <ActionButton action={onAddToPlan} style={buttonStyles.addToPlan} icon={<FiPlus />} label={t("Add to plan")} />
        </div>
      </div>
      {isDeleteConfirmOpen && <DeleteConfirmation />}
    </div>
  );
}

export default ExerciseItem;