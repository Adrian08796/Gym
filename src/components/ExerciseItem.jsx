// src/components/ExerciseItem.jsx

import React, { useState } from 'react';
import { FiEdit, FiTrash2, FiPlus } from 'react-icons/fi';

function ExerciseItem({ exercise, onClick, onEdit, onDelete, onAddToPlan, viewMode }) {
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

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

  const categoryColors = {
    Strength: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    Cardio: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    Flexibility: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
  };

  const buttonStyles = {
    base: 'text-xs font-semibold py-1 px-2 rounded transition-all duration-200 flex items-center justify-center',
    edit: 'bg-indigo-500 text-white hover:bg-indigo-600 dark:bg-indigo-600 dark:hover:bg-indigo-700 hover:shadow-md',
    delete: 'bg-rose-500 text-white hover:bg-rose-600 dark:bg-rose-600 dark:hover:bg-rose-700 hover:shadow-md',
    addToPlan: 'bg-emerald-500 text-white hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700 hover:shadow-md'
  };

  const CategoryBadge = () => (
    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${categoryColors[exercise.category] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}>
      {exercise.category}
    </span>
  );

  const ActionButton = ({ action, style, icon, text }) => (
    <button 
      onClick={(e) => handleAction(action, e)}
      className={`${buttonStyles.base} ${style}`}
    >
      <span className="mr-1">{icon}</span>
      {text}
    </button>
  );

  const DeleteConfirmation = () => (
    <div className="absolute inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center rounded-lg">
      <div className="bg-white dark:bg-gray-700 p-4 rounded-lg text-center">
        <p className="mb-4 text-sm">Are you sure you want to delete this exercise?</p>
        <div className="flex justify-center space-x-2">
          <button onClick={confirmDelete} className={`${buttonStyles.base} ${buttonStyles.delete}`}>Yes, Delete</button>
          <button onClick={cancelDelete} className={`${buttonStyles.base} bg-gray-300 text-gray-800 hover:bg-gray-400`}>Cancel</button>
        </div>
      </div>
    </div>
  );

  const Content = () => (
    <>
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-heading text-xl font-bold text-primary dark:text-blue-400">{exercise.name}</h3>
        <CategoryBadge />
      </div>
      <p className="text-gray-700 dark:text-gray-300 text-sm mb-2 line-clamp-2">{exercise.description}</p>
      <p className="text-accent dark:text-yellow-300 text-xs mb-4">
        Target: {Array.isArray(exercise.target) ? exercise.target.join(', ') : exercise.target}
      </p>
      <div className="flex justify-between mt-4">
        <ActionButton action={onEdit} style={buttonStyles.edit} icon={<FiEdit />} text="Edit" />
        <ActionButton action={onDelete} style={buttonStyles.delete} icon={<FiTrash2 />} text="Delete" />
        <ActionButton action={onAddToPlan} style={buttonStyles.addToPlan} icon={<FiPlus />} text="Add to Plan" />
      </div>
    </>
  );

  if (viewMode === 'list') {
    return (
      <div 
        className="relative bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:scale-105 cursor-pointer flex items-center"
        onClick={() => onClick(exercise)}
      >
        <img 
          src={exercise.imageUrl} 
          alt={exercise.name} 
          className="w-24 h-24 object-cover"
        />
        <div className="flex-grow p-4">
          <Content />
        </div>
        {isDeleteConfirmOpen && <DeleteConfirmation />}
      </div>
    );
  }

  return (
    <div 
      className="relative bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:scale-105 cursor-pointer"
      onClick={() => onClick(exercise)}
    >
      <img 
        src={exercise.imageUrl} 
        alt={exercise.name} 
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <Content />
      </div>
      {isDeleteConfirmOpen && <DeleteConfirmation />}
    </div>
  );
}

export default ExerciseItem;