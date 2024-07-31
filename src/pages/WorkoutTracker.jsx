// src/pages/WorkoutTracker.jsx
import { useState, useEffect } from 'react';
import WorkoutForm from '../components/WorkoutForm';
import { useGymContext } from '../context/GymContext';

function WorkoutTracker() {
  const { workouts, addWorkout, updateWorkout, deleteWorkout, exercises } = useGymContext();
  const [editingWorkout, setEditingWorkout] = useState(null);
  const [currentPlan, setCurrentPlan] = useState(null);

  useEffect(() => {
    const storedPlan = localStorage.getItem('currentPlan');
    if (storedPlan) {
      setCurrentPlan(JSON.parse(storedPlan));
      localStorage.removeItem('currentPlan');
    }
  }, []);

  const handleSaveWorkout = (workout) => {
    if (editingWorkout) {
      updateWorkout(editingWorkout._id, workout);
      setEditingWorkout(null);
    } else {
      addWorkout(workout);
    }
  };

  const handleEditWorkout = (workout) => {
    setEditingWorkout(workout);
  };

  const handleDeleteWorkout = (id) => {
    deleteWorkout(id);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Workout Tracker</h1>
      {currentPlan && (
        <div className="mb-4 p-4 bg-blue-100 rounded">
          <h2 className="text-xl font-semibold mb-2">Current Plan: {currentPlan.name}</h2>
          <ul className="list-disc list-inside">
            {currentPlan.exercises.map((exerciseId) => (
              <li key={exerciseId}>
                {exercises.find(e => e._id === exerciseId)?.name}
              </li>
            ))}
          </ul>
        </div>
      )}
      <WorkoutForm onSave={handleSaveWorkout} initialWorkout={editingWorkout} />
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Logged Workouts</h2>
        {workouts.length === 0 ? (
          <p>No workouts logged yet.</p>
        ) : (
          <ul className="space-y-4">
            {workouts.map((workout) => (
              <li key={workout._id} className="bg-white shadow rounded-lg p-4">
                <h3 className="text-lg font-semibold">{workout.exercise}</h3>
                <p>Sets: {workout.sets}, Reps: {workout.reps}, Weight: {workout.weight}kg</p>
                <p className="text-sm text-gray-500">
                  {new Date(workout.date).toLocaleString()}
                </p>
                <div className="mt-2">
                  <button
                    onClick={() => handleEditWorkout(workout)}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded mr-2"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteWorkout(workout._id)}
                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default WorkoutTracker;