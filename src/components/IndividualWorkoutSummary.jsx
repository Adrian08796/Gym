// src/components/IndividualWorkoutSummary.jsx

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useGymContext } from '../context/GymContext';

function IndividualWorkoutSummary() {
  const { id } = useParams();
  const { workoutHistory } = useGymContext();
  const [workout, setWorkout] = useState(null);

  useEffect(() => {
    const foundWorkout = workoutHistory.find(w => w._id === id);
    setWorkout(foundWorkout);
  }, [id, workoutHistory]);

  if (!workout) {
    return <div>Loading workout summary...</div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Workout Summary</h2>
      <p><strong>Date:</strong> {new Date(workout.startTime).toLocaleDateString()}</p>
      <p><strong>Duration:</strong> {((new Date(workout.endTime) - new Date(workout.startTime)) / (1000 * 60)).toFixed(0)} minutes</p>
      <p><strong>Plan:</strong> {workout.planName}</p>
      
      <h3 className="text-xl font-semibold mt-4 mb-2">Exercises:</h3>
      {workout.exercises.map((exercise, index) => (
        <div key={index} className="mb-4">
          <h4 className="text-lg font-medium">{exercise.exercise ? exercise.exercise.name : 'Unknown Exercise'}</h4>
          <ul className="list-disc list-inside">
            {exercise.sets.map((set, setIndex) => (
              <li key={setIndex}>
                Set {setIndex + 1}: {set.weight} lbs x {set.reps} reps
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export default IndividualWorkoutSummary;