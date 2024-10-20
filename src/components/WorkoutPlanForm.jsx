// src/components/WorkoutPlanForm.jsx

import React, { useState, useEffect } from 'react';
import { useGymContext } from '../context/GymContext';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useTranslation } from 'react-i18next';

function WorkoutPlanForm({ onSubmit, initialPlan, onCancel }) {
  const { t } = useTranslation();
  const [planName, setPlanName] = useState('');
  const [selectedExercises, setSelectedExercises] = useState([]);
  const [workoutType, setWorkoutType] = useState('strength');
  const [scheduledDate, setScheduledDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [isEditable, setIsEditable] = useState(true);
  const { exercises, addWorkoutPlan, updateWorkoutPlan, addDefaultWorkoutPlan, showToast } = useGymContext();
  const { darkMode } = useTheme();
  const { user } = useAuth();

  useEffect(() => {
    if (initialPlan) {
      setPlanName(initialPlan.name);
      setSelectedExercises(initialPlan.exercises.map(exercise => 
        typeof exercise === 'string' ? exercises.find(e => e._id === exercise) : exercise
      ));
      setWorkoutType(initialPlan.type || 'strength');
      setScheduledDate(initialPlan.scheduledDate ? new Date(initialPlan.scheduledDate).toISOString().split('T')[0] : '');
      setIsDefault(initialPlan.isDefault || false);
      setIsEditable(user.isAdmin || !initialPlan.isDefault);
    } else {
      setPlanName('');
      setSelectedExercises([]);
      setWorkoutType('strength');
      setScheduledDate('');
      setIsDefault(false);
      setIsEditable(true);
    }
  }, [initialPlan, exercises, user.isAdmin]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isEditable) {
      showToast('error', 'Error', t("You don't have permission to edit this plan."));
      return;
    }
    const workoutPlan = {
      name: planName,
      exercises: selectedExercises.map(exercise => exercise._id),
      type: workoutType,
      scheduledDate: scheduledDate ? new Date(scheduledDate).toISOString() : null,
    };
    
    try {
      let savedPlan;
      if (initialPlan) {
        savedPlan = await updateWorkoutPlan(initialPlan._id, workoutPlan);
      } else if (isDefault && user.isAdmin) {
        savedPlan = await addDefaultWorkoutPlan(workoutPlan);
      } else {
        savedPlan = await addWorkoutPlan(workoutPlan);
      }
      onSubmit(savedPlan);
      onCancel();
    } catch (error) {
      console.error('Error saving workout plan:', error);
      showToast('error', 'Error', error.response?.data?.message || 'Failed to save workout plan');
    }
  };

  const handleCancel = (e) => {
    e.preventDefault();
    onCancel();
  };

  const handleExerciseToggle = (exercise) => {
    if (!isEditable) {
      showToast('error', 'Error', t("You don't have permission to modify this plan."));
      return;
    }
    setSelectedExercises(prev => 
      prev.some(e => e._id === exercise._id)
        ? prev.filter(e => e._id !== exercise._id)
        : [...prev, exercise]
    );
  };

  const onDragEnd = (result) => {
    if (!isEditable) {
      showToast('error', 'Error', t("You don't have permission to modify this plan."));
      return;
    }
    if (!result.destination) {
      return;
    }

    const items = Array.from(selectedExercises);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setSelectedExercises(items);
  };

  const filteredExercises = exercises.filter(exercise =>
    exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (Array.isArray(exercise.target) && exercise.target.some(t => t.toLowerCase().includes(searchTerm.toLowerCase())))
  );

  const groupedExercises = filteredExercises.reduce((acc, exercise) => {
    const targets = Array.isArray(exercise.target) ? exercise.target : [exercise.target];
    targets.forEach(target => {
      if (!acc[target]) {
        acc[target] = [];
      }
      acc[target].push(exercise);
    });
    return acc;
  }, {});

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 shadow-md rounded px-8 pt-6 pb-8 mb-4">
      <div className="mb-4">
        <label htmlFor="planName" className="block text-sm font-bold mb-2">
          {t("Workout Plan Name")}
        </label>
        <input
          type="text"
          id="planName"
          value={planName}
          onChange={(e) => setPlanName(e.target.value)}
          className={`shadow appearance-none border rounded w-full py-2 px-3 ${darkMode ? 'bg-gray-700 text-white' : 'text-gray-700'} leading-tight focus:outline-none focus:shadow-outline ${!isEditable ? 'opacity-50 cursor-not-allowed' : ''}`}
          required
          disabled={!isEditable}
        />
      </div>
      <div className="mb-4">
        <label htmlFor="workoutType" className="block text-sm font-bold mb-2">
          {t("Workout Type")}
        </label>
        <select
          id="workoutType"
          value={workoutType}
          onChange={(e) => setWorkoutType(e.target.value)}
          className={`shadow appearance-none border rounded w-full py-2 px-3 ${darkMode ? 'bg-gray-700 text-white' : 'text-gray-700'} leading-tight focus:outline-none focus:shadow-outline ${!isEditable ? 'opacity-50 cursor-not-allowed' : ''}`}
          required
          disabled={!isEditable}
        >
          <option value="strength">{t("Strength")}</option>
          <option value="cardio">{t("Cardio")}</option>
        </select>
      </div>
      <div className="mb-4">
        <label htmlFor="scheduledDate" className="block text-sm font-bold mb-2">
          {t("Scheduled Date")}
        </label>
        <input
          type="date"
          id="scheduledDate"
          value={scheduledDate}
          onChange={(e) => setScheduledDate(e.target.value)}
          className={`shadow appearance-none border rounded w-full py-2 px-3 ${darkMode ? 'bg-gray-700 text-white' : 'text-gray-700'} leading-tight focus:outline-none focus:shadow-outline ${!isEditable ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={!isEditable}
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
          {t("Select Exercises")}
        </label>
        <input
          type="text"
          placeholder="Search exercises..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={`shadow appearance-none border rounded w-full py-2 px-3 ${darkMode ? 'bg-gray-700 text-white' : 'text-gray-700'} leading-tight focus:outline-none focus:shadow-outline mb-4 ${!isEditable ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={!isEditable}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className={`border rounded p-4 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} overflow-y-auto h-96`}>
            {Object.entries(groupedExercises).map(([target, targetExercises]) => (
              <div key={target} className="mb-4">
                <h3 className="font-bold mb-2">{target}</h3>
                {targetExercises.map(exercise => (
                  <div key={exercise._id} className="flex items-center mb-2">
                    <input
                      type="checkbox"
                      id={`exercise-${exercise._id}`}
                      checked={selectedExercises.some(e => e._id === exercise._id)}
                      onChange={() => handleExerciseToggle(exercise)}
                      className={`mr-2 ${!isEditable ? 'opacity-50 cursor-not-allowed' : ''}`}
                      disabled={!isEditable}
                    />
                    <label htmlFor={`exercise-${exercise._id}`} className="text-sm">
                      {exercise.name}
                      {exercise.importedFrom && exercise.importedFrom.username && (
                        <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                          ({t("Imported from")} {exercise.importedFrom.username})
                        </span>
                      )}
                    </label>
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div className={`border rounded p-4 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} overflow-y-auto h-96`}>
            <h3 className="font-bold mb-2">{t("Selected Exercises")}</h3>
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="selected-exercises" isDropDisabled={!isEditable}>
                {(provided) => (
                  <ul {...provided.droppableProps} ref={provided.innerRef}>
                    {selectedExercises.map((exercise, index) => (
                      <Draggable key={exercise._id} draggableId={exercise._id} index={index} isDragDisabled={!isEditable}>
                        {(provided) => (
                          <li
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="flex items-center justify-between mb-2 bg-gray-200 dark:bg-gray-600 p-2 rounded"
                          >
                            <span className="text-sm">
                              {exercise.name}
                              {exercise.importedFrom && exercise.importedFrom.username && (
                                <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                                  ({t("Imported from")} {exercise.importedFrom.username})
                                </span>
                              )}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleExerciseToggle(exercise)}
                              className={`text-red-500 hover:text-red-700 ${!isEditable ? 'opacity-50 cursor-not-allowed' : ''}`}
                              disabled={!isEditable}
                            >
                              {t("Remove")}
                            </button>
                          </li>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </ul>
                )}
              </Droppable>
            </DragDropContext>
          </div>
        </div>
      </div>
      {user.isAdmin && (
        <div className="mb-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
              className="form-checkbox h-5 w-5 text-emerald-500"
            />
            <span className="ml-2 text-gray-700 dark:text-gray-300">{t("Set as Default Workout Plan (Admin Only)")}</span>
          </label>
        </div>
      )}
      <div className="flex items-center justify-between mt-6">
        <button
          type="submit"
          className={`nav-btn ${!isEditable ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={!isEditable}
        >
          {initialPlan ? t("Update Workout Plan") : t("Create Workout Plan")}
        </button>
        <button
          type="button"
          onClick={handleCancel}
          className="nav-btn rounded "
        >
          {t("Cancel")}
        </button>
      </div>
      {!isEditable && (
        <p className="mt-4 text-red-500 text-sm">
          {t("This is a default plan created by an admin. You don't have permission to edit it.")}
        </p>
      )}
    </form>
  );
}

export default WorkoutPlanForm;