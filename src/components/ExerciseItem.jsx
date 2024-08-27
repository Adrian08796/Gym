// src/components/ExerciseItem.jsx

import React, { useState } from 'react';
import { FiEdit, FiTrash2, FiPlus, FiTarget } from 'react-icons/fi';

function ExerciseItem({ exercise, onClick, onEdit, onDelete, onAddToPlan }) {
  const [isHovered, setIsHovered] = useState(false);

  const handleAction = (action, e) => {
    e.stopPropagation();
    action(exercise);
  };

  const categoryColors = {
    Strength: 'from-red-400 to-red-600',
    Cardio: 'from-blue-400 to-blue-600',
    Flexibility: 'from-green-400 to-green-600'
  };

  const buttonStyles = {
    base: 'text-xs font-semibold py-2 px-3 rounded-full transition-all duration-300 flex items-center justify-center',
    edit: 'bg-indigo-500 hover:bg-indigo-600 text-white',
    delete: 'bg-rose-500 hover:bg-rose-600 text-white',
    addToPlan: 'bg-emerald-500 hover:bg-emerald-600 text-white'
  };

  const ActionButton = ({ action, style, icon, text }) => (
    <button 
      onClick={(e) => handleAction(action, e)}
      className={`${buttonStyles.base} ${style} opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0`}
    >
      {icon}
      <span className="ml-1">{text}</span>
    </button>
  );

  return (
    <div 
      className="group relative bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl cursor-pointer h-full flex flex-col"
      onClick={() => onClick(exercise)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative h-48 overflow-hidden">
        <img 
          src={exercise.imageUrl} 
          alt={exercise.name} 
          className="w-full h-full object-cover transition-transform duration-300 transform group-hover:scale-110"
        />
        <div className={`absolute inset-0 bg-gradient-to-b ${categoryColors[exercise.category] || 'from-gray-400 to-gray-600'} opacity-50`}></div>
        <div className="absolute top-2 right-2 bg-white dark:bg-gray-800 rounded-full px-3 py-1 text-xs font-semibold text-gray-700 dark:text-gray-300 shadow-md">
          {exercise.category}
        </div>
      </div>
      <div className="p-4 flex-grow flex flex-col">
        <h3 className="font-heading text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">{exercise.name}</h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 flex-grow line-clamp-3">{exercise.description}</p>
        <div className="flex items-center text-gray-500 dark:text-gray-400 text-xs mb-4">
          <FiTarget className="mr-1" />
          <span>{Array.isArray(exercise.target) ? exercise.target.join(', ') : exercise.target}</span>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white dark:from-gray-800 to-transparent">
        <div className="flex justify-between space-x-2">
          <ActionButton action={onEdit} style={buttonStyles.edit} icon={<FiEdit />} text="Edit" />
          <ActionButton action={onDelete} style={buttonStyles.delete} icon={<FiTrash2 />} text="Delete" />
          <ActionButton action={onAddToPlan} style={buttonStyles.addToPlan} icon={<FiPlus />} text="Add to Plan" />
        </div>
      </div>
    </div>
  );
}

export default ExerciseItem;