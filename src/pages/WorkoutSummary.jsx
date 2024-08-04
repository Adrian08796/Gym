import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function WorkoutSummary() {
  const [completedWorkout, setCompletedWorkout] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedWorkout = localStorage.getItem('completedWorkout');
    if (storedWorkout) {
      setCompletedWorkout(JSON.parse(storedWorkout));
    } else {
      navigate('/'); // Redirect to home if no completed workout found
    }
  }, [navigate]);

  if (!completedWorkout) {
    return <div>Loading summary...</div>;
  }

  return (
    <div className="container mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-4">Workout Summary</h2>
      <h3 className="text-xl mb-4">{completedWorkout.plan.name}</h3>
      <p className="mb-4">Completed on: {new Date(completedWorkout.date).toLocaleString()}</p>

      {completedWorkout.exercises.map((exercise, index) => (
        <div key={exercise._id} className="mb-4">
          <h4 className="text-lg font-medium">{exercise.name}</h4>
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

      <button
        onClick={() => {
          localStorage.removeItem('completedWorkout');
          navigate('/');
        }}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mt-4"
      >
        Back to Home
      </button>
    </div>
  );
}

export default WorkoutSummary;