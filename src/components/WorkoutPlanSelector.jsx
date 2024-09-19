// src/components/WorkoutPlanSelector.jsx

import React, { useState, useEffect } from 'react';
import { useGymContext } from '../context/GymContext';

function WorkoutPlanSelector({ onSelect, selectedPlanId, isDragging }) {
  const [workoutPlans, setWorkoutPlans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { fetchWorkoutPlans } = useGymContext();

  useEffect(() => {
    const getWorkoutPlans = async () => {
      try {
        setIsLoading(true);
        const plans = await fetchWorkoutPlans();
        setWorkoutPlans(plans || []);
      } catch (error) {
        console.error('Error fetching workout plans:', error);
      } finally {
        setIsLoading(false);
      }
    };
    getWorkoutPlans();
  }, [fetchWorkoutPlans]);

  const handleSelect = (plan) => {
    onSelect(plan);
  };

  if (isLoading) {
    return <div>Loading workout plans...</div>;
  }

  return (
    <div className={`mb-4 ${isDragging ? 'pointer-events-auto' : ''}`}>
      <select
        value={selectedPlanId || ''}
        onChange={(e) => onSelect(workoutPlans.find(plan => plan._id === e.target.value))}
        className={`w-full p-2 border rounded text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-800`}
      >
        <option value="">Select a workout plan for drag and drop</option>
        {workoutPlans.map((plan) => (
          <option key={plan._id} value={plan._id}>
            {plan.name} ({plan.exercises.length} exercises)
          </option>
        ))}
      </select>
      {selectedPlanId && (
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Drag exercises here to add them to the selected plan.
        </p>
      )}
    </div>
  );
}

export default WorkoutPlanSelector;