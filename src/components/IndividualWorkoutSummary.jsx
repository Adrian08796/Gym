// src/components/IndividualWorkoutSummary.jsx

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useGymContext } from '../context/GymContext';
import { useTheme } from '../context/ThemeContext';

function IndividualWorkoutSummary() {
  const { id } = useParams();
  const { workoutHistory } = useGymContext();
  const [workout, setWorkout] = useState(null);
  const { darkMode } = useTheme();

  useEffect(() => {
    const foundWorkout = workoutHistory.find(w => w._id === id);
    setWorkout(foundWorkout);
  }, [id, workoutHistory]);

  if (!workout) {
    return <div>Loading workout summary...</div>;
  }

  const formatDuration = (start, end) => {
    const duration = new Date(end) - new Date(start);
    const hours = Math.floor(duration / 3600000);
    const minutes = Math.floor((duration % 3600000) / 60000);
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className={`p-4 ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}>
      <h2 className="text-2xl font-bold mb-4">Workout Summary</h2>
      <p><strong>Date:</strong> {new Date(workout.startTime).toLocaleDateString()}</p>
      <p><strong>Duration:</strong> {formatDuration(workout.startTime, workout.endTime)}</p>
      <p><strong>Plan:</strong> {workout.planName}</p>
      <p><strong>Progression:</strong> {workout.progression ? `${workout.progression.toFixed(2)}%` : 'N/A'}</p>
      <p><strong>Total Pause Time:</strong> {workout.totalPauseTime ? `${workout.totalPauseTime} seconds` : 'N/A'}</p>
      <p><strong>Skipped Pauses:</strong> {workout.skippedPauses || 0}</p>
      
      <h3 className="text-xl font-semibold mt-4 mb-2">Exercises:</h3>
      {workout.exercises.map((exercise, index) => (
        <div key={index} className={`mb-4 p-3 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
          <h4 className="text-lg font-medium">{exercise.exercise ? exercise.exercise.name : 'Unknown Exercise'}</h4>
          <ul className="list-disc list-inside">
            {exercise.sets.map((set, setIndex) => (
              <li key={setIndex}>
                Set {setIndex + 1}: {set.weight} lbs x {set.reps} reps
                {set.skippedRest && <span className="text-yellow-500 ml-2">(Rest Skipped)</span>}
              </li>
            ))}
          </ul>
          {exercise.notes && (
            <p className="mt-2 italic">Notes: {exercise.notes}</p>
          )}
        </div>
      ))}
    </div>
  );
}

export default IndividualWorkoutSummary;