// src/pages/WorkoutPlans.jsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGymContext } from '../context/GymContext';
import WorkoutPlanForm from '../components/WorkoutPlanForm';

function WorkoutPlans() {
  const { workoutPlans, deleteWorkoutPlan, addWorkoutPlan, updateWorkoutPlan } = useGymContext();
  const [showForm, setShowForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [ongoingWorkout, setOngoingWorkout] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedPlan = localStorage.getItem('currentPlan');
    if (storedPlan) {
      setOngoingWorkout(JSON.parse(storedPlan));
    }
  }, []);

  const handleStartWorkout = (plan) => {
    localStorage.setItem('currentPlan', JSON.stringify(plan));
    navigate('/tracker');
  };

  const handleResumeWorkout = () => {
    navigate('/tracker');
  };

  const handleAddWorkoutPlan = async (plan) => {
    try {
      await addWorkoutPlan(plan);
      setShowForm(false);
      setEditingPlan(null);
    } catch (error) {
      console.error('Error adding workout plan:', error);
    }
  };

  const handleEditWorkoutPlan = async (plan) => {
    try {
      await updateWorkoutPlan(plan._id, plan);
      setShowForm(false);
      setEditingPlan(null);
    } catch (error) {
      console.error('Error updating workout plan:', error);
    }
  };

  const handleEdit = (plan) => {
    setEditingPlan(plan);
    setShowForm(true);
  };

  return (
    <div className="text-gray-900 dark:text-gray-100">
      <h1 className="text-3xl font-bold mb-4">Workout Plans</h1>
      {ongoingWorkout && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4" role="alert">
          <p className="font-bold">Ongoing Workout</p>
          <p>You have an unfinished workout: {ongoingWorkout.name}</p>
          <button
            onClick={handleResumeWorkout}
            className="mt-2 bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded"
          >
            Resume Workout
          </button>
        </div>
      )}
      <button
        onClick={() => {
          setShowForm(!showForm);
          setEditingPlan(null);
        }}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
      >
        {showForm ? 'Hide Form' : 'Create New Plan'}
      </button>
      {showForm && (
        <WorkoutPlanForm
          onSubmit={editingPlan ? handleEditWorkoutPlan : handleAddWorkoutPlan}
          initialPlan={editingPlan}
        />
      )}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {workoutPlans.map((plan) => (
          <div key={plan._id} className="border rounded-lg p-4 mb-4 shadow-sm">
            <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
            <p className="text-sm text-gray-600 mb-2">
              Type: {plan.type || 'Not specified'}
            </p>
            <p className="text-sm text-gray-600 mb-2">
              Scheduled: {plan.scheduledDate ? new Date(plan.scheduledDate).toLocaleDateString() : 'Not scheduled'}
            </p>
            <ul className="list-disc list-inside mb-4">
              {plan.exercises.map((exercise) => (
                <li key={exercise._id} className="mb-2">
                  <span className="font-medium">{exercise.name}</span>
                  <p className="text-sm text-gray-600 ml-4">{exercise.description}</p>
                  <p className="text-sm text-gray-500 ml-4">Target: {exercise.target}</p>
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
                onClick={() => handleEdit(plan)}
                className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-2 rounded mx-2"
              >
                Edit Plan
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