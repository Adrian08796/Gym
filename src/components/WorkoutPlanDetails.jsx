// src/components/WorkoutPlanDetails.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGymContext } from '../context/GymContext';
import { formatTime } from '../utils/timeUtils';
import { useTranslation } from 'react-i18next';

function WorkoutPlanDetails() {
  const { t } = useTranslation();
  const { id } = useParams();
  const { workoutPlans, updateWorkoutPlan, deleteWorkoutPlan, getLastWorkoutForPlan } = useGymContext();
  const [plan, setPlan] = useState(null);
  const [lastWorkout, setLastWorkout] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const foundPlan = workoutPlans.find(p => p._id === id);
    setPlan(foundPlan);

    if (foundPlan) {
      getLastWorkoutForPlan(foundPlan._id).then(setLastWorkout);
    }
  }, [id, workoutPlans, getLastWorkoutForPlan]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this workout plan?')) {
      await deleteWorkoutPlan(id);
      navigate('/plans');
    }
  };

  const handleReschedule = () => {
    const newDate = prompt('Enter new date (YYYY-MM-DD):', plan.scheduledDate ? new Date(plan.scheduledDate).toISOString().split('T')[0] : '');
    if (newDate) {
      const updatedPlan = { ...plan, scheduledDate: new Date(newDate) };
      updateWorkoutPlan(id, updatedPlan);
    }
  };

  if (!plan) {
    return <div>{t("Loading workout plan")}...</div>;
  }

  if (!plan) {
    return <div>{t("Loading workout plan")}...</div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">{plan.name}</h2>
      <p><strong>{t("Type")}:</strong> {plan.type || 'Not specified'}</p>
      <p><strong>{t("Scheduled Date")}:</strong> {plan.scheduledDate ? new Date(plan.scheduledDate).toLocaleDateString() : 'Not scheduled'}</p>
      
      <h3 className="text-xl font-semibold mt-4 mb-2">{t("Exercises")}:</h3>
      <ul className="list-disc list-inside">
        {plan.exercises.map((exercise, index) => (
          <li key={exercise._id || index}>
            {index + 1}. {exercise.name}
            {exercise.importedFrom && (
              <span className="text-sm text-gray-500 ml-2">
                ({t("Imported from")} {exercise.importedFrom.username})
              </span>
            )}
          </li>
        ))}
      </ul>

      <div className="mt-4">
        <button onClick={handleReschedule} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2">
          {t("Reschedule")}
        </button>
        <button onClick={handleDelete} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
          {t("Delete Plan")}
        </button>
        
        {lastWorkout && (
        <div className="mt-4">
          <h3 className="text-xl font-semibold">{t("Last Workout")}</h3>
          <p>{t("Date")}: {new Date(lastWorkout.startTime).toLocaleDateString()}</p>
          <p>{t("Duration")}: {formatTime((new Date(lastWorkout.endTime) - new Date(lastWorkout.startTime)) / 1000)}</p>
          {/* Add more details as needed */}
        </div>
      )}
      </div>
    </div>
  );
}

export default WorkoutPlanDetails;