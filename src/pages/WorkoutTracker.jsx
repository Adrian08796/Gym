import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGymContext } from '../context/GymContext';

function WorkoutTracker() {
  const [currentPlan, setCurrentPlan] = useState(null);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [sets, setSets] = useState([]);
  const { addWorkout } = useGymContext();
  const navigate = useNavigate();

  useEffect(() => {
    const storedPlan = localStorage.getItem('currentPlan');
    if (storedPlan) {
      const parsedPlan = JSON.parse(storedPlan);
      setCurrentPlan(parsedPlan);
      setSets(parsedPlan.exercises.map(() => []));
    }
  }, []);

  const handleSetComplete = (weight, reps) => {
    setSets(prevSets => {
      const newSets = [...prevSets];
      newSets[currentExerciseIndex] = [...newSets[currentExerciseIndex], { weight, reps }];
      return newSets;
    });
  };

  const handleNextExercise = () => {
    if (currentExerciseIndex < currentPlan.exercises.length - 1) {
      setCurrentExerciseIndex(prevIndex => prevIndex + 1);
    } else {
      // Workout complete, save it
      const completedWorkout = {
        plan: currentPlan._id,
        exercises: currentPlan.exercises.map((exercise, index) => ({
          exercise: exercise._id,
          sets: sets[index]
        }))
      };
      addWorkout(completedWorkout);
      alert('Workout completed and saved!');
      navigate('/'); // Navigate back to home or wherever you want
    }
  };

  if (!currentPlan) {
    return <div>Loading workout plan...</div>;
  }

  const currentExercise = currentPlan.exercises[currentExerciseIndex];

  return (
    <div className="container mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-4">Workout Tracker</h2>
      <h3 className="text-xl mb-4">{currentPlan.name}</h3>
      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <h4 className="text-lg font-semibold mb-2">Current Exercise: {currentExercise.name}</h4>
        <p className="mb-4">Sets completed: {sets[currentExerciseIndex].length}</p>
        <div className="mb-4">
          <input
            type="number"
            placeholder="Weight"
            id="weight"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mr-2"
          />
          <input
            type="number"
            placeholder="Reps"
            id="reps"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        <button
          onClick={() => {
            const weight = document.getElementById('weight').value;
            const reps = document.getElementById('reps').value;
            if (weight && reps) {
              handleSetComplete(Number(weight), Number(reps));
              document.getElementById('weight').value = '';
              document.getElementById('reps').value = '';
            } else {
              alert('Please enter both weight and reps');
            }
          }}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mb-4"
        >
          Complete Set
        </button>
      </div>
      <button
        onClick={handleNextExercise}
        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
      >
        {currentExerciseIndex < currentPlan.exercises.length - 1 ? 'Next Exercise' : 'Finish Workout'}
      </button>
    </div>
  );
}

export default WorkoutTracker;