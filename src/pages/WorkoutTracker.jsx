// src/pages/WorkoutTracker.jsx

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGymContext } from '../context/GymContext';
import { useNotification } from '../context/NotificationContext';
import { useTheme } from '../context/ThemeContext';
import { CSSTransition, SwitchTransition } from 'react-transition-group';
import { FiChevronLeft, FiChevronRight, FiChevronDown, FiChevronUp, FiSettings, FiX } from 'react-icons/fi';
import axios from 'axios';
import { usePreviousWorkout } from '../hooks/usePreviousWorkout';
import PreviousWorkoutDisplay from '../components/PreviousWorkoutDisplay';
import { formatTime } from '../utils/timeUtils';
import './WorkoutTracker.css';

function WorkoutTracker() {
  const [currentPlan, setCurrentPlan] = useState(null);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [sets, setSets] = useState([]);
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');
  const [restTime, setRestTime] = useState(60);
  const [isResting, setIsResting] = useState(false);
  const [remainingRestTime, setRemainingRestTime] = useState(0);
  const [notes, setNotes] = useState([]);
  const [totalPauseTime, setTotalPauseTime] = useState(0);
  const [skippedPauses, setSkippedPauses] = useState(0);
  const [progression, setProgression] = useState(0);
  const [lastSetValues, setLastSetValues] = useState({});
  const [requiredSets, setRequiredSets] = useState({});
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [swipeDirection, setSwipeDirection] = useState(null);
  const [isExerciseDetailsOpen, setIsExerciseDetailsOpen] = useState(false);
  const [isExerciseOptionsOpen, setIsExerciseOptionsOpen] = useState(false);
  const [isPreviousWorkoutOpen, setIsPreviousWorkoutOpen] = useState(false);
  const [isCurrentSetLogOpen, setIsCurrentSetLogOpen] = useState(false);
  const [isConfirmingCancel, setIsConfirmingCancel] = useState(false);

  const { 
    addWorkout, 
    saveProgress, 
    clearWorkout,
    getExerciseHistory 
  } = useGymContext();
  const { addNotification } = useNotification();
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  const nodeRef = useRef(null);

  const API_URL = 'https://your-api-url.com'; // Replace with your actual API URL

  const { isPreviousWorkoutLoading, previousWorkout } = usePreviousWorkout(currentPlan, API_URL, addNotification);

  // Load workout data from local storage or API
  useEffect(() => {
    const loadWorkout = async () => {
      const storedPlan = localStorage.getItem('currentPlan');
      if (storedPlan) {
        const plan = JSON.parse(storedPlan);
        setCurrentPlan(plan);
        loadStoredData(plan);
      } else {
        addNotification('No workout plan selected', 'error');
        navigate('/plans');
      }
    };

    loadWorkout();
  }, [navigate, addNotification]);

  // Save progress periodically
  useEffect(() => {
    const saveInterval = setInterval(() => {
      if (currentPlan) {
        saveProgress({
          plan: currentPlan,
          sets,
          currentExerciseIndex,
          startTime,
          notes,
          lastSetValues,
        });
      }
    }, 30000); // Save every 30 seconds

    return () => clearInterval(saveInterval);
  }, [currentPlan, sets, currentExerciseIndex, startTime, notes, lastSetValues, saveProgress]);

  // Handle workout timer
  useEffect(() => {
    let timer;
    if (startTime) {
      timer = setInterval(() => {
        setElapsedTime(prevTime => prevTime + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [startTime]);

  // Handle rest timer
  useEffect(() => {
    let restTimer;
    if (isResting && remainingRestTime > 0) {
      restTimer = setInterval(() => {
        setRemainingRestTime(prevTime => prevTime - 1);
      }, 1000);
    } else if (remainingRestTime === 0 && isResting) {
      setIsResting(false);
      addNotification('Rest time is over. Ready for the next set!', 'info');
    }
    return () => clearInterval(restTimer);
  }, [isResting, remainingRestTime, addNotification]);

  // Save data to local storage
  useEffect(() => {
    saveDataToLocalStorage();
  }, [currentPlan, sets, currentExerciseIndex, notes, lastSetValues]);

  // Function to load stored data
  const loadStoredData = (plan) => {
    // ... (implementation remains the same)
  };

  // Function to save data to local storage
  const saveDataToLocalStorage = () => {
    // ... (implementation remains the same)
  };

  // Function to handle set completion
  const handleSetComplete = () => {
    // ... (implementation remains the same)
  };

  // Function to start rest timer
  const startRestTimer = () => {
    // ... (implementation remains the same)
  };

  // Function to skip rest timer
  const skipRestTimer = () => {
    // ... (implementation remains the same)
  };

  // Function to update progression
  const updateProgression = () => {
    // ... (implementation remains the same)
  };

  // Function to handle finishing the workout
  const handleFinishWorkout = async () => {
    // ... (implementation remains the same)
  };

  // Function to handle cancelling the workout
  const handleCancelWorkout = () => {
    // ... (implementation remains the same)
  };

  // Function to reset workout state
  const resetWorkoutState = () => {
    // ... (implementation remains the same)
  };

  // Function to clear local storage
  const clearLocalStorage = () => {
    // ... (implementation remains the same)
  };

  // Function to check if an exercise is complete
  const isExerciseComplete = (exerciseId, exerciseSets) => {
    // ... (implementation remains the same)
  };

  // Function to calculate overall progress
  const calculateProgress = () => {
    // ... (implementation remains the same)
  };

  // Function to handle note changes
  const handleNoteChange = (index, value) => {
    // ... (implementation remains the same)
  };

  // Function to handle exercise changes
  const handleExerciseChange = (newIndex) => {
    // ... (implementation remains the same)
  };

  // Touch event handlers for swipe functionality
  const handleTouchStart = (e) => {
    // ... (implementation remains the same)
  };

  const handleTouchMove = (e) => {
    // ... (implementation remains the same)
  };

  const handleTouchEnd = () => {
    // ... (implementation remains the same)
  };

  // Toggle functions for various UI elements
  const toggleExerciseDetails = () => {
    // ... (implementation remains the same)
  };

  const toggleExerciseOptions = () => {
    // ... (implementation remains the same)
  };

  const togglePreviousWorkout = () => {
    // ... (implementation remains the same)
  };

  const toggleCurrentSetLog = () => {
    // ... (implementation remains the same)
  };

  // Render function
  return (
    <div 
      className={`workout-tracker container mx-auto mt-8 p-4 ${darkMode ? 'dark-mode bg-gray-800 text-white' : 'bg-white text-gray-800'}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="relative mb-6">
        <button
          onClick={handleCancelWorkout}
          className="absolute top-0 right-0 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          disabled={isConfirmingCancel}
        >
          <FiX />
        </button>
        <h2 className="text-3xl font-bold text-center">Workout Tracker</h2>
        <h3 className="text-xl text-center mt-2">{currentPlan.name}</h3>
      </div>
      
      <div className="mb-4 text-lg text-center">
        Elapsed Time: {formatTime(elapsedTime)}
      </div>

      <div className="mb-4">
        <div className="progress-bar">
          <div className="progress-bar-fill" style={{width: `${calculateProgress()}%`}}></div>
        </div>
        <p className="text-sm mt-2 text-center">Overall Progress: {calculateProgress().toFixed(2)}%</p>
      </div>

      <div className="mb-4 flex justify-center items-center">
        <div className="flex space-x-2 overflow-x-auto py-2 px-4 carousel-container">
          {currentPlan.exercises.map((exercise, index) => (
            <button
              key={exercise._id}
              onClick={() => handleExerciseChange(index)}
              className={`w-3 h-3 rounded-full focus:outline-none transition-all duration-200 ${
                index === currentExerciseIndex
                  ? 'bg-blue-500 w-4 h-4'
                  : isExerciseComplete(exercise._id, sets[index] || [])
                  ? 'bg-green-500'
                  : 'bg-gray-300 dark:bg-gray-600'
              }`}
              title={exercise.name}
              aria-label={`Go to exercise: ${exercise.name}`}
            />
          ))}
        </div>
      </div>

      <SwitchTransition mode="out-in">
        <CSSTransition
          key={currentExerciseIndex}
          nodeRef={nodeRef}
          timeout={300}
          classNames="fade"
        >
          <div 
            ref={nodeRef} 
            className="exercise-container bg-gray-100 dark:bg-gray-700 shadow-md rounded px-8 pt-6 pb-8 mb-4"
          >
            <div className="flex flex-col md:flex-row mb-4">
              <img 
                src={currentExercise.imageUrl} 
                alt={currentExercise.name} 
                className="w-full md:w-1/3 h-48 object-cover rounded-lg mr-0 md:mr-4 mb-4 md:mb-0"
              />
              <div className="flex-grow">
                <div 
                  className="flex justify-between items-center cursor-pointer"
                  onClick={toggleExerciseDetails}
                >
                  <h4 className="text-lg font-semibold mb-2">{currentExercise.name}</h4>
                  {isExerciseDetailsOpen ? <FiChevronUp /> : <FiChevronDown />}
                </div>
                <div className={`collapsible-content ${isExerciseDetailsOpen ? 'open' : ''}`}>
                  <p className="mb-2"><strong>Description:</strong> {currentExercise.description}</p>
                  <p className="mb-2"><strong>Target Muscle:</strong> {currentExercise.target}</p>
                </div>
                <p className="mb-2">
                  <strong>Sets completed:</strong> {(sets[currentExerciseIndex] || []).length} / {requiredSets[currentExercise._id]}
                </p>
              </div>
            </div>

            <div className="mb-4 flex">
              <input
                type="number"
                placeholder="Weight (kg)"
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

            <div className="mb-4 flex justify-between items-center">
              <button
                onClick={handleSetComplete}
                className="btn btn-primary"
              >
                Complete Set
              </button>
              <button
                onClick={toggleExerciseOptions}
                className="btn btn-secondary flex items-center"
              >
                <FiSettings className="mr-2" /> Options
                {isExerciseOptionsOpen ? <FiChevronUp className="ml-2" /> : <FiChevronDown className="ml-2" />}
              </button>
            </div>

            <div className={`collapsible-content ${isExerciseOptionsOpen ? 'open' : ''}`}>
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="restTime">
                  Rest Time (seconds):
                </label>
                <input
                  type="number"
                  id="restTime"
                  value={restTime}
                  onChange={(e) => setRestTime(Number(e.target.value))}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor={`notes-${currentExerciseIndex}`}>
                  Exercise Notes:
                </label>
                <textarea
                  id={`notes-${currentExerciseIndex}`}
                  value={notes[currentExerciseIndex] || ''}
                  onChange={(e) => handleNoteChange(currentExerciseIndex, e.target.value)}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  rows="3"
                ></textarea>
              </div>
            </div>

            {isResting && (
              <div className="rest-timer mb-4">
                <p>Rest Time Remaining: {formatTime(remainingRestTime)}</p>
                <div className="rest-timer-bar">
                  <div 
                    className="rest-timer-fill"
                    style={{width: `${(remainingRestTime / restTime) * 100}%`}}
                  ></div>
                </div>
                <button
                  onClick={skipRestTimer}
                  className="mt-2 bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-2 rounded focus:outline-none focus:shadow-outline"
                >
                  Skip Rest
                </button>
              </div>
            )}
          </div>
        </CSSTransition>
      </SwitchTransition>

      <div className="flex justify-between items-center mt-4">
        <button
          onClick={() => handleExerciseChange(Math.max(0, currentExerciseIndex - 1))}
          className={`btn btn-secondary ${currentExerciseIndex === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={currentExerciseIndex === 0}
        >
          <FiChevronLeft className="inline-block mr-1" /> Previous
        </button>
        <span className="text-lg font-semibold">
          {currentExerciseIndex + 1} / {currentPlan.exercises.length}
        </span>
        {currentExerciseIndex < currentPlan.exercises.length - 1 ? (
          <button
            onClick={() => handleExerciseChange(currentExerciseIndex + 1)}
            className="btn btn-primary"
          >
            Next <FiChevronRight className="inline-block ml-1" />
          </button>
        ) : (
          <button
            onClick={handleFinishWorkout}
            className="btn btn-primary"
          >
            Finish Workout
          </button>
        )}
      </div>

      <div className={`mt-8 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-blue-100'}`}>
        <button 
          onClick={togglePreviousWorkout}
          className={`w-full p-4 text-left font-semibold flex justify-between items-center ${darkMode ? 'text-blue-300' : 'text-blue-800'}`}
        >
          <span>Previous Exercise Performance</span>
          {isPreviousWorkoutOpen ? <FiChevronUp /> : <FiChevronDown />}
        </button>
        <div className={`collapsible-content ${isPreviousWorkoutOpen ? 'open' : ''}`}>
          <PreviousWorkoutDisplay 
            previousWorkout={previousWorkout} 
            isLoading={isPreviousWorkoutLoading} 
            formatTime={formatTime}
            darkMode={darkMode}
          />
        </div>
      </div>

      <div className={`mt-8 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-green-100'}`}>
        <button 
          onClick={toggleCurrentSetLog}
          className={`w-full p-4 text-left font-semibold flex justify-between items-center ${darkMode ? 'text-green-300' : 'text-green-800'}`}
        >
          <span>Current Workout Set Log</span>
          {isCurrentSetLogOpen ? <FiChevronUp /> : <FiChevronDown />}
        </button>
        <div className={`collapsible-content ${isCurrentSetLogOpen ? 'open' : ''}`}>
          <div className="p-4">
            {currentPlan.exercises.map((exercise, index) => (
              <div key={exercise._id} className="mb-4">
                <h4 className={`text-lg font-medium ${darkMode ? 'text-green-200' : 'text-green-700'}`}>
                  {exercise.name}
                  {isExerciseComplete(exercise._id, sets[index] || []) && ' (Complete)'}
                </h4>
                {sets[index] && sets[index].length > 0 ? (
                  <ul className="list-disc pl-5">
                    {sets[index].map((set, setIndex) => (
                      <li key={setIndex}>
                        Set {setIndex + 1}: {set.weight} kg x {set.reps} reps
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No sets completed yet</p>
                )}
                <p>
                  {sets[index] ? sets[index].length : 0} / {requiredSets[exercise._id]} sets completed
                </p>
                {notes[index] && (
                  <p className="mt-2 italic">Notes: {notes[index]}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={`swipe-overlay ${swipeDirection ? 'active' : ''}`}>
        {swipeDirection === 'left' && (
          <div className="swipe-indicator right">
            <FiChevronRight />
          </div>
        )}
        {swipeDirection === 'right' && (
          <div className="swipe-indicator left">
            <FiChevronLeft />
          </div>
        )}
      </div>
    </div>
  );
}

export default WorkoutTracker;