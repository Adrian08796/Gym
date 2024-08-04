// src/pages/WorkoutPlans.jsx

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGymContext } from '../context/GymContext';
import WorkoutPlanForm from '../components/WorkoutPlanForm';

function WorkoutPlans() {
  const { workoutPlans, exercises, deleteWorkoutPlan, addWorkoutPlan } = useGymContext();
  const [showForm, setShowForm] = useState(false);
  const navigate = useNavigate();

  const handleStartWorkout = (plan) => {
    localStorage.setItem('currentPlan', JSON.stringify(plan));
    navigate('/tracker');
  };

  const handleAddWorkoutPlan = async (plan) => {
    try {
      await addWorkoutPlan(plan);
      setShowForm(false); // Hide the form after successfully adding a plan
    } catch (error) {
      console.error('Error adding workout plan:', error);
      // Optionally, you can show an error message to the user here
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Workout Plans</h1>
      <button
        onClick={() => setShowForm(!showForm)}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
      >
        {showForm ? 'Hide Form' : 'Create New Plan'}
      </button>
      {showForm && <WorkoutPlanForm onSubmit={handleAddWorkoutPlan} />}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {workoutPlans.map((plan) => (
          <div key={plan._id} className="border rounded-lg p-4 mb-4 shadow-sm">
            <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
            <ul className="list-disc list-inside mb-4">
              {plan.exercises.map((exercise) => (
                <li key={exercise._id}>
                  {exercise.name}
                </li>
              ))}
            </ul>
            <div className="flex justify-between">
              <button
                onClick={() => handleStartWorkout(plan)}
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 rounded"
              >
                Start Workout
              </button>
              <button
                onClick={() => deleteWorkoutPlan(plan._id)}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
              >
                Delete Plan
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default WorkoutPlans;