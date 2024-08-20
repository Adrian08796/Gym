// src/pages/WorkoutTracker.jsx

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGymContext } from '../context/GymContext';
import { useNotification } from '../context/NotificationContext';
import { useTheme } from '../context/ThemeContext';
import { CSSTransition, SwitchTransition } from 'react-transition-group';
import { FiChevronLeft, FiChevronRight, FiChevronDown, FiChevronUp, FiSettings, FiX } from 'react-icons/fi';
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
  const [previousWorkout, setPreviousWorkout] = useState(null);
  const [isPreviousWorkoutLoading, setIsPreviousWorkoutLoading] = useState(false);
  const [totalPauseTime, setTotalPauseTime] = useState(0);
  const [skippedPauses, setSkippedPauses] = useState(0);
  const [progression, setProgression] = useState(0);
  const [lastSetValues, setLastSetValues] = useState({});
  const [requiredSets, setRequiredSets] = useState({});
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [isPreviousWorkoutOpen, setIsPreviousWorkoutOpen] = useState(false);
  const [isCurrentSetLogOpen, setIsCurrentSetLogOpen] = useState(false);
  const [isExerciseOptionsOpen, setIsExerciseOptionsOpen] = useState(false);
  const [isExerciseDetailsOpen, setIsExerciseDetailsOpen] = useState(false);

  const { addWorkout, getLastWorkoutByPlan, workoutHistory } = useGymContext();
  const { addNotification } = useNotification();
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  const nodeRef = useRef(null);

  const loadStoredData = useCallback(() => {
    const storedPlan = localStorage.getItem('currentPlan');
    const storedSets = localStorage.getItem('currentSets');
    const storedIndex = localStorage.getItem('currentExerciseIndex');
    const storedStartTime = localStorage.getItem('workoutStartTime');
    const storedNotes = localStorage.getItem('workoutNotes');
    const storedLastSetValues = localStorage.getItem('lastSetValues');

    if (storedPlan) {
      try {
        const parsedPlan = JSON.parse(storedPlan);
        setCurrentPlan(parsedPlan);
        
        // Initialize requiredSets based on the plan
        const initialRequiredSets = {};
        parsedPlan.exercises.forEach(exercise => {
          initialRequiredSets[exercise._id] = exercise.requiredSets || 3; // Default to 3 if not specified
        });
        setRequiredSets(initialRequiredSets);

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

        if (storedNotes) {
          setNotes(JSON.parse(storedNotes));
        } else {
          setNotes(parsedPlan.exercises.map(() => ''));
        }

        if (storedLastSetValues) {
          setLastSetValues(JSON.parse(storedLastSetValues));
        }
      } catch (error) {
        console.error('Error parsing stored data:', error);
        clearLocalStorage();
        addNotification('Error loading workout data. Starting a new workout.', 'error');
      }
    }
  }, [addNotification]);

  useEffect(() => {
    loadStoredData();
  }, [loadStoredData]);

  useEffect(() => {
    if (currentPlan) {
      const fetchPreviousWorkout = async () => {
        setIsPreviousWorkoutLoading(true);
        try {
          let lastWorkout;
          if (currentPlan._id) {
            lastWorkout = await getLastWorkoutByPlan(currentPlan._id);
          }
          if (!lastWorkout) {
            lastWorkout = workoutHistory.find(workout => 
              workout.exercises.some(ex => 
                currentPlan.exercises.some(planEx => 
                  planEx._id === ex.exercise._id
                )
              )
            );
          }
          setPreviousWorkout(lastWorkout);
        } catch (error) {
          console.error('Error fetching previous workout:', error);
        } finally {
          setIsPreviousWorkoutLoading(false);
        }
      };
      fetchPreviousWorkout();
    } else {
      setPreviousWorkout(null);
      setIsPreviousWorkoutLoading(false);
    }
  }, [currentPlan, getLastWorkoutByPlan, workoutHistory]);

  useEffect(() => {
    const saveDataToLocalStorage = () => {
      if (currentPlan) {
        localStorage.setItem('currentPlan', JSON.stringify(currentPlan));
      }
      if (sets.length > 0) {
        localStorage.setItem('currentSets', JSON.stringify(sets));
      }
      localStorage.setItem('currentExerciseIndex', currentExerciseIndex.toString());
      localStorage.setItem('workoutNotes', JSON.stringify(notes));
      localStorage.setItem('lastSetValues', JSON.stringify(lastSetValues));
    };

    saveDataToLocalStorage();
  }, [currentPlan, sets, currentExerciseIndex, notes, lastSetValues]);

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

  const handleSetComplete = () => {
    if (!weight || !reps) {
      addNotification('Please enter both weight and reps', 'error');
      return;
    }

    setSets(prevSets => {
      const newSets = [...prevSets];
      newSets[currentExerciseIndex] = [
        ...(newSets[currentExerciseIndex] || []),
        { 
          weight: Number(weight), 
          reps: Number(reps), 
          completedAt: new Date().toISOString(),
          skippedRest: isResting
        }
      ];
      return newSets;
    });

    // Store the last set values for the current exercise only
    setLastSetValues(prev => ({
      ...prev,
      [currentPlan.exercises[currentExerciseIndex]._id]: { weight, reps }
    }));

    addNotification('Set completed!', 'success');

    // Always start a new rest timer after completing a set
    startRestTimer();

    updateProgression();
  };

  const startRestTimer = () => {
    setIsResting(true);
    setRemainingRestTime(restTime);
  };

  const skipRestTimer = () => {
    setIsResting(false);
    setRemainingRestTime(0);
    setSkippedPauses(prevSkipped => prevSkipped + 1);
    addNotification('Rest timer skipped', 'info');
  };

  const updateProgression = () => {
    const totalExercises = currentPlan.exercises.length;
    const completedExercises = currentPlan.exercises.filter((exercise, index) => 
      isExerciseComplete(exercise._id, sets[index] || [])
    ).length;
    const newProgression = (completedExercises / totalExercises) * 100;
    setProgression(newProgression);
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
          : endTime.toISOString(),
        notes: notes[index]
      })),
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      totalPauseTime,
      skippedPauses,
      progression
    };
    
    try {
      await addWorkout(completedWorkout);
      addNotification('Workout completed and saved!', 'success');
      clearLocalStorage();
      navigate('/');
    } catch (error) {
      console.error('Error saving workout:', error);
      addNotification('Failed to save workout. Please try again.', 'error');
    }
  };

  const handleCancelWorkout = () => {
    if (window.confirm("Are you sure you want to cancel this workout? All progress will be lost.")) {
      clearLocalStorage();
      setCurrentPlan(null);
      setSets([]);
      setNotes([]);
      setStartTime(null);
      setElapsedTime(0);
      setLastSetValues({});
      addNotification('Workout cancelled', 'info');
    }
  };

  const clearLocalStorage = () => {
    localStorage.removeItem('currentPlan');
    localStorage.removeItem('currentSets');
    localStorage.removeItem('currentExerciseIndex');
    localStorage.removeItem('workoutStartTime');
    localStorage.removeItem('workoutNotes');
    localStorage.removeItem('lastSetValues');
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const isExerciseComplete = (exerciseId, exerciseSets) => {
    return exerciseSets.length >= requiredSets[exerciseId];
  };

  const calculateProgress = () => {
    if (!currentPlan) return 0;
    const totalExercises = currentPlan.exercises.length;
    const completedExercises = currentPlan.exercises.filter((exercise, index) => 
      isExerciseComplete(exercise._id, sets[index] || [])
    ).length;
    return (completedExercises / totalExercises) * 100;
  };

  const handleNoteChange = (index, value) => {
    setNotes(prevNotes => {
      const newNotes = [...prevNotes];
      newNotes[index] = value;
      return newNotes;
    });
  };

  const handleExerciseChange = (newIndex) => {
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
  };

  const handleTouchStart = (e) => {
    setTouchEnd(null); // Reset touchEnd
    setTouchStart(e.targetTouches[0].clientX);
    console.log('Touch start:', e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
    console.log('Touch move:', e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;
    console.log('Touch end - distance:', distance, 'isLeftSwipe:', isLeftSwipe, 'isRightSwipe:', isRightSwipe);

    if (isLeftSwipe && currentExerciseIndex < currentPlan.exercises.length - 1) {
      console.log('Swiping left to next exercise');
      handleExerciseChange(currentExerciseIndex + 1);
    } else if (isRightSwipe && currentExerciseIndex > 0) {
      console.log('Swiping right to previous exercise');
      handleExerciseChange(currentExerciseIndex - 1);
    }
  };

  if (!currentPlan) {
    return (
      <div className={`container mx-auto mt-8 p-4 ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}>
        <h2 className="text-3xl font-bold mb-4">Workout Tracker</h2>
        <p className="text-xl mb-4">No active workout</p>
        <p className="mb-4">To start a new workout, please select a workout plan from the Workout Plans page.</p>
        <button
          onClick={() => navigate('/plans')}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Go to Workout Plans
        </button>
      </div>
    );
  }

  const currentExercise = currentPlan.exercises[currentExerciseIndex];

  const togglePreviousWorkout = () => {
    setIsPreviousWorkoutOpen(!isPreviousWorkoutOpen);
  };

  const toggleCurrentSetLog = () => {
    setIsCurrentSetLogOpen(!isCurrentSetLogOpen);
  };

  const toggleExerciseOptions = () => {
    setIsExerciseOptionsOpen(!isExerciseOptionsOpen);
  };

  const toggleExerciseDetails = () => {
    setIsExerciseDetailsOpen(!isExerciseDetailsOpen);
  };

  return (
    <div className={`container mx-auto mt-8 p-4 ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}>
      <div className="relative mb-6">
        <button
          onClick={handleCancelWorkout}
          className="absolute top-0 right-0 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
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
        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
          <div className="bg-blue-600 h-2.5 rounded-full" style={{width: `${calculateProgress()}%`}}></div>
        </div>
        <p className="text-sm mt-2 text-center">Overall Progress: {calculateProgress().toFixed(2)}%</p>
      </div>

      {/* Exercise carousel */}
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
            className={`exercise-container bg-gray-100 dark:bg-gray-700 shadow-md rounded px-8 pt-6 pb-8 mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
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
                {isExerciseDetailsOpen && (
                  <div className="mt-2">
                    <p className="mb-2"><strong>Description:</strong> {currentExercise.description}</p>
                    <p className="mb-2"><strong>Target Muscle:</strong> {currentExercise.target}</p>
                  </div>
                )}
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
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Complete Set
              </button>
              <button
                onClick={toggleExerciseOptions}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline flex items-center"
              >
                <FiSettings className="mr-2" /> Options
                {isExerciseOptionsOpen ? <FiChevronUp className="ml-2" /> : <FiChevronDown className="ml-2" />}
              </button>
            </div>

            {isExerciseOptionsOpen && (
              <div className="mb-4 p-4 bg-gray-200 dark:bg-gray-600 rounded">
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
            )}

            {isResting && (
              <div className="mb-4">
                <p>Rest Time Remaining: {formatTime(remainingRestTime)}</p>
                <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                  <div 
                    className="bg-green-600 h-2.5 rounded-full" 
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
          className={`bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${currentExerciseIndex === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
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
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Next <FiChevronRight className="inline-block ml-1" />
          </button>
        ) : (
          <button
            onClick={handleFinishWorkout}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Finish Workout
          </button>
        )}
      </div>

      {/* Previous Workout Performance Section */}
      <div className={`mt-8 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-blue-100'}`}>
        <button 
          onClick={togglePreviousWorkout}
          className={`w-full p-4 text-left font-semibold flex justify-between items-center ${darkMode ? 'text-blue-300' : 'text-blue-800'}`}
        >
          <span>Previous Workout Performance</span>
          {isPreviousWorkoutOpen ? <FiChevronUp /> : <FiChevronDown />}
        </button>
        {isPreviousWorkoutOpen && (
          <div className="p-4">
            {isPreviousWorkoutLoading ? (
              <p>Loading previous workout data...</p>
            ) : previousWorkout ? (
              <div>
                <p><strong>Date:</strong> {new Date(previousWorkout.startTime).toLocaleDateString()}</p>
                <p><strong>Duration:</strong> {formatTime((new Date(previousWorkout.endTime) - new Date(previousWorkout.startTime)) / 1000)}</p>
                {previousWorkout.exercises.map((exercise, index) => (
                  <div key={index} className="mb-4">
                    <h4 className={`text-lg font-medium ${darkMode ? 'text-blue-200' : 'text-blue-700'}`}>
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
            ) : (
              <p>No previous workout data available for this plan.</p>
            )}
          </div>
        )}
      </div>

      {/* Set Log */}
      <div className={`mt-8 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-green-100'}`}>
        <button 
          onClick={toggleCurrentSetLog}
          className={`w-full p-4 text-left font-semibold flex justify-between items-center ${darkMode ? 'text-green-300' : 'text-green-800'}`}
        >
          <span>Current Workout Set Log</span>
          {isCurrentSetLogOpen ? <FiChevronUp /> : <FiChevronDown />}
        </button>
        {isCurrentSetLogOpen && (
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
        )}
      </div>
    </div>
  );
}

export default WorkoutTracker;