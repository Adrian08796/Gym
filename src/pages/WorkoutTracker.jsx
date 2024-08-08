// src/pages/WorkoutTracker.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGymContext } from '../context/GymContext';
import { useNotification } from '../context/NotificationContext';
import { useTheme } from '../context/ThemeContext';

function WorkoutTracker() {
  const [currentPlan, setCurrentPlan] = useState(null);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [sets, setSets] = useState([]);
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');
  const { addWorkout } = useGymContext();
  const { addNotification } = useNotification();
  const { darkMode } = useTheme();
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

  useEffect(() => {
    const timer = setInterval(() => {
      if (startTime) {
        const now = new Date();
        setElapsedTime(Math.floor((now - startTime) / 1000));
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [startTime]);

  const handleSetComplete = () => {
    if (!weight || !reps) {
      addNotification('Please enter both weight and reps', 'error');
      return;
    }

    setSets(prevSets => {
      const newSets = [...prevSets];
      newSets[currentExerciseIndex] = [
        ...(newSets[currentExerciseIndex] || []),
        { weight: Number(weight), reps: Number(reps), completedAt: new Date().toISOString() }
      ];
      return newSets;
    });
    setWeight('');
    setReps('');
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
      addNotification('Failed to save workout. Please try again.', 'error');
    }
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (!currentPlan) {
    return <div className="text-center mt-8">Loading workout plan...</div>;
  }

  const currentExercise = currentPlan.exercises[currentExerciseIndex];

  return (
    <div className={`container mx-auto mt-8 p-4 ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}>
      <h2 className="text-3xl font-bold mb-4">Workout Tracker</h2>
      <h3 className="text-xl mb-4">{currentPlan.name}</h3>
      
      <div className="mb-4 text-lg">
        Elapsed Time: {formatTime(elapsedTime)}
      </div>

      <div className="mb-4 flex flex-wrap">
        {currentPlan.exercises.map((exercise, index) => (
          <button
            key={exercise._id}
            onClick={() => handleExerciseChange(index)}
            className={`mr-2 mb-2 px-3 py-1 rounded ${
              index === currentExerciseIndex
                ? 'bg-blue-500 text-white'
                : isExerciseComplete(index)
                ? 'bg-green-500 text-white'
                : 'bg-gray-300 text-gray-800'
            }`}
          >
            {exercise.name}
          </button>
        ))}
      </div>
      
      <div className={`bg-gray-100 dark:bg-gray-700 shadow-md rounded px-8 pt-6 pb-8 mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
        <h4 className="text-lg font-semibold mb-2">Current Exercise: {currentExercise.name}</h4>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">Exercise {currentExerciseIndex + 1} of {currentPlan.exercises.length}</p>
        <div className="flex flex-col md:flex-row mb-4">
          <img 
            src={currentExercise.imageUrl} 
            alt={currentExercise.name} 
            className="w-full md:w-1/3 h-48 object-cover rounded-lg mr-0 md:mr-4 mb-4 md:mb-0"
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
        <div className="mb-4 flex">
          <input
            type="number"
            placeholder="Weight"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mr-2"
          />
          <input
            type="number"
            placeholder="Reps"
            value={reps}
            onChange={(e) => setReps(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        <button
          onClick={handleSetComplete}
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