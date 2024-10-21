// src/pages/ExerciseLibrary.jsx

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useNavigate } from 'react-router-dom';
import ExerciseItem from '../components/ExerciseItem';
import AddExerciseForm from '../components/AddExerciseForm';
import WorkoutPlanSelector from '../components/WorkoutPlanSelector';
import ExerciseModal from '../components/ExerciseModal';
import { useGymContext } from "../context/GymContext";
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { FiFilter, FiChevronDown, FiChevronUp, FiRefreshCw, FiPlay } from 'react-icons/fi';
import './ExerciseLibrary.css';
import { useTranslation } from 'react-i18next';

const categories = ['Strength', 'Cardio', 'Imported'];
const muscleGroups = ['Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Legs', 'Core', 'Full Body', 'Abs'];

const categoryColors = {
  Strength: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  Cardio: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  Flexibility: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  Imported: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
};

function ExerciseLibrary() {
  const { t } = useTranslation();
  const [editingExercise, setEditingExercise] = useState(null);
  const [showWorkoutPlanSelector, setShowWorkoutPlanSelector] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [exerciseToAddToPlan, setExerciseToAddToPlan] = useState(null);
  const [filterText, setFilterText] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedMuscleGroups, setSelectedMuscleGroups] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { user } = useAuth();
  const filterRef = useRef(null);
  const navigate = useNavigate();

  const { 
    exercises, 
    updateExercise, 
    deleteExercise, 
    addExerciseToPlan, 
    removeExerciseFromPlan, 
    fetchWorkoutPlans, 
    fetchExercises,
    showToast, 
  } = useGymContext();
  const { darkMode } = useTheme();

  useEffect(() => {
    function handleClickOutside(event) {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setShowFilters(false);
      }
    }
  
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  useEffect(() => {
    console.log('Fetching exercises for user:', user);
    fetchExercises();
  }, [fetchExercises, user, refreshTrigger]);

  const triggerRefresh = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

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

  const handleView = (exercise) => {
    setSelectedExercise(exercise);
  };

  const handleEdit = (exercise) => {
    setEditingExercise({
      ...exercise,
      target: Array.isArray(exercise.target) ? exercise.target : [exercise.target]
    });
    setSelectedExercise(null);
  };

  const handleDelete = async (exercise) => {
    try {
      await deleteExercise(exercise._id);
      setSelectedExercise(null);
      triggerRefresh();
    } catch (error) {
      console.error('Error deleting exercise:', error);
    }
  };

  const handleAddToPlan = async (exercise) => {
    if (!selectedPlan) {
      showToast('warn', 'Warning', t("Please select a workout plan first"));
      return;
    }
  
    try {
      const { success, updatedPlan, error } = await addExerciseToPlan(selectedPlan._id, exercise._id);
      if (success) {
        setSelectedPlan(updatedPlan);
      } else if (error === 'Duplicate exercise') {
        showToast('warn', 'Warning', t("This exercise is already in the plan"));
      } else {
        // showToast('error', 'Error', 'Failed to add exercise to plan');
      }
    } catch (error) {
      console.error('Error adding exercise to plan:', error);
      // showToast('error', 'Error', 'Failed to add exercise to plan');
    }
  };

  const handleRemoveFromPlan = async (planId, exerciseId) => {
    try {
      await removeExerciseFromPlan(planId, exerciseId);
      // Refresh the selected plan to update the exercise list
      handleSelectPlan(selectedPlan);
    } catch (error) {
      console.error('Error removing exercise from plan:', error);
      showToast('error', 'Error', t("Failed to remove exercise from plan"));
    }
  };

  const handleSelectPlan = async (plan) => {
    setSelectedPlan(plan);
    if (plan) {
      try {
        const fullPlan = await fetchWorkoutPlans().then(plans => 
          plans.find(p => p._id === plan._id)
        );
        setSelectedPlan(fullPlan);
      } catch (error) {
        console.error('Error fetching full plan details:', error);
        showToast('error', 'Error', t("Failed to load full plan details"));
      }
    }
  };

  const handleSave = async (savedExercise) => {
    setEditingExercise(null);
    triggerRefresh();
    showToast('success', 'Success', t("Exercise saved successfully"));
  };

  const handleSelectWorkoutPlan = async (plan) => {
    if (!exerciseToAddToPlan || !exerciseToAddToPlan._id) {
      showToast('error', 'Error', t("No exercise selected"));
      return;
    }

    const result = await addExerciseToPlan(plan._id, exerciseToAddToPlan._id);

    if (result.success) {
      // showToast('success', 'Success', `Exercise added to ${plan.name}`);
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

  const onDragStart = () => {
    setIsDragging(true);
  };

  const onDragEnd = (result) => {
    const { source, destination } = result;
  
    if (!destination) return;
  
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;
  
    const exerciseId = result.draggableId;
  
    if (destination.droppableId === 'workoutPlanDropZone') {
      if (selectedPlan) {
        handleAddToPlan({ _id: exerciseId });
      } else {
        showToast('warn', 'Warning', t("Please select a workout plan before adding exercises"));
      }
    } else if (source.droppableId === 'exerciseLibrary' && destination.droppableId === 'exerciseLibrary') {
      console.log('Reordering exercises:', source.index, destination.index);
      // Implement reordering logic here if needed
    }
  };

  const FilterDropdown = () => (
    <div className="relative" ref={filterRef}>
      <button
        onClick={() => setShowFilters(!showFilters)}
        className="nav-btn flex items-center font-bold py-1 px-3 rounded"
      >
        <FiFilter className="mr-2 md:mr-0" />
        <span className="px-1 hidden md:inline">{t("Filters")}</span>
        {showFilters ? <FiChevronUp className="ml-2" /> : <FiChevronDown className="ml-2" />}
      </button>
      {showFilters && (
        <div className="absolute z-10 mt-2 w-64 bg-white dark:bg-gray-800 rounded-md shadow-lg">
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-2">{t("Categories")}</h3>
            <div className="flex flex-wrap gap-2 mb-4">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => toggleCategory(category)}
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    selectedCategories.includes(category)
                      ? 'nav-btn'
                      : 'nav-btn-outline'
                  }`}
                >
                  {t(category)}
                </button>
              ))}
            </div>
            <h3 className="text-lg font-semibold mb-2">{t("Muscle Groups")}</h3>
            <div className="flex flex-wrap gap-2">
              {muscleGroups.map(group => (
                <button
                  key={group}
                  onClick={() => toggleMuscleGroup(group)}
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    selectedMuscleGroups.includes(group)
                      ? 'nav-btn'
                      : 'nav-btn-outline'
                  }`}
                >
                  {t(group)}
                </button>
              ))}
            </div>
            <button
              onClick={resetFilters}
              className="mt-4 nav-btn flex items-center justify-center w-full"
            >
              <FiRefreshCw className="mr-2" />
              {t("Reset Filters")}
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const resetFilters = () => {
    setFilterText('');
    setSelectedCategories([]);
    setSelectedMuscleGroups([]);
    setShowFilters(false);
  };

  const handleStartWorkout = () => {
    if (selectedPlan && selectedPlan.exercises.length > 0) {
      // Save the selected plan to localStorage or your state management system
      localStorage.setItem(`currentPlan_${user.id}`, JSON.stringify(selectedPlan));
      // Navigate to the workout tracker page
      navigate('/tracker');
    } else {
      showToast('warn', 'Warning', t("Please select a plan with exercises before starting a workout"));
    }
  };

  return (
    <DragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
      <div className={`bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white p-4 lg:p-8 min-h-screen`}>
        <h1 data-aos="fade-up" className="header text-center text-2xl sm:text-3xl text-gray-800 dark:text-white font-bold mb-4 lg:mb-8">
          {t("Exercise")} <span className='headerSpan'>{t("Library")}</span>
        </h1>

        <div className="mb-4 lg:mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="w-full sm:w-auto flex-grow">
            <input
              type="text"
              placeholder={t("Search exercises...")}
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              className="w-full px-2 py-1 lg:py-1 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:text-white text-base sm:text-lg"
            />
          </div>
          <FilterDropdown />
        </div>

        <AddExerciseForm 
          onSave={handleSave} 
          initialExercise={editingExercise}
          onCancel={() => setEditingExercise(null)}
          triggerRefresh={triggerRefresh}
        />

        <Droppable droppableId="workoutPlanDropZone">
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={`workout-plan-drop-zone ${isDragging ? 'active' : ''} p-4 rounded-lg bg-white dark:bg-gray-800 shadow-md`}
            >
              <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
                <div className="w-full sm:w-auto">
                  <WorkoutPlanSelector
                    onSelect={handleSelectPlan}
                    selectedPlan={selectedPlan}
                    isDragging={isDragging}
                    onRemoveExercise={handleRemoveFromPlan}
                  />
                </div>
                {selectedPlan && selectedPlan.exercises.length > 0 && (
                  <button
                    onClick={handleStartWorkout}
                    className="nav-btn flex items-center w-full sm:w-auto justify-center"
                  >
                    <FiPlay className="mr-2" />
                    {t("Start Workout")}
                  </button>
                )}
              </div>
              {provided.placeholder}
            </div>
          )}
        </Droppable>

        <Droppable droppableId="exerciseLibrary" direction="horizontal">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="exercise-library-container overflow-x-auto pb-4 mt-8"
            >
              <div className="exercise-library-inner flex flex-nowrap space-x-4 snap-x snap-mandatory w-full pt-4">
                {filteredExercises.map((exercise, index) => (
                  <Draggable key={exercise._id} draggableId={exercise._id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className="snap-center flex-shrink-0 w-[calc(100%-2rem)] sm:w-80 mb-4"
                      >
                        <ExerciseItem 
                          exercise={exercise}
                          onView={() => setSelectedExercise(exercise)}
                          onEdit={handleEdit}
                          onDelete={handleDelete}
                          onAddToPlan={() => handleAddToPlan(exercise)}
                          isDragging={snapshot.isDragging}
                          triggerRefresh={triggerRefresh}
                        />
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            </div>
          )}
        </Droppable>

        {selectedExercise && (
          <ExerciseModal
            exercise={selectedExercise}
            onClose={() => setSelectedExercise(null)}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onAddToPlan={handleAddToPlan}
            triggerRefresh={triggerRefresh}
          />
        )}

        {showWorkoutPlanSelector && (
          <WorkoutPlanSelector
            onSelect={handleSelectPlan}
            selectedPlan={selectedPlan}
            isDragging={isDragging}
            onRemoveExercise={handleRemoveFromPlan}
          />
        )}
      </div>
    </DragDropContext>
  );
}

export default ExerciseLibrary;