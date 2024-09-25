// src/components/ExerciseItem.jsx
import React, { useState } from 'react';
import { FiEdit, FiTrash2, FiPlus, FiTarget, FiUser, FiMove, FiEye } from 'react-icons/fi';
import { PiBarbellBold, PiHeartbeatBold } from "react-icons/pi";
import { useAuth } from '../context/AuthContext';
import '../components/ExerciseItem.css';

function ExerciseItem({ exercise, onEdit, onDelete, onAddToPlan, onView, isDragging }) {
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

  const ActionButton = ({ action, style, icon }) => (
    <button 
      onClick={(e) => handleAction(action, e)}
      className={`${buttonStyles.base} ${style} opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0`}
    >
      {icon}
    </button>
  );

  const DeleteConfirmation = () => (
    <div className="absolute inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center rounded-lg z-10">
      <div className="bg-white dark:bg-gray-700 p-4 rounded-lg text-center">
        <p className="mb-4 text-sm">Are you sure you want to delete this exercise?</p>
        <div className="flex justify-center space-x-2">
          <button onClick={confirmDelete} className={`${buttonStyles.base} ${buttonStyles.delete}`}>Yes, Delete</button>
          <button onClick={cancelDelete} className={`${buttonStyles.base} bg-gray-300 text-gray-800 hover:bg-gray-400`}>Cancel</button>
        </div>
      </div>
    </div>
  );

  const isImported = exercise.importedFrom && exercise.importedFrom.username;

  const experienceLevel = user?.experienceLevel || 'beginner';
  const recommendations = exercise.recommendations?.[experienceLevel] || {};

  return (
    <div 
      className={`row group relative bg-white dark:bg-gray-800 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-2xl cursor-move h-full flex flex-col ${isDragging ? 'opacity-50' : ''}`}
    >
      <div className="relative h-48 overflow-hidden">
        <img 
          src={exercise.imageUrl} 
          alt={exercise.name} 
          className="w-full h-full object-cover transition-transform duration-300 transform group-hover:scale-110"
        />
        <div className="absolute top-2 right-2 w-8 h-8 bg-white dark:bg-gray-800 rounded-full shadow-md flex items-center justify-center">
          {categoryIcons[exercise.category]}
        </div>
      </div>
      <div className="p-4 flex-grow flex flex-col">
        <h3 className="font-heading text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">{exercise.name}</h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 flex-grow line-clamp-3">{exercise.description}</p>
        <div className="flex items-center text-gray-500 dark:text-gray-400 text-xs mb-2">
          <FiTarget className="mr-1" />
          <span>{Array.isArray(exercise.target) ? exercise.target.join(', ') : exercise.target}</span>
        </div>
        {exercise.category === 'Strength' && (
          <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            <p>Recommended for {experienceLevel}s:</p>
            <p>Weight: {recommendations.weight || 0} kg</p>
            <p>Reps: {recommendations.reps || 0}</p>
            <p>Sets: {recommendations.sets || 0}</p>
          </div>
        )}
        {isImported && (
          <div className="flex items-center text-gray-500 dark:text-gray-400 text-xs mb-2">
            <FiUser className="mr-1" />
            <span>Imported from {exercise.importedFrom.username}</span>
          </div>
        )}
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-2 bg-white dark:bg-gray-800 bg-opacity-90 dark:bg-opacity-90 transition-opacity duration-300 opacity-0 group-hover:opacity-100">
        <div className="flex justify-end space-x-2">
          <ActionButton action={onView} style={buttonStyles.view} icon={<FiEye />} />
          <ActionButton action={onEdit} style={buttonStyles.edit} icon={<FiEdit />} />
          <ActionButton action={onDelete} style={buttonStyles.delete} icon={<FiTrash2 />} />
          <ActionButton action={onAddToPlan} style={buttonStyles.addToPlan} icon={<FiPlus />} />
        </div>
      </div>
      {isDeleteConfirmOpen && <DeleteConfirmation />}
    </div>
  );
}

export default ExerciseItem;