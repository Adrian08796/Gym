// src/pages/WorkoutTracker.jsx

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGymContext } from '../context/GymContext';
import { useNotification } from '../context/NotificationContext';
import { useTheme } from '../context/ThemeContext';
import { CSSTransition, SwitchTransition } from 'react-transition-group';
import { FiChevronLeft, FiChevronRight, FiChevronDown, FiChevronUp, FiSettings, FiX } from 'react-icons/fi';
import { usePreviousWorkout } from '../hooks/usePreviousWorkout';
import PreviousWorkoutDisplay from '../components/PreviousWorkoutDisplay';
import { formatTime } from '../utils/timeUtils';
import './WorkoutTracker.css';

// Custom hook for managing rest timer
const useRestTimer = (initialTime, onTimerEnd) => {
  const [isResting, setIsResting] = useState(false);
  const [remainingRestTime, setRemainingRestTime] = useState(initialTime);

  useEffect(() => {
    let timer;
    if (isResting && remainingRestTime > 0) {
      timer = setInterval(() => {
        setRemainingRestTime(prevTime => prevTime - 1);
      }, 1000);
    } else if (remainingRestTime === 0 && isResting) {
      setIsResting(false);
      onTimerEnd();
      
      // Trigger vibration if supported
      if ('vibrate' in navigator) {
        navigator.vibrate(1000); // Vibrate for 1 second
      }

      // Show alert
      alert('Rest time is over. Ready for the next set!');
    }
    return () => clearInterval(timer);
  }, [isResting, remainingRestTime, onTimerEnd]);

  const startRestTimer = useCallback(() => {
    setIsResting(true);
    setRemainingRestTime(initialTime);
  }, [initialTime]);

  const skipRestTimer = useCallback(() => {
    setIsResting(false);
    setRemainingRestTime(0);
  }, []);

  return { isResting, remainingRestTime, startRestTimer, skipRestTimer };
};

function WorkoutTracker() {
  const [currentPlan, setCurrentPlan] = useState(null);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [sets, setSets] = useState([]);
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');
  const [restTime, setRestTime] = useState(60);
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
  const [isLoading, setIsLoading] = useState(true);
  const [exerciseHistory, setExerciseHistory] = useState({});

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

  const API_URL = 'https://walrus-app-lqhsg.ondigitalocean.app';

  const { isPreviousWorkoutLoading, previousWorkout } = usePreviousWorkout(currentPlan?._id, API_URL, addNotification);

  const { isResting, remainingRestTime, startRestTimer, skipRestTimer } = useRestTimer(restTime, () => {
    addNotification('Rest time is over. Ready for the next set!', 'info');
  });
  
  // Fetch exercise history when currentPlan changes
  useEffect(() => {
    const fetchExerciseHistory = async () => {
      if (currentPlan && currentPlan.exercises) {
        try {
          const historyPromises = currentPlan.exercises.map(exercise => 
            getExerciseHistory(exercise._id)
          );
          const histories = await Promise.all(historyPromises);
          const historyMap = {};
          currentPlan.exercises.forEach((exercise, index) => {
            historyMap[exercise._id] = histories[index];
          });
          setExerciseHistory(historyMap);
        } catch (error) {
          console.error('Error fetching exercise history:', error);
          addNotification('Failed to fetch exercise history', 'error');
        }
      }
    };

    fetchExerciseHistory();
  }, [currentPlan, getExerciseHistory, addNotification]);

  useEffect(() => {
    const loadWorkout = async () => {
      setIsLoading(true);
      const storedPlan = localStorage.getItem('currentPlan');
      if (storedPlan) {
        try {
          const plan = JSON.parse(storedPlan);
          if (plan && plan.exercises && plan.exercises.length > 0) {
            setCurrentPlan(plan);
            loadStoredData(plan);
          } else {
            throw new Error('Invalid plan data');
          }
        } catch (error) {
          console.error('Error loading workout plan:', error);
          addNotification('Error loading workout plan. Please select a new plan.', 'error');
          navigate('/plans');
        }
      } else {
        addNotification('No workout plan selected', 'error');
        navigate('/plans');
      }
      setIsLoading(false);
    };
  
    loadWorkout();
  }, [navigate, addNotification]);

  useEffect(() => {
    const saveInterval = setInterval(async () => {
      if (currentPlan) {
        try {
          await saveProgress({
            plan: currentPlan,
            sets,
            currentExerciseIndex,
            startTime,
            notes,
            lastSetValues,
          });
        } catch (error) {
          console.error('Failed to save progress:', error);
          addNotification('Failed to save progress', 'error');
        }
      }
    }, 30000); // Save every 30 seconds
  
    return () => clearInterval(saveInterval);
  }, [currentPlan, sets, currentExerciseIndex, startTime, notes, lastSetValues, saveProgress, addNotification]);

  useEffect(() => {
    let timer;
    if (startTime) {
      timer = setInterval(() => {
        setElapsedTime(prevTime => prevTime + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [startTime]);

  useEffect(() => {
    saveDataToLocalStorage();
  }, [currentPlan, sets, currentExerciseIndex, notes, lastSetValues]);

  const loadStoredData = useCallback((plan) => {
    const storedSets = localStorage.getItem('currentSets');
    const storedIndex = localStorage.getItem('currentExerciseIndex');
    const storedStartTime = localStorage.getItem('workoutStartTime');
    const storedNotes = localStorage.getItem('workoutNotes');
    const storedLastSetValues = localStorage.getItem('lastSetValues');

    const initialRequiredSets = {};
    plan.exercises.forEach(exercise => {
      initialRequiredSets[exercise._id] = exercise.requiredSets || 3;
    });
    setRequiredSets(initialRequiredSets);

    if (storedSets) {
      setSets(JSON.parse(storedSets));
    } else {
      setSets(plan.exercises.map(() => []));
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

    if (storedNotes) {
      setNotes(JSON.parse(storedNotes));
    } else {
      setNotes(plan.exercises.map(() => ''));
    }

    if (storedLastSetValues) {
      setLastSetValues(JSON.parse(storedLastSetValues));
    }
  }, []);

  const saveDataToLocalStorage = useCallback(() => {
    if (currentPlan) {
      localStorage.setItem('currentPlan', JSON.stringify(currentPlan));
    }
    if (sets.length > 0) {
      localStorage.setItem('currentSets', JSON.stringify(sets));
    }
    localStorage.setItem('currentExerciseIndex', currentExerciseIndex.toString());
    localStorage.setItem('workoutNotes', JSON.stringify(notes));
    localStorage.setItem('lastSetValues', JSON.stringify(lastSetValues));
  }, [currentPlan, sets, currentExerciseIndex, notes, lastSetValues]);

  const handleSetComplete = useCallback(async () => {
    if (!weight || !reps) {
      addNotification('Please enter both weight and reps', 'error');
      return;
    }
  
    const newSet = {
      weight: Number(weight),
      reps: Number(reps),
      completedAt: new Date().toISOString(),
      skippedRest: isResting
    };
  
    setSets(prevSets => {
      const newSets = [...prevSets];
      newSets[currentExerciseIndex] = [
        ...(newSets[currentExerciseIndex] || []),
        newSet
      ];
      return newSets;
    });
  
    setLastSetValues(prev => ({
      ...prev,
      [currentPlan.exercises[currentExerciseIndex]._id]: { weight, reps }
    }));
  
    try {
      await saveProgress({
        plan: currentPlan._id,
        exercise: currentPlan.exercises[currentExerciseIndex]._id,
        set: newSet,
        currentExerciseIndex,
        lastSetValues: {
          ...lastSetValues,
          [currentPlan.exercises[currentExerciseIndex]._id]: { weight, reps }
        },
        startTime: startTime.toISOString()
      });
      addNotification('Set completed and progress saved!', 'success');
    } catch (error) {
      console.error('Error saving progress:', error);
      addNotification('Failed to save progress', 'error');
    }
  
    startRestTimer();
    updateProgression();
  }, [weight, reps, isResting, currentExerciseIndex, currentPlan, lastSetValues, startTime, saveProgress, addNotification, startRestTimer]);

  const updateProgression = useCallback(() => {
    const totalExercises = currentPlan.exercises.length;
    const completedExercises = currentPlan.exercises.filter((exercise, index) => 
      isExerciseComplete(exercise._id, sets[index] || [])
    ).length;
    const newProgression = (completedExercises / totalExercises) * 100;
    setProgression(newProgression);
  }, [currentPlan, sets, isExerciseComplete]);

  const handleFinishWorkout = useCallback(async () => {
    try {
      // Ensure the final exercise progress is saved
      await saveProgress({
        plan: currentPlan._id,
        exercise: currentPlan.exercises[currentExerciseIndex]._id,
        sets: sets[currentExerciseIndex] || [],
        notes: notes[currentExerciseIndex],
        currentExerciseIndex,
        lastSetValues,
        startTime: startTime.toISOString()
      });
    
      // Recalculate the final progression
      const finalProgression = calculateProgress();
    
      const endTime = new Date();
      const completedWorkout = {
        plan: currentPlan._id,
        planName: currentPlan.name,
        exercises: currentPlan.exercises.map((exercise, index) => ({
          exercise: exercise._id,
          sets: sets[index] || [],
          completedAt: sets[index] && sets[index].length > 0 
            ? sets[index][sets[index].length - 1].completedAt 
            : endTime.toISOString(),
          notes: notes[index]
        })),
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        totalPauseTime,
        skippedPauses,
        progression: finalProgression
      };
      
      await addWorkout(completedWorkout);
      await clearWorkout();
      addNotification('Workout completed and saved!', 'success');
      resetWorkoutState();
      clearLocalStorage();
      navigate('/');
    } catch (error) {
      console.error('Error saving workout:', error);
      addNotification('Failed to save workout. Please try again.', 'error');
    }
  }, [currentPlan, currentExerciseIndex, sets, notes, lastSetValues, startTime, totalPauseTime, skippedPauses, saveProgress, addWorkout, clearWorkout, addNotification, navigate, calculateProgress]);

  const handleCancelWorkout = useCallback(() => {
    if (isConfirmingCancel) return;

    setIsConfirmingCancel(true);
    addNotification(
      'Are you sure you want to cancel this workout? All progress will be lost.',
      'warning',
      [
        {
          label: 'Yes, Cancel',
          onClick: async () => {
            try {
              await clearWorkout();
              resetWorkoutState();
              clearLocalStorage();
              addNotification('Workout cancelled', 'info');
              setIsConfirmingCancel(false);
              navigate('/plans');
            } catch (error) {
              console.error('Error cancelling workout:', error);
              addNotification('Failed to cancel workout. Please try again.', 'error');
            }
          },
        },
        {
          label: 'No, Continue',
          onClick: () => {
            setIsConfirmingCancel(false);
          },
        },
      ],
      0
    );
  }, [isConfirmingCancel, clearWorkout, addNotification, navigate]);

  const resetWorkoutState = useCallback(() => {
    setCurrentPlan(null);
    setSets([]);
    setNotes([]);
    setStartTime(null);
    setElapsedTime(0);
    setLastSetValues({});
    setCurrentExerciseIndex(0);
    setWeight('');
    setReps('');
    setRestTime(60);
    setTotalPauseTime(0);
    setSkippedPauses(0);
    setProgression(0);
    setRequiredSets({});
  }, []);

  const clearLocalStorage = useCallback(() => {
    localStorage.removeItem('currentPlan');
    localStorage.removeItem('currentSets');
    localStorage.removeItem('currentExerciseIndex');
    localStorage.removeItem('workoutStartTime');
    localStorage.removeItem('workoutNotes');
    localStorage.removeItem('lastSetValues');
  }, []);

  const safelyFormatNumber = useCallback((value, decimalPlaces = 2) => {
    return typeof value === 'number' ? value.toFixed(decimalPlaces) : '0.00';
  }, []);

  const isExerciseComplete = useCallback((exerciseId, exerciseSets) => {
    return exerciseSets.length >= (requiredSets[exerciseId] || 0);
  }, [requiredSets]);

  const calculateProgress = useCallback(() => {
    if (!currentPlan || !currentPlan.exercises || currentPlan.exercises.length === 0) {
      return 0;
    }
    const totalExercises = currentPlan.exercises.length;
    const completedExercises = currentPlan.exercises.filter((exercise, index) => 
      isExerciseComplete(exercise._id, sets[index] || [])
    ).length;
    return (completedExercises / totalExercises) * 100;
  }, [currentPlan, sets, isExerciseComplete]);

  const handleNoteChange = useCallback((index, value) => {
    setNotes(prevNotes => {
      const newNotes = [...prevNotes];
      newNotes[index] = value;
      return newNotes;
    });
  }, []);

  const handleExerciseChange = useCallback(async (newIndex) => {
    try {
      await saveProgress({
        plan: currentPlan._id,
        exercise: currentPlan.exercises[currentExerciseIndex]._id,
        sets: sets[currentExerciseIndex] || [],
        notes: notes[currentExerciseIndex],
        currentExerciseIndex,
        lastSetValues,
        startTime: startTime.toISOString()
      });
    } catch (error) {
      console.error('Error saving progress before switching exercise:', error);
      addNotification('Failed to save progress', 'error');
    }
  
    setCurrentExerciseIndex(newIndex);
    
    const newExercise = currentPlan.exercises[newIndex];
    const lastValues = lastSetValues[newExercise._id];
    if (lastValues) {
      setWeight(lastValues.weight);
      setReps(lastValues.reps);
    } else {
      setWeight('');
      setReps('');
    }
  }, [currentPlan, currentExerciseIndex, sets, notes, lastSetValues, startTime, saveProgress, addNotification]);

  const handleTouchStart = useCallback((e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  }, []);

  const handleTouchMove = useCallback((e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && currentExerciseIndex < currentPlan.exercises.length - 1) {
      handleExerciseChange(currentExerciseIndex + 1);
    } else if (isRightSwipe && currentExerciseIndex > 0) {
      handleExerciseChange(currentExerciseIndex - 1);
    }

    setTouchStart(null);
    setTouchEnd(null);
  }, [touchStart, touchEnd, currentExerciseIndex, currentPlan, handleExerciseChange]);

  const toggleExerciseDetails = useCallback(() => {
    setIsExerciseDetailsOpen(!isExerciseDetailsOpen);
  }, [isExerciseDetailsOpen]);

  const toggleExerciseOptions = useCallback(() => {
    setIsExerciseOptionsOpen(!isExerciseOptionsOpen);
  }, [isExerciseOptionsOpen]);

  const togglePreviousWorkout = useCallback(() => {
    setIsPreviousWorkoutOpen(!isPreviousWorkoutOpen);
  }, [isPreviousWorkoutOpen]);

  const toggleCurrentSetLog = useCallback(() => {
    setIsCurrentSetLogOpen(!isCurrentSetLogOpen);
  }, [isCurrentSetLogOpen]);

  if (isLoading) {
    return <div className="text-center mt-8">Loading workout...</div>;
  }

  if (!currentPlan || !currentPlan.exercises || currentPlan.exercises.length === 0) {
    return (
      <div className="text-center mt-8">
        <p>No workout plan or exercises found. Please select a plan.</p>
        <button
          onClick={() => navigate('/plans')}
          className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Go to Plans
        </button>
      </div>
    );
  }

  const currentExercise = currentPlan.exercises[currentExerciseIndex];

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
          <div className="progress-bar-fill" style={{width: `${safelyFormatNumber(calculateProgress())}%`}}></div>
        </div>
        <p className="text-sm mt-2 text-center">Overall Progress: {safelyFormatNumber(calculateProgress())}%</p>
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
            {currentExercise ? (
              <>
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
                      <strong>Sets completed:</strong> {(sets[currentExerciseIndex] || []).length} / {requiredSets[currentExercise._id] || 0}
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
              </>
            ) : (
              <p>No exercise data available for this index.</p>
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
        <span>Previous Workout and Exercise Performance</span>
        {isPreviousWorkoutOpen ? <FiChevronUp /> : <FiChevronDown />}
      </button>
      <div className={`collapsible-content ${isPreviousWorkoutOpen ? 'open' : ''}`}>
        <PreviousWorkoutDisplay 
          previousWorkout={previousWorkout}
          exerciseHistory={exerciseHistory[currentExercise?._id]}
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
                  {sets[index] ? sets[index].length : 0} / {requiredSets[exercise._id] || 0} sets completed
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