// src/components/WorkoutPlanSelector.jsx

import React, { useState, useEffect } from 'react';
import { useGymContext } from '../context/GymContext';
import { FiX, FiChevronDown, FiChevronUp } from 'react-icons/fi';

function WorkoutPlanSelector({ onSelect, selectedPlan, isDragging, onAddExercise }) {
  const [workoutPlans, setWorkoutPlans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPreviewExpanded, setIsPreviewExpanded] = useState(false);
  const { fetchWorkoutPlans, removeExerciseFromPlan } = useGymContext();

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

  useEffect(() => {
    if (selectedPlan) {
      setWorkoutPlans(prevPlans =>
        prevPlans.map(plan => 
          plan._id === selectedPlan._id ? selectedPlan : plan
        )
      );
    }
  }, [selectedPlan]);

  const handleSelect = (e) => {
    const planId = e.target.value;
    const selected = workoutPlans.find(plan => plan._id === planId);
    onSelect(selected);
  };

  const handleRemoveExercise = async (planId, exerciseId) => {
    try {
      const { success, updatedPlan } = await removeExerciseFromPlan(planId, exerciseId);
      if (success) {
        setWorkoutPlans(prevPlans =>
          prevPlans.map(plan => plan._id === planId ? updatedPlan : plan)
        );
        if (selectedPlan && selectedPlan._id === planId) {
          onSelect(updatedPlan);
        }
      }
    } catch (error) {
      console.error('Error removing exercise from plan:', error);
    }
  };

  if (isLoading) {
    return <div>Loading workout plans...</div>;
  }

  return (
    <div className={`mb-4 ${isDragging ? 'pointer-events-auto' : ''}`}>
      <select
        value={selectedPlan?._id || ''}
        onChange={handleSelect}
        className={`w-full p-2 border rounded text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-800`}
      >
        <option value="">Select a workout plan for drag and drop</option>
        {workoutPlans.map((plan) => (
          <option key={plan._id} value={plan._id}>
            {plan.name} ({plan.exercises?.length || 0} exercises)
          </option>
        ))}
      </select>
      {selectedPlan && (
        <div className="mt-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold">Exercises in {selectedPlan.name}:</h3>
          </div>
          <div className={`overflow-hidden transition-all duration-300 ${isPreviewExpanded ? 'max-h-96' : 'max-h-24'}`}>
            <div className="flex overflow-x-auto pb-2 hide-scrollbar">
              <div className="flex space-x-2">
                {selectedPlan.exercises?.map((exercise) => (
                  <div key={exercise._id} className="min-w-[max-content] bg-gray-200 dark:bg-gray-700 rounded-lg p-2 flex items-center text-xs whitespace-nowrap">
                    <img src={exercise.imageUrl} alt={exercise.name} className="w-6 h-6 object-cover rounded-full mr-2" />
                    <span className="mr-2">{exercise.name}</span>
                    <button 
                      onClick={() => handleRemoveExercise(selectedPlan._id, exercise._id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <FiX size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
        {selectedPlan ? "Drag exercises here or use the '+' button to add them to the selected plan." : "Select a plan to add exercises."}
      </p>
    </div>
  );
}

export default WorkoutPlanSelector;