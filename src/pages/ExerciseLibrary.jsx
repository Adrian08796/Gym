// src/pages/ExerciseLibrary.jsx

import React, { useState, useEffect, useMemo } from 'react';
import ExerciseItem from '../components/ExerciseItem';
import AddExerciseForm from '../components/AddExerciseForm';
import WorkoutPlanSelector from '../components/WorkoutPlanSelector';
import ExerciseModal from '../components/ExerciseModal';
import { useGymContext } from '../context/GymContext';
import { useNotification } from '../context/NotificationContext';
import { useTheme } from '../context/ThemeContext';

const categories = ['Strength', 'Cardio', 'Flexibility'];

const categoryColors = {
  Strength: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  Cardio: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  Flexibility: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
};

function ExerciseLibrary() {
  const { exercises, updateExercise, deleteExercise, addExerciseToPlan } = useGymContext();
  const { addNotification } = useNotification();
  const { darkMode } = useTheme();
  const [editingExercise, setEditingExercise] = useState(null);
  const [showWorkoutPlanSelector, setShowWorkoutPlanSelector] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [exerciseToAddToPlan, setExerciseToAddToPlan] = useState(null);
  const [filterText, setFilterText] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [viewMode, setViewMode] = useState('grid');

  const filteredExercises = useMemo(() => {
    return exercises.filter(exercise => 
      (exercise.name.toLowerCase().includes(filterText.toLowerCase()) ||
       exercise.description.toLowerCase().includes(filterText.toLowerCase()) ||
       (Array.isArray(exercise.target) && exercise.target.some(t => t.toLowerCase().includes(filterText.toLowerCase())))) &&
      (selectedCategories.length === 0 || selectedCategories.includes(exercise.category))
    );
  }, [exercises, filterText, selectedCategories]);

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
    // Optionally, you can refresh the exercise list here
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

  const toggleViewMode = () => {
    setViewMode(viewMode === 'grid' ? 'list' : 'grid');
  };

  const toggleCategory = (category) => {
    setSelectedCategories(prev => 
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  return (
    <div className={`bg-white dark:bg-gray-900 text-gray-900 dark:text-white p-4 lg:p-8`}>
      <h1 className="text-3xl lg:text-4xl font-bold mb-6 lg:mb-8">Exercise Library</h1>
      
      <div className="mb-6 lg:mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex-grow">
          <input
            type="text"
            placeholder="Search exercises..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="w-full px-4 py-2 lg:py-3 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:text-white text-lg"
          />
        </div>
        
        <div className="flex items-center gap-4">
          <button
            onClick={toggleViewMode}
            className="px-4 py-2 lg:py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-200"
          >
            {viewMode === 'grid' ? 'List View' : 'Grid View'}
          </button>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Categories</h2>
        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => toggleCategory(category)}
              className={`px-3 py-1 rounded-full text-sm font-semibold ${
                selectedCategories.includes(category)
                  ? categoryColors[category]
                  : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>
      
      <AddExerciseForm 
        onSave={handleSave} 
        initialExercise={editingExercise}
        onCancel={handleCancelEdit}
      />
      
      <div className={`${viewMode === 'grid' ? 'grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5' : 'space-y-4'}`}>
        {filteredExercises.map((exercise) => (
          <ExerciseItem 
            key={exercise._id} 
            exercise={exercise}
            onClick={() => setSelectedExercise(exercise)}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onAddToPlan={handleAddToPlan}
            viewMode={viewMode}
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

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-2">Category Legend</h2>
        <div className="flex flex-wrap gap-4">
          {categories.map(category => (
            <div key={category} className="flex items-center">
              <span className={`w-4 h-4 rounded-full mr-2 ${categoryColors[category]}`}></span>
              <span>{category}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ExerciseLibrary;