// src/pages/ExerciseLibrary.jsx

import React, { useState, useEffect, useMemo } from 'react';
import ExerciseItem from '../components/ExerciseItem';
import AddExerciseForm from '../components/AddExerciseForm';
import WorkoutPlanSelector from '../components/WorkoutPlanSelector';
import ExerciseModal from '../components/ExerciseModal';
import { useGymContext } from '../context/GymContext';
import { useNotification } from '../context/NotificationContext';
import { useTheme } from '../context/ThemeContext';
import { FiFilter, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import './ExerciseLibrary.css';

const categories = ['Strength', 'Cardio', 'Flexibility', 'Imported'];
const muscleGroups = ['Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Legs', 'Core', 'Full Body', 'Abs'];

const categoryColors = {
  Strength: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  Cardio: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  Flexibility: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  Imported: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
};

function ExerciseLibrary() {
  const { exercises, updateExercise, deleteExercise, addExerciseToPlan, fetchExercises } = useGymContext();
  const { addNotification } = useNotification();
  const { darkMode } = useTheme();
  const [editingExercise, setEditingExercise] = useState(null);
  const [showWorkoutPlanSelector, setShowWorkoutPlanSelector] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [exerciseToAddToPlan, setExerciseToAddToPlan] = useState(null);
  const [filterText, setFilterText] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedMuscleGroups, setSelectedMuscleGroups] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    console.log('FETCHING EXERCISES::::');
    fetchExercises();
  }, [fetchExercises]);

  const filteredExercises = useMemo(() => {
    return exercises.filter(exercise => 
      (exercise.name.toLowerCase().includes(filterText.toLowerCase()) ||
       exercise.description.toLowerCase().includes(filterText.toLowerCase()) ||
       (Array.isArray(exercise.target) && exercise.target.some(t => t.toLowerCase().includes(filterText.toLowerCase())))) &&
      (selectedCategories.length === 0 || 
       (selectedCategories.includes('Imported') ? exercise.importedFrom && exercise.importedFrom.username : selectedCategories.includes(exercise.category))) &&
      (selectedMuscleGroups.length === 0 || selectedMuscleGroups.some(group => exercise.target.includes(group)))
    );
  }, [exercises, filterText, selectedCategories, selectedMuscleGroups]);

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

  const toggleCategory = (category) => {
    setSelectedCategories(prev => 
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const toggleMuscleGroup = (group) => {
    setSelectedMuscleGroups(prev => 
      prev.includes(group)
        ? prev.filter(g => g !== group)
        : [...prev, group]
    );
  };

  const FilterDropdown = () => (
    <div className="relative">
      <button
        onClick={() => setShowFilters(!showFilters)}
        className="flex items-center bg-emerald-500 text-white hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700 hover:shadow-md font-bold py-1 px-3 rounded"
      >
        <FiFilter className="mr-2" />
        Filters
        {showFilters ? <FiChevronUp className="ml-2" /> : <FiChevronDown className="ml-2" />}
      </button>
      {showFilters && (
        <div className="absolute z-10 mt-2 w-64 bg-white dark:bg-gray-800 rounded-md shadow-lg">
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-2">Categories</h3>
            <div className="flex flex-wrap gap-2 mb-4">
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
            <h3 className="text-lg font-semibold mb-2">Muscle Groups</h3>
            <div className="flex flex-wrap gap-2">
              {muscleGroups.map(group => (
                <button
                  key={group}
                  onClick={() => toggleMuscleGroup(group)}
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    selectedMuscleGroups.includes(group)
                      ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
                      : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                  }`}
                >
                  {group}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className={`bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white p-4 lg:p-8`}>
      <h1 data-aos="fade-up" className="header text-center text-3xl lg:text-4xl font-bold mb-6 lg:mb-8">Exercise <span className='headerSpan'>Library</span></h1>

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
        <FilterDropdown />
      </div>

      <AddExerciseForm 
        onSave={handleSave} 
        initialExercise={editingExercise}
        onCancel={handleCancelEdit}
      />

      {/* Mobile view */}
      <div className="md:hidden overflow-x-auto pb-4 -mx-4 px-4 hide-scrollbar">
        <div className="flex space-x-4 snap-x snap-mandatory w-full pt-4">
          {filteredExercises.map((exercise) => (
            <div key={exercise._id} className="snap-center flex-shrink-0 w-[calc(100%-2rem)] sm:w-80 pr-4">
              <div className="h-full row">
                <ExerciseItem 
                  exercise={exercise}
                  onClick={() => setSelectedExercise(exercise)}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onAddToPlan={handleAddToPlan}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Desktop view (grid layout) */}
      <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredExercises.map((exercise) => (
          <div key={exercise._id} className="h-full row">
            <ExerciseItem 
              exercise={exercise}
              onClick={() => setSelectedExercise(exercise)}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onAddToPlan={handleAddToPlan}
            />
          </div>
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
        <h2 className="text-xl font-semibold mb-2">Filters Legend</h2>
        <div className="flex flex-wrap gap-4">
          {categories.map(category => (
            <div key={category} className="flex items-center">
              <span className={`w-4 h-4 rounded-full mr-2 ${categoryColors[category]}`}></span>
              <span>{category}</span>
            </div>
          ))}
          <div className="flex items-center">
            <span className="w-4 h-4 rounded-full mr-2 bg-purple-100 dark:bg-purple-900"></span>
            <span>Muscle Group</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ExerciseLibrary;