// src/pages/ExerciseLibrary.jsx

import React, { useState, useEffect } from 'react';
import ExerciseItem from '../components/ExerciseItem';
import AddExerciseForm from '../components/AddExerciseForm';
import WorkoutPlanSelector from '../components/WorkoutPlanSelector';
import ExerciseModal from '../components/ExerciseModal';
import { useGymContext } from '../context/GymContext';
import { useNotification } from '../context/NotificationContext';

function ExerciseLibrary() {
  const { exercises, updateExercise, deleteExercise, addExerciseToPlan } = useGymContext();
  const { addNotification } = useNotification();
  const [editingExercise, setEditingExercise] = useState(null);
  const [showWorkoutPlanSelector, setShowWorkoutPlanSelector] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [exerciseToAddToPlan, setExerciseToAddToPlan] = useState(null);
  const [filterText, setFilterText] = useState('');
  const [filteredExercises, setFilteredExercises] = useState(exercises);

  useEffect(() => {
    const lowercasedFilter = filterText.toLowerCase();
    const filtered = exercises.filter(exercise => 
      exercise.name.toLowerCase().includes(lowercasedFilter) ||
      exercise.description.toLowerCase().includes(lowercasedFilter) ||
      (Array.isArray(exercise.target) && exercise.target.some(t => t.toLowerCase().includes(lowercasedFilter)))
    );
    setFilteredExercises(filtered);
  }, [filterText, exercises]);

  const handleEdit = (exercise) => {
    setEditingExercise(exercise);
    setSelectedExercise(null);
  };

  const handleDelete = (exercise) => {
    deleteExercise(exercise._id);
    setSelectedExercise(null);
  };

  const handleAddToPlan = (exercise) => {
    setExerciseToAddToPlan(exercise);
    setShowWorkoutPlanSelector(true);
  };

  const handleSave = (savedExercise) => {
    setEditingExercise(null);
  };

  const handleSelectWorkoutPlan = async (plan) => {
    if (!exerciseToAddToPlan || !exerciseToAddToPlan._id) {
      addNotification('No exercise selected', 'error');
      return;
    }
    
    const result = await addExerciseToPlan(plan._id, exerciseToAddToPlan._id);
    
    if (result.success) {
      addNotification(`Exercise added to ${plan.name}`, 'success');
    } else if (result.alreadyInPlan) {
      // The notification is already handled in the GymContext
    } else {
      // The error notification is already handled in the GymContext
    }
    
    setShowWorkoutPlanSelector(false);
    setExerciseToAddToPlan(null);
  };

  const handleCancelEdit = () => {
    setEditingExercise(null);
  };

  return (
    <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white p-4 lg:p-8">
      <h1 className="text-3xl lg:text-4xl font-bold mb-6 lg:mb-8">Exercise Library</h1>
      <div className="mb-6 lg:mb-8">
        <input
          type="text"
          placeholder="Filter exercises..."
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          className="w-full px-4 py-2 lg:py-3 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:text-white text-lg"
        />
      </div>
      <AddExerciseForm 
        onSave={handleSave} 
        initialExercise={editingExercise}
        onCancel={handleCancelEdit}
      />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
        {filteredExercises.map((exercise) => (
          <ExerciseItem 
            key={exercise._id} 
            exercise={exercise}
            onClick={() => setSelectedExercise(exercise)}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onAddToPlan={handleAddToPlan}
          />
        ))}
      </div>
      {selectedExercise && (
        <ExerciseModal
          exercise={selectedExercise}
          onClose={() => setSelectedExercise(null)}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onAddToPlan={handleAddToPlan}
        />
      )}
      {showWorkoutPlanSelector && (
        <WorkoutPlanSelector
          onSelect={handleSelectWorkoutPlan}
          onClose={() => {
            setShowWorkoutPlanSelector(false);
            setExerciseToAddToPlan(null);
          }}
        />
      )}
    </div>
  );
}

export default ExerciseLibrary;