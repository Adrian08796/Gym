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

  const formatDuration = (start, end) => {
    if (!start || !end) return 'N/A';
    const duration = new Date(end) - new Date(start);
    const hours = Math.floor(duration / 3600000);
    const minutes = Math.floor((duration % 3600000) / 60000);
    return `${hours}h ${minutes}m`;
  };

  const formatTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

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
          <h3 className="text-xl mb-2">
            {workout.planName} {workout.planDeleted && <span className="text-red-500">(Deleted)</span>}
          </h3>
          <p className="mb-2">Date: {formatDate(workout.date || workout.startTime)}</p>
          <p className="mb-2">Start Time: {formatTime(workout.startTime)}</p>
          <p className="mb-2">End Time: {formatTime(workout.endTime)}</p>
          <p className="mb-4">Duration: {formatDuration(workout.startTime, workout.endTime)}</p>

          {workout.exercises.map((exercise, index) => (
            <div key={index} className="mb-4 p-3 bg-gray-100 rounded">
              <h4 className="text-lg font-medium">
                {exercise.exercise ? exercise.exercise.name : 'Deleted Exercise'}
              </h4>
              {exercise.completedAt && (
                <p className="text-sm text-gray-600">Completed at: {formatTime(exercise.completedAt)}</p>
              )}
              {exercise.sets && exercise.sets.length > 0 ? (
                <ul className="list-disc pl-5 mt-2">
                  {exercise.sets.map((set, setIndex) => (
                    <li key={setIndex} className="mb-1">
                      Set {setIndex + 1}: {set.weight} lbs x {set.reps} reps
                      {set.completedAt && (
                        <span className="text-sm text-gray-600 ml-2">
                          (at {formatTime(set.completedAt)})
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 italic">No sets completed</p>
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