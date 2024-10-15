// src/pages/WorkoutSummary.jsx

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGymContext } from '../context/GymContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { formatDuration, formatTime, formatDate } from '../utils/dateUtils';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';

function WorkoutSummary() {
  const { workoutHistory, fetchWorkoutHistory } = useGymContext();
  const { user } = useAuth();
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  const [sortOrder, setSortOrder] = useState('desc');
  const [filterPlan, setFilterPlan] = useState('');
  const [expandedExercises, setExpandedExercises] = useState({});

  useEffect(() => {
    if (user) {
      fetchWorkoutHistory();
    }
  }, [user, fetchWorkoutHistory]);

  if (!user) {
    return <div className="container mx-auto mt-8">Please log in to view your workout history.</div>;
  }

  if (workoutHistory.length === 0) {
    return <div className="container mx-auto mt-8">No workout history available.</div>;
  }

  const sortedWorkouts = [...workoutHistory].sort((a, b) => {
    const dateA = new Date(a.startTime);
    const dateB = new Date(b.startTime);
    return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
  });

  const filteredWorkouts = filterPlan
    ? sortedWorkouts.filter(workout => workout.planName.toLowerCase().includes(filterPlan.toLowerCase()))
    : sortedWorkouts;

  const toggleSortOrder = () => {
    setSortOrder(prevOrder => prevOrder === 'desc' ? 'asc' : 'desc');
  };

  const toggleExerciseExpansion = (workoutId, exerciseIndex) => {
    setExpandedExercises(prev => ({
      ...prev,
      [workoutId]: {
        ...prev[workoutId],
        [exerciseIndex]: !prev[workoutId]?.[exerciseIndex]
      }
    }));
  };

  const renderSetDetails = (set, exerciseCategory) => {
    if (exerciseCategory === 'Strength') {
      return `${set.weight} kg x ${set.reps} reps`;
    } else if (exerciseCategory === 'Cardio') {
      let details = `${set.duration} minutes`;
      if (set.distance) details += `, ${set.distance} km`;
      if (set.intensity) details += `, Intensity: ${set.intensity}`;
      if (set.incline) details += `, Incline: ${set.incline}%`;
      return details;
    }
    return 'No data available';
  };

  return (
    <div className={`container mx-auto mt-8 ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-100 text-gray-900'}`}>
      <h2 data-aos="fade-up" className="header text-center text-gray-800 dark:text-white text-3xl font-bold mb-4">Workout <span className='headerSpan'>History</span></h2>
      <div className="mb-4 flex flex-col sm:flex-row sm:justify-between sm:items-center">
        <button
          onClick={toggleSortOrder}
          className={`mb-2 sm:mb-0 bg-emerald-500 text-white hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700 hover:shadow-md font-bold py-1 px-3 rounded`}
        >
          Sort {sortOrder === 'desc' ? 'Oldest First' : 'Newest First'}
        </button>
        <input
          type="text"
          placeholder="Filter by plan name"
          value={filterPlan}
          onChange={(e) => setFilterPlan(e.target.value)}
          className={`px-2 py-1 border rounded ${darkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'}`}
        />
      </div>
      {filteredWorkouts.map((workout) => (
        <div key={workout._id} className={`mb-8 p-4 border rounded shadow ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'}`}>
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-xl font-semibold">
              {workout.planName} {workout.planDeleted && <span className="text-red-500">(Deleted)</span>}
            </h3>
            <p>{formatDate(workout.date || workout.startTime)}</p>
          </div>
          <div className="mb-4">
            <h4 className="font-semibold mb-2">Exercises:</h4>
            <ul className="list-none">
              {workout.exercises.map((exercise, index) => (
                <li key={index} className="mb-2">
                  <div className="flex items-center">
                    <button
                      onClick={() => toggleExerciseExpansion(workout._id, index)}
                      className="flex items-center text-blue-500 hover:text-blue-700"
                    >
                      {expandedExercises[workout._id]?.[index] ? <FiChevronUp className="mr-1" /> : <FiChevronDown className="mr-1" />}
                      {exercise.exercise ? exercise.exercise.name : 'Unknown Exercise'}
                    </button>
                  </div>
                  {expandedExercises[workout._id]?.[index] && (
                    <div className="ml-6 mt-2">
                      {exercise.sets && exercise.sets.length > 0 ? (
                        <ul className="list-disc">
                          {exercise.exercise.category === 'Cardio' ? (
                            <li className={`mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              {renderSetDetails(exercise.sets[0], exercise.exercise.category)}
                            </li>
                          ) : (
                            exercise.sets.map((set, setIndex) => (
                              <li key={setIndex} className={`mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                Set {setIndex + 1}: {renderSetDetails(set, exercise.exercise.category)}
                                {set.completedAt && (
                                  <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} ml-2`}>
                                    (at {formatTime(set.completedAt)})
                                  </span>
                                )}
                                {/* {set.skippedRest && (
                                  <span className="text-yellow-500 ml-2">(Rest Skipped)</span>
                                )} */}
                              </li>
                            ))
                          )}
                        </ul>
                      ) : (
                        <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>No data recorded for this exercise.</p>
                      )}
                      {exercise.notes && (
                        <p className={`mt-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          <strong>Notes:</strong> {exercise.notes}
                        </p>
                      )}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            <p>Duration: {formatDuration(workout.startTime, workout.endTime)}</p>
            <p>Progression: {workout.progression ? `${workout.progression.toFixed(2)}%` : 'N/A'}</p>
          </div>
        </div>
      ))}
      <button
        onClick={() => navigate('/')}
        className={`bg-emerald-500 text-white hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700 hover:shadow-md font-bold py-1 px-3 rounded`}
      >
        Back to Home
      </button>
    </div>
  );
}

export default WorkoutSummary;