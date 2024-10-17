// src/components/WorkoutPlanSelector.jsx

import React, { useState, useEffect } from 'react';
import { FiX, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { useGymContext } from '../context/GymContext';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

function WorkoutPlanSelector({ onSelect, selectedPlan, isDragging, onRemoveExercise }) {
  const [workoutPlans, setWorkoutPlans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPreviewExpanded, setIsPreviewExpanded] = useState(false);
  const { fetchWorkoutPlans, removeExerciseFromPlan, showToast } = useGymContext();
  const { user } = useAuth();
  const { t } = useTranslation();

  useEffect(() => {
    const getWorkoutPlans = async () => {
      try {
        setIsLoading(true);
        const plans = await fetchWorkoutPlans();
        setWorkoutPlans(plans || []);
      } catch (error) {
        console.error('Error fetching workout plans:', error);
        showToast('error', 'Error', t("Failed to fetch workout plans"));
      } finally {
        setIsLoading(false);
      }
    };
    getWorkoutPlans();
  }, [fetchWorkoutPlans, showToast]);

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
      // Check if the plan is admin-created and the user is not an admin
      if (selectedPlan.isDefault && !user.isAdmin) {
        showToast('error', 'Error', t("You cannot remove exercises from admin-created plans"));
        return;
      }

      const { success, updatedPlan } = await removeExerciseFromPlan(planId, exerciseId);
      if (success) {
        setWorkoutPlans(prevPlans =>
          prevPlans.map(plan => plan._id === planId ? updatedPlan : plan)
        );
        if (selectedPlan && selectedPlan._id === planId) {
          onSelect(updatedPlan);
        }
        // showToast('success', 'Success', 'Exercise removed from plan successfully');
      }
    } catch (error) {
      console.error('Error removing exercise from plan:', error);
      showToast('error', 'Error', t("Failed to remove exercise from plan"));
    }
  };

  if (isLoading) {
    return <div>{t("Loading workout plans...")}</div>;
  }

  return (
    <div className={`mb-4 ${isDragging ? 'pointer-events-auto' : ''}`}>
      <select
        value={selectedPlan?._id || ''}
        onChange={(e) => {
          const selected = workoutPlans.find(plan => plan._id === e.target.value);
          onSelect(selected);
        }}
        className={`w-full p-2 border rounded text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-800`}
      >
        <option value="">{t("Select a workout plan for drag and drop")}</option>
        {workoutPlans.map((plan) => (
          <option key={plan._id} value={plan._id}>
            {plan.name} ({plan.exercises?.length || 0} "exercises")
          </option>
        ))}
      </select>
      {selectedPlan && (
        <div className="mt-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold">{t("Exercises in")} {selectedPlan.name}:</h3>
            <button 
              onClick={() => setIsPreviewExpanded(!isPreviewExpanded)}
              className="text-blue-500 hover:text-blue-700"
            >
              {isPreviewExpanded ? <FiChevronUp /> : <FiChevronDown />}
            </button>
          </div>
          <div className={`overflow-hidden transition-all duration-300 ${isPreviewExpanded ? 'max-h-96' : 'max-h-24'}`}>
            <div className="flex overflow-x-auto pb-2 px-4 carousel-container">
              <div className="flex space-x-2">
                {selectedPlan.exercises?.map((exercise) => (
                  <div key={exercise._id} className="min-w-[max-content] bg-gray-200 dark:bg-gray-700 rounded-lg p-2 flex items-center text-xs whitespace-nowrap">
                    <img src={exercise.imageUrl} alt={exercise.name} className="w-6 h-6 object-cover rounded-full mr-2" />
                    <span className="mr-2">{exercise.name}</span>
                    {(!selectedPlan.isDefault || user.isAdmin) && (
                      <button 
                        onClick={() => handleRemoveExercise(selectedPlan._id, exercise._id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <FiX size={12} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
        {t(selectedPlan ? "Drag exercises here or use the '+' button to add them to the selected plan." : "Select a plan to add exercises.")}
      </p>
    </div>
  );
}

export default WorkoutPlanSelector;