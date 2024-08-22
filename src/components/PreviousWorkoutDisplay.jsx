// src/components/PreviousWorkoutDisplay.jsx

import React from 'react';

const PreviousWorkoutDisplay = ({ previousWorkout, exerciseHistory, isLoading, formatTime, darkMode }) => {
  if (isLoading) {
    return <p className="p-4">Loading previous data...</p>;
  }

  const renderExerciseHistory = () => {
    if (!exerciseHistory || exerciseHistory.length === 0) {
      return <p className="p-4">No previous data available for this exercise.</p>;
    }

    const lastWorkout = exerciseHistory[0]; // Most recent workout

    return (
      <div className="mb-4">
        <h3 className="text-xl font-bold mb-2">Last Exercise Performance</h3>
        <p><strong>Date:</strong> {new Date(lastWorkout.date).toLocaleDateString()}</p>
        <h4 className="text-lg font-medium mt-2">Sets:</h4>
        <ul className="list-disc pl-5">
          {lastWorkout.sets.map((set, index) => (
            <li key={index} className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
              Set {index + 1}: {set.weight} kg x {set.reps} reps
            </li>
          ))}
        </ul>
        {lastWorkout.notes && (
          <p className="mt-2 italic">Notes: {lastWorkout.notes}</p>
        )}
      </div>
    );
  };

  const renderPreviousWorkout = () => {
    if (!previousWorkout) {
      return <p className="p-4">No previous workout data available for this plan.</p>;
    }

    return (
      <div className="mb-4">
        <h3 className="text-xl font-bold mb-2">Previous Full Workout</h3>
        <p><strong>Date:</strong> {previousWorkout.startTime ? new Date(previousWorkout.startTime).toLocaleDateString() : 'N/A'}</p>
        <p><strong>Duration:</strong> {previousWorkout.startTime && previousWorkout.endTime ? 
          formatTime((new Date(previousWorkout.endTime) - new Date(previousWorkout.startTime)) / 1000) : 'N/A'}
        </p>
        {previousWorkout.exercises && previousWorkout.exercises.map((exercise, index) => (
          <div key={index} className={`mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            <h4 className="text-lg font-medium">
              {exercise.exercise ? exercise.exercise.name : 'Unknown Exercise'}
            </h4>
            {exercise.sets && exercise.sets.length > 0 ? (
              <ul className="list-disc pl-5">
                {exercise.sets.map((set, setIndex) => (
                  <li key={setIndex}>
                    Set {setIndex + 1}: {set.weight} kg x {set.reps} reps
                  </li>
                ))}
              </ul>
            ) : (
              <p>No sets recorded for this exercise.</p>
            )}
            {exercise.notes && (
              <p className="mt-2 italic">Notes: {exercise.notes}</p>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="p-4">
      {exerciseHistory && renderExerciseHistory()}
      {previousWorkout && renderPreviousWorkout()}
      {!exerciseHistory && !previousWorkout && (
        <p className="p-4">No previous workout data available. This will be your first workout!</p>
      )}
    </div>
  );
};

export default PreviousWorkoutDisplay;