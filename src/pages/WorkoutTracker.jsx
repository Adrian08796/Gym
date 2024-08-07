// src/pages/WorkoutTracker.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGymContext } from '../context/GymContext';
import { useNotification } from '../context/NotificationContext';

function WorkoutTracker() {
  const [currentPlan, setCurrentPlan] = useState(null);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [sets, setSets] = useState([]);
  const [startTime, setStartTime] = useState(null);
  const { addWorkout } = useGymContext();
  const { addNotification } = useNotification();
  const navigate = useNavigate();

  useEffect(() => {
    const storedPlan = localStorage.getItem('currentPlan');
    const storedSets = localStorage.getItem('currentSets');
    const storedIndex = localStorage.getItem('currentExerciseIndex');
    const storedStartTime = localStorage.getItem('workoutStartTime');

    if (storedPlan) {
      const parsedPlan = JSON.parse(storedPlan);
      setCurrentPlan(parsedPlan);
      
      if (storedSets) {
        setSets(JSON.parse(storedSets));
      } else {
        setSets(parsedPlan.exercises.map(() => []));
      }
      
      if (storedIndex !== null) {
        setCurrentExerciseIndex(parseInt(storedIndex, 10));
      }

      if (storedStartTime) {
        setStartTime(new Date(storedStartTime));
      } else {
        const newStartTime = new Date();
        setStartTime(newStartTime);
        localStorage.setItem('workoutStartTime', newStartTime.toISOString());
      }
    }
  }, []);

  useEffect(() => {
    if (currentPlan) {
      localStorage.setItem('currentPlan', JSON.stringify(currentPlan));
    }
    if (sets.length > 0) {
      localStorage.setItem('currentSets', JSON.stringify(sets));
    }
    localStorage.setItem('currentExerciseIndex', currentExerciseIndex.toString());
  }, [currentPlan, sets, currentExerciseIndex]);

  const handleSetComplete = (weight, reps) => {
    setSets(prevSets => {
      const newSets = [...prevSets];
      newSets[currentExerciseIndex] = [
        ...(newSets[currentExerciseIndex] || []),
        { weight, reps, completedAt: new Date().toISOString() }
      ];
      return newSets;
    });
    addNotification('Set completed!', 'success');
  };

  const isExerciseComplete = (index) => {
    return sets[index] && sets[index].length >= 3;
  };

  const handleExerciseChange = (newIndex) => {
    setCurrentExerciseIndex(newIndex);
  };

  const handleFinishWorkout = async () => {
    const endTime = new Date();
    const completedWorkout = {
      plan: currentPlan._id,
      planName: currentPlan.name,
      exercises: currentPlan.exercises.map((exercise, index) => ({
        exercise: exercise._id,
        sets: sets[index] || [],
        completedAt: sets[index] && sets[index].length > 0 
          ? sets[index][sets[index].length - 1].completedAt 
          : endTime.toISOString()
      })),
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString()
    };
    
    console.log('Completed workout:', JSON.stringify(completedWorkout, null, 2));
    
    try {
      await addWorkout(completedWorkout);
      addNotification('Workout completed and saved!', 'success');
      localStorage.removeItem('currentPlan');
      localStorage.removeItem('currentSets');
      localStorage.removeItem('currentExerciseIndex');
      localStorage.removeItem('workoutStartTime');
      navigate('/');
    } catch (error) {
      console.error('Error saving workout:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        console.error('Response headers:', error.response.headers);
      }
      addNotification('Failed to save workout. Please try again.', 'error');
    }
  };

  const renderCarouselIndicator = () => {
    if (!currentPlan) return null;

    return (
      <div className="flex justify-center items-center space-x-2 my-4">
        {currentPlan.exercises.map((_, index) => (
          <div
            key={index}
            className={`h-3 w-3 rounded-full cursor-pointer ${
              index === currentExerciseIndex
                ? 'bg-blue-500'  // Always blue when it's the current exercise
                : isExerciseComplete(index)
                  ? 'bg-green-500'
                  : 'bg-gray-300'
            }`}
            title={`Exercise ${index + 1}: ${currentPlan.exercises[index].name}`}
            onClick={() => handleExerciseChange(index)}
          ></div>
        ))}
      </div>
    );
  };

  if (!currentPlan) {
    return <div>Loading workout plan...</div>;
  }

  const currentExercise = currentPlan.exercises[currentExerciseIndex];

  return (
    <div className="container mx-auto mt-8 relative">
      <h2 className="text-2xl font-bold mb-4">Workout Tracker</h2>
      <h3 className="text-xl mb-4">{currentPlan.name}</h3>
      
      {renderCarouselIndicator()}
      
      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <h4 className="text-lg font-semibold mb-2">Current Exercise: {currentExercise.name}</h4>
        <p className="text-sm text-gray-600 mb-2">Exercise {currentExerciseIndex + 1} of {currentPlan.exercises.length}</p>
        <div className="flex mb-4">
          <img 
            src={currentExercise.imageUrl} 
            alt={currentExercise.name} 
            className="w-1/3 h-auto object-cover rounded-lg mr-4"
          />
          <div>
            <p className="mb-2"><strong>Description:</strong> {currentExercise.description}</p>
            <p className="mb-2"><strong>Target Muscle:</strong> {currentExercise.target}</p>
            <p className="mb-2">
              <strong>Sets completed:</strong> {(sets[currentExerciseIndex] || []).length} / 3
              {isExerciseComplete(currentExerciseIndex) && ' (Complete)'}
            </p>
          </div>
        </div>
        <div className="mb-4">
          <input
            type="number"
            placeholder="Weight"
            id="weight"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mr-2 mb-2"
          />
          <input
            type="number"
            placeholder="Reps"
            id="reps"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-2"
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
              addNotification('Please enter both weight and reps', 'error');
            }
          }}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mb-4"
        >
          Complete Set
        </button>
      </div>
      <div className="flex justify-between">
        <button
          onClick={() => handleExerciseChange(Math.max(0, currentExerciseIndex - 1))}
          className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mb-4"
        >
          Previous Exercise
        </button>
        {currentExerciseIndex < currentPlan.exercises.length - 1 ? (
          <button
            onClick={() => handleExerciseChange(currentExerciseIndex + 1)}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mb-4"
          >
            Next Exercise
          </button>
        ) : (
          <button
            onClick={handleFinishWorkout}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mb-4"
          >
            Finish Workout
          </button>
        )}
      </div>

      {/* Set Log */}
      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4">Set Log</h3>
        {currentPlan.exercises.map((exercise, index) => (
          <div key={exercise._id} className="mb-4">
            <h4 className="text-lg font-medium">{exercise.name}</h4>
            {sets[index] && sets[index].length > 0 ? (
              <ul className="list-disc pl-5">
                {sets[index].map((set, setIndex) => (
                  <li key={setIndex}>
                    Set {setIndex + 1}: {set.weight} lbs x {set.reps} reps
                  </li>
                ))}
              </ul>
            ) : (
              <p>No sets completed yet</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default WorkoutTracker;