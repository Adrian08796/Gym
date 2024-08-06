// src/components/WorkoutPlanSelector.jsx

import React, { useState, useEffect } from 'react';
import { useGymContext } from '../context/GymContext';

function WorkoutPlanSelector({ onSelect, onClose }) {
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

  const handleSelect = async (plan) => {
    await onSelect(plan);
    onClose();
  };

  if (isLoading) {
    return <div>Loading workout plans...</div>;
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
      <div className="bg-white p-5 rounded-lg shadow-xl max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">Select Workout Plan</h2>
        {workoutPlans.length === 0 ? (
          <p>No workout plans available. Create a plan first.</p>
        ) : (
          workoutPlans.map((plan) => (
            <button
              key={plan._id}
              onClick={() => handleSelect(plan)}
              className="block w-full text-left p-2 hover:bg-gray-100 rounded mb-2"
            >
              {plan.name}
            </button>
          ))
        )}
        <button
          onClick={onClose}
          className="mt-4 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export default WorkoutPlanSelector;