// src/pages/ExerciseLibrary.jsx

import React, { useState, useEffect } from 'react';
import ExerciseItem from '../components/ExerciseItem';
import AddExerciseForm from '../components/AddExerciseForm';
import WorkoutPlanSelector from '../components/WorkoutPlanSelector';
import { useGymContext } from '../context/GymContext';
import { useNotification } from '../context/NotificationContext';

function ExerciseLibrary() {
  const { exercises, updateExercise, deleteExercise, addExerciseToPlan } = useGymContext();
  const { addNotification } = useNotification();
  const [editingExercise, setEditingExercise] = useState(null);
  const [showWorkoutPlanSelector, setShowWorkoutPlanSelector] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [filterText, setFilterText] = useState('');
  const [filteredExercises, setFilteredExercises] = useState(exercises);

  useEffect(() => {
    const lowercasedFilter = filterText.toLowerCase();
    const filtered = exercises.filter(exercise => 
      exercise.name.toLowerCase().includes(lowercasedFilter) ||
      exercise.description.toLowerCase().includes(lowercasedFilter) ||
      exercise.target.toLowerCase().includes(lowercasedFilter)
    );
    setFilteredExercises(filtered);
  }, [filterText, exercises]);

  const handleEdit = (exercise) => {
    setEditingExercise(exercise);
  };

  const handleDelete = (id) => {
    deleteExercise(id);
  };

  const handleSave = (savedExercise) => {
    setEditingExercise(null);
  };

  const handleAddToPlan = (exercise) => {
    setSelectedExercise(exercise);
    setShowWorkoutPlanSelector(true);
  };

  const handleSelectWorkoutPlan = async (plan) => {
    if (!selectedExercise || !selectedExercise._id) {
      addNotification('No exercise selected', 'error');
      return;
    }
    
    console.log('Selected exercise:', selectedExercise);
    console.log('Selected plan:', plan);
    console.log(`Attempting to add exercise ${selectedExercise._id} to plan ${plan._id}`);
    
    const result = await addExerciseToPlan(plan._id, selectedExercise._id);
    
    if (result.success) {
      addNotification(`Exercise added to ${plan.name}`, 'success');
    } else if (result.alreadyInPlan) {
      // The notification is already handled in the GymContext
    } else {
      // The error notification is already handled in the GymContext
    }
    
    setShowWorkoutPlanSelector(false);
    setSelectedExercise(null);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Exercise Library</h1>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Filter exercises..."
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>
      <AddExerciseForm onSave={handleSave} initialExercise={editingExercise} />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredExercises.map((exercise) => (
          <ExerciseItem 
            key={exercise._id} 
            exercise={exercise}
            onEdit={() => handleEdit(exercise)}
            onDelete={() => handleDelete(exercise._id)}
            onAddToPlan={() => handleAddToPlan(exercise)}
          />
        ))}
      </div>
      {showWorkoutPlanSelector && (
        <WorkoutPlanSelector
          onSelect={handleSelectWorkoutPlan}
          onClose={() => setShowWorkoutPlanSelector(false)}
        />
      )}
    </div>
  );
}

export default ExerciseLibrary;