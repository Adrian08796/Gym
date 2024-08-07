// src/components/WorkoutPlanForm.jsx

import { useState, useEffect } from 'react';
import { useGymContext } from '../context/GymContext';

function WorkoutPlanForm({ onSubmit, initialPlan }) {
  const [planName, setPlanName] = useState('');
  const [selectedExercises, setSelectedExercises] = useState([]);
  const [workoutType, setWorkoutType] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const { exercises } = useGymContext();

  useEffect(() => {
    if (initialPlan) {
      setPlanName(initialPlan.name);
      setSelectedExercises(initialPlan.exercises.map(exercise => exercise._id));
      setWorkoutType(initialPlan.type || '');
      setScheduledDate(initialPlan.scheduledDate ? new Date(initialPlan.scheduledDate).toISOString().split('T')[0] : '');
    } else {
      // Reset form when not editing
      setPlanName('');
      setSelectedExercises([]);
      setWorkoutType('');
      setScheduledDate('');
    }
  }, [initialPlan]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const workoutPlan = {
        name: planName,
        exercises: selectedExercises,
        type: workoutType,
        scheduledDate: scheduledDate ? new Date(scheduledDate).toISOString() : null
      };
      
      if (initialPlan) {
        workoutPlan._id = initialPlan._id;  // Include the ID when updating
      }

      await onSubmit(workoutPlan);
      
      // Reset form if it's not editing
      if (!initialPlan) {
        setPlanName('');
        setSelectedExercises([]);
        setWorkoutType('');
        setScheduledDate('');
      }
    } catch (error) {
      console.error('Error submitting workout plan:', error);
    }
  };
  
  const handleExerciseToggle = (exerciseId) => {
    setSelectedExercises(prevSelected =>
      prevSelected.includes(exerciseId)
        ? prevSelected.filter(id => id !== exerciseId)
        : [...prevSelected, exerciseId]
    );
  };   

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto mt-8">
      <div className="mb-4">
        <label htmlFor="planName" className="block text-gray-700 font-bold mb-2">
          Workout Plan Name
        </label>
        <input
          type="text"
          id="planName"
          value={planName}
          onChange={(e) => setPlanName(e.target.value)}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          required
        />
      </div>
      <div className="mb-4">
        <label htmlFor="workoutType" className="block text-gray-700 font-bold mb-2">
          Workout Type
        </label>
        <select
          id="workoutType"
          value={workoutType}
          onChange={(e) => setWorkoutType(e.target.value)}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          required
        >
          <option value="">Select a type</option>
          <option value="strength">Strength</option>
          <option value="cardio">Cardio</option>
          <option value="flexibility">Flexibility</option>
        </select>
      </div>
      <div className="mb-4">
        <label htmlFor="scheduledDate" className="block text-gray-700 font-bold mb-2">
          Scheduled Date
        </label>
        <input
          type="date"
          id="scheduledDate"
          value={scheduledDate}
          onChange={(e) => setScheduledDate(e.target.value)}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 font-bold mb-2">
          Select Exercises
        </label>
        {exercises.map((exercise) => (
          <div key={exercise._id} className="flex items-center mb-2">
            <input
              type="checkbox"
              id={`exercise-${exercise._id}`}
              checked={selectedExercises.includes(exercise._id)}
              onChange={() => handleExerciseToggle(exercise._id)}
              className="mr-2"
            />
            <label htmlFor={`exercise-${exercise._id}`}>{exercise.name}</label>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between">
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          {initialPlan ? 'Update Workout Plan' : 'Create Workout Plan'}
        </button>
      </div>
    </form>
  );
}

export default WorkoutPlanForm;