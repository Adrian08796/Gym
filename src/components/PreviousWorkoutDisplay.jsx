// src/components/PreviousWorkoutDisplay.jsx

import React from 'react';

const PreviousWorkoutDisplay = ({ previousWorkout, isLoading, formatTime, darkMode }) => {
  if (isLoading) {
    return <p className="p-4">Loading previous workout data...</p>;
  }
  if (!previousWorkout) {
    return <p className="p-4">No previous workout data available for this plan. This will be your first workout!</p>;
  }
  return (
    <div className="p-4">
      <p><strong>Date:</strong> {new Date(previousWorkout.startTime).toLocaleDateString()}</p>
      <p><strong>Duration:</strong> {formatTime((new Date(previousWorkout.endTime) - new Date(previousWorkout.startTime)) / 1000)}</p>
      {previousWorkout.exercises.map((exercise, index) => (
        <div key={index} className={`mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          <h4 className="text-lg font-medium">
            {exercise.exercise ? exercise.exercise.name : 'Unknown Exercise'}
          </h4>
          <ul className="list-disc pl-5">
            {exercise.sets.map((set, setIndex) => (
              <li key={setIndex}>
                Set {setIndex + 1}: {set.weight} kg x {set.reps} reps
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
};

export default PreviousWorkoutDisplay;