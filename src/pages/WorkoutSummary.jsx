// src/pages/WorkoutSummary.jsx

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGymContext } from '../context/GymContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

function WorkoutSummary() {
  const { workoutHistory, fetchWorkoutHistory } = useGymContext();
  const { user } = useAuth();
  const { darkMode } = useTheme();
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
    <div className={`container mx-auto mt-8 ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-100 text-gray-900'}`}>
      <h2 className="text-2xl font-bold mb-4">Workout History</h2>
      {workoutHistory.map((workout) => (
        <div key={workout._id} className={`mb-8 p-4 border rounded shadow ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'}`}>
          <h3 className="text-xl mb-2">
            {workout.planName} {workout.planDeleted && <span className="text-red-500">(Deleted)</span>}
          </h3>
          <p className="mb-2">Date: {formatDate(workout.date || workout.startTime)}</p>
          <p className="mb-2">Start Time: {formatTime(workout.startTime)}</p>
          <p className="mb-2">End Time: {formatTime(workout.endTime)}</p>
          <p className="mb-2">Duration: {formatDuration(workout.startTime, workout.endTime)}</p>
          <p className="mb-2">Progression: {workout.progression ? `${workout.progression.toFixed(2)}%` : 'N/A'}</p>
          <p className="mb-4">Total Pause Time: {workout.totalPauseTime ? `${workout.totalPauseTime} seconds` : 'N/A'}</p>

          {workout.exercises.map((exercise, index) => (
            <div key={index} className={`mb-4 p-3 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <h4 className={`text-lg font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                {exercise.exercise ? exercise.exercise.name : 'Deleted Exercise'}
              </h4>
              {exercise.completedAt && (
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Completed at: {formatTime(exercise.completedAt)}</p>
              )}
              {exercise.sets && exercise.sets.length > 0 ? (
                <ul className="list-disc pl-5 mt-2">
                  {exercise.sets.map((set, setIndex) => (
                    <li key={setIndex} className={`mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Set {setIndex + 1}: {set.weight} lbs x {set.reps} reps
                      {set.completedAt && (
                        <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} ml-2`}>
                          (at {formatTime(set.completedAt)})
                        </span>
                      )}
                      {set.skippedRest && (
                        <span className="text-yellow-500 ml-2">(Rest Skipped)</span>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className={`mt-2 italic ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>No sets completed</p>
              )}
              {exercise.notes && (
                <p className={`mt-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  <strong>Notes:</strong> {exercise.notes}
                </p>
              )}
            </div>
          ))}
        </div>
      ))}
      <button
        onClick={() => navigate('/')}
        className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mt-4`}
      >
        Back to Home
      </button>
    </div>
  );
}

export default WorkoutSummary;