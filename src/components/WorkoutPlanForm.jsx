// src/components/WorkoutPlanForm.jsx

import { useState, useEffect } from 'react';
import { useGymContext } from '../context/GymContext';
import { useTheme } from '../context/ThemeContext';

function WorkoutPlanForm({ onSubmit, initialPlan, onCancel }) {
  const [planName, setPlanName] = useState('');
  const [selectedExercises, setSelectedExercises] = useState([]);
  const [workoutType, setWorkoutType] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const { exercises } = useGymContext();
  const { darkMode } = useTheme();

  useEffect(() => {
    if (initialPlan) {
      setPlanName(initialPlan.name);
      setSelectedExercises(initialPlan.exercises.map(exercise => exercise._id || exercise));
      setWorkoutType(initialPlan.type || '');
      setScheduledDate(initialPlan.scheduledDate ? new Date(initialPlan.scheduledDate).toISOString().split('T')[0] : '');
    } else {
      setPlanName('');
      setSelectedExercises([]);
      setWorkoutType('');
      setScheduledDate('');
    }
  }, [initialPlan]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const workoutPlan = {
      name: planName,
      exercises: selectedExercises.map(exerciseId => 
        typeof exerciseId === 'object' ? exerciseId._id : exerciseId
      ),
      type: workoutType,
      scheduledDate: scheduledDate ? new Date(scheduledDate).toISOString() : null
    };
    
    if (initialPlan) {
      workoutPlan._id = initialPlan._id;
    }

    await onSubmit(workoutPlan);
  };

  const handleCancel = (e) => {
    e.preventDefault();
    onCancel();
  };

  const handleExerciseToggle = (exerciseId) => {
    setSelectedExercises(prevSelected =>
      prevSelected.includes(exerciseId)
        ? prevSelected.filter(id => id !== exerciseId)
        : [...prevSelected, exerciseId]
    );
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
    <form onSubmit={handleSubmit} className={`max-w-4xl mx-auto mt-8 ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} shadow-md rounded px-8 pt-6 pb-8 mb-4`}>
      <div className="mb-4">
        <label htmlFor="planName" className="block text-sm font-bold mb-2">
          Workout Plan Name
        </label>
        <input
          type="text"
          id="planName"
          value={planName}
          onChange={(e) => setPlanName(e.target.value)}
          className={`shadow appearance-none border rounded w-full py-2 px-3 ${darkMode ? 'bg-gray-700 text-white' : 'text-gray-700'} leading-tight focus:outline-none focus:shadow-outline`}
          required
        />
      </div>
      <div className="mb-4">
        <label htmlFor="workoutType" className="block text-sm font-bold mb-2">
          Workout Type
        </label>
        <select
          id="workoutType"
          value={workoutType}
          onChange={(e) => setWorkoutType(e.target.value)}
          className={`shadow appearance-none border rounded w-full py-2 px-3 ${darkMode ? 'bg-gray-700 text-white' : 'text-gray-700'} leading-tight focus:outline-none focus:shadow-outline`}
          required
        >
          <option value="">Select a type</option>
          <option value="strength">Strength</option>
          <option value="cardio">Cardio</option>
          <option value="flexibility">Flexibility</option>
        </select>
      </div>
      <div className="mb-4">
        <label htmlFor="scheduledDate" className="block text-sm font-bold mb-2">
          Scheduled Date
        </label>
        <input
          type="date"
          id="scheduledDate"
          value={scheduledDate}
          onChange={(e) => setScheduledDate(e.target.value)}
          className={`shadow appearance-none border rounded w-full py-2 px-3 ${darkMode ? 'bg-gray-700 text-white' : 'text-gray-700'} leading-tight focus:outline-none focus:shadow-outline`}
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-bold mb-2">
          Select Exercises
        </label>
        <input
          type="text"
          placeholder="Search exercises..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={`shadow appearance-none border rounded w-full py-2 px-3 ${darkMode ? 'bg-gray-700 text-white' : 'text-gray-700'} leading-tight focus:outline-none focus:shadow-outline mb-4`}
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
                      checked={selectedExercises.includes(exercise._id)}
                      onChange={() => handleExerciseToggle(exercise._id)}
                      className="mr-2"
                    />
                    <label htmlFor={`exercise-${exercise._id}`} className="text-sm">
                      {exercise.name}
                      {exercise.importedFrom && (
                        <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                          (Imported from {exercise.importedFrom.username})
                        </span>
                      )}
                    </label>
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div className={`border rounded p-4 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} overflow-y-auto h-96`}>
            <h3 className="font-bold mb-2">Selected Exercises</h3>
            {selectedExercises.map(exerciseId => {
              const exercise = exercises.find(e => e._id === exerciseId) || { name: 'Unknown Exercise', _id: exerciseId };
              return (
                <div key={exerciseId} className="flex items-center justify-between mb-2">
                  <span className="text-sm">
                    {exercise.name}
                    {exercise.importedFrom && (
                      <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                        (Imported from {exercise.importedFrom.username})
                      </span>
                    )}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleExerciseToggle(exerciseId)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between mt-6">
        <button
          type="submit"
          className="bg-emerald-500 text-white hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700 hover:shadow-md font-bold py-1 px-3 rounded"
        >
          {initialPlan ? 'Update Workout Plan' : 'Create Workout Plan'}
        </button>
        <button
          type="button"
          onClick={handleCancel}
          className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

export default WorkoutPlanForm;