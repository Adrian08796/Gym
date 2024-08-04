// pages/WorkoutSummary.jsx

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGymContext } from '../context/GymContext';
import { useAuth } from '../context/AuthContext';

function WorkoutSummary() {
  const { workoutHistory, fetchWorkoutHistory } = useGymContext();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchWorkoutHistory();
    }
  }, [user, fetchWorkoutHistory]);

  if (!user) {
    return <div className="container mx-auto mt-8">Please log in to view your workout history.</div>;
  }

  if (workoutHistory.length === 0) {
    return <div className="container mx-auto mt-8">No workout history available.</div>;
  }

  return (
    <div className="container mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-4">Workout History</h2>
      {workoutHistory.map((workout) => (
        <div key={workout._id} className="mb-8 p-4 border rounded shadow">
          <h3 className="text-xl mb-4">
            {workout.planName} {workout.planDeleted && <span className="text-red-500">(Deleted)</span>}
          </h3>
          <p className="mb-4">Completed on: {new Date(workout.date).toLocaleString()}</p>

          {workout.exercises.map((exercise, index) => (
            <div key={index} className="mb-4">
              <h4 className="text-lg font-medium">
                {exercise.exercise ? exercise.exercise.name : 'Deleted Exercise'}
              </h4>
              {exercise.sets && exercise.sets.length > 0 ? (
                <ul className="list-disc pl-5">
                  {exercise.sets.map((set, setIndex) => (
                    <li key={setIndex}>
                      Set {setIndex + 1}: {set.weight} lbs x {set.reps} reps
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No sets completed</p>
              )}
            </div>
          ))}
        </div>
      ))}

      <button
        onClick={() => navigate('/')}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mt-4"
      >
        Back to Home
      </button>
    </div>
  );
}

export default WorkoutSummary;