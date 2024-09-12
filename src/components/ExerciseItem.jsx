import React, { useState } from 'react';
import { FiEdit, FiTrash2, FiPlus, FiTarget, FiUser } from 'react-icons/fi';

function ExerciseItem({ exercise, onClick, onEdit, onDelete, onAddToPlan }) {
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
    base: 'text-xs font-semibold py-2 px-3 rounded-full transition-all duration-300 flex items-center justify-center',
    edit: 'bg-emerald-500 hover:bg-emerald-600 text-white',
    delete: 'bg-emerald-500 hover:bg-emerald-600 text-white',
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


  return (
    <div 
      className="group relative bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl cursor-pointer h-full flex flex-col"
      onClick={() => onClick(exercise)}
    >
      <div className="relative h-48 overflow-hidden">
        <img 
          src={exercise.imageUrl} 
          alt={exercise.name} 
          className="w-full h-full object-cover transition-transform duration-300 transform group-hover:scale-110"
        />
        <div className={`absolute top-2 right-2 ${categoryColors[exercise.category] || 'bg-gray-500 text-white'} rounded-full px-3 py-1 text-xs font-semibold shadow-md`}>
          {exercise.category}
        </div>
      </div>
      <div className="p-4 flex-grow flex flex-col">
        <h3 className="font-heading text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">{exercise.name}</h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 flex-grow line-clamp-3">{exercise.description}</p>
        <div className="flex items-center text-gray-500 dark:text-gray-400 text-xs mb-2">
          <FiTarget className="mr-1" />
          <span>{Array.isArray(exercise.target) ? exercise.target.join(', ') : exercise.target}</span>
        </div>
        {exercise.importedFrom && exercise.importedFrom.username && (
          <div className="flex items-center text-gray-500 dark:text-gray-400 text-xs mb-2">
            <FiUser className="mr-1" />
            <span>Imported from {exercise.importedFrom.username}</span>
          </div>
        )}
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-white dark:bg-gray-800 bg-opacity-90 dark:bg-opacity-90 transition-opacity duration-300 opacity-0 group-hover:opacity-100">
        <div className="flex justify-between space-x-2">
          <ActionButton action={onEdit} style={buttonStyles.edit} icon={<FiEdit />} text="Edit" />
          <ActionButton action={onDelete} style={buttonStyles.delete} icon={<FiTrash2 />} text="Delete" />
          <ActionButton action={onAddToPlan} style={buttonStyles.addToPlan} icon={<FiPlus />} text="Add to Plan" />
        </div>
      </div>
      {isDeleteConfirmOpen && <DeleteConfirmation />}
    </div>
  );
}

export default ExerciseItem;