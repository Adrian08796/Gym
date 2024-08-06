// context/GymContext.jsx

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
import { useNotification } from './NotificationContext';
export const hostName = 'http://192.168.178.42';

const GymContext = createContext();

export function useGymContext() {
  return useContext(GymContext);
}

export function GymProvider({ children }) {
  const [workouts, setWorkouts] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [workoutPlans, setWorkoutPlans] = useState([]);
  const [workoutHistory, setWorkoutHistory] = useState([]);
  const { user } = useAuth();
  const { addNotification } = useNotification();
  
  const API_URL = `${hostName}:4500/api`;

  const getAuthConfig = () => {
    const token = localStorage.getItem('token');
    return {
      headers: { 'x-auth-token': token }
    };
  };

  const toTitleCase = (str) => {
    return str.replace(
      /\w\S*/g,
      function(txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
      }
    );
  };

  const fetchWorkoutHistory = useCallback(async () => {
    if (user) {
      try {
        const response = await axios.get(`${API_URL}/workouts/user`, getAuthConfig());
        setWorkoutHistory(response.data);
      } catch (error) {
        console.error('Error fetching workout history:', error);
        addNotification('Failed to fetch workout history', 'error');
      }
    }
  }, [user, addNotification]);

  useEffect(() => {
    if (user) {
      fetchWorkouts();
      fetchExercises();
      fetchWorkoutPlans();
      fetchWorkoutHistory();
    }
  }, [user, fetchWorkoutHistory]);

  // Workouts
  const fetchWorkouts = async () => {
    try {
      const response = await axios.get(`${API_URL}/workouts/user`, getAuthConfig());
      setWorkouts(response.data);
    } catch (error) {
      console.error('Error fetching workouts:', error);
      addNotification('Failed to fetch workouts', 'error');
    }
  };

  const addWorkout = async (workout) => {
    try {
      console.log('Sending workout data:', workout);
      const response = await axios.post(`${API_URL}/workouts`, workout, getAuthConfig());
      console.log('Server response:', response.data);
      setWorkoutHistory(prevHistory => [response.data, ...prevHistory]);
      setWorkouts(prevWorkouts => [...prevWorkouts, response.data]);
      addNotification('Workout added successfully', 'success');
    } catch (error) {
      console.error('Error adding workout:', error.response?.data || error.message);
      addNotification('Failed to add workout', 'error');
      throw error;
    }
  };

  const updateWorkout = async (id, updatedWorkout) => {
    try {
      const response = await axios.put(`${API_URL}/workouts/${id}`, updatedWorkout, getAuthConfig());
      setWorkouts(prevWorkouts =>
        prevWorkouts.map(workout =>
          workout._id === id ? response.data : workout
        )
      );
      setWorkoutHistory(prevHistory =>
        prevHistory.map(workout =>
          workout._id === id ? response.data : workout
        )
      );
      addNotification('Workout updated successfully', 'success');
    } catch (error) {
      console.error('Error updating workout:', error);
      addNotification('Failed to update workout', 'error');
    }
  };

  const deleteWorkout = async (id) => {
    try {
      await axios.delete(`${API_URL}/workouts/${id}`, getAuthConfig());
      setWorkouts(prevWorkouts => prevWorkouts.filter(workout => workout._id !== id));
      setWorkoutHistory(prevHistory => prevHistory.filter(workout => workout._id !== id));
      addNotification('Workout deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting workout:', error);
      addNotification('Failed to delete workout', 'error');
    }
  };

  // Exercises
const fetchExercises = async () => {
  try {
    const response = await axios.get(`${API_URL}/exercises`, getAuthConfig());
    const formattedExercises = response.data.map(exercise => ({
      ...exercise,
      name: toTitleCase(exercise.name),
      description: toTitleCase(exercise.description),
      target: toTitleCase(exercise.target)
    }));
    setExercises(formattedExercises);
  } catch (error) {
    console.error('Error fetching exercises:', error);
    addNotification('Failed to fetch exercises', 'error');
  }
};

const addExercise = async (exercise) => {
  try {
    const exerciseWithTitleCase = {
      ...exercise,
      name: toTitleCase(exercise.name),
      description: toTitleCase(exercise.description),
      target: toTitleCase(exercise.target)
    };
    const response = await axios.post(`${API_URL}/exercises`, exerciseWithTitleCase, getAuthConfig());
    setExercises(prevExercises => [...prevExercises, response.data]);
    return response.data; // Return the newly added exercise
  } catch (error) {
    console.error('Error adding exercise:', error);
    throw error;
  }
};

const updateExercise = async (id, updatedExercise) => {
  try {
    const exerciseWithTitleCase = {
      ...updatedExercise,
      name: toTitleCase(updatedExercise.name),
      description: toTitleCase(updatedExercise.description),
      target: toTitleCase(updatedExercise.target)
    };
    const response = await axios.put(`${API_URL}/exercises/${id}`, exerciseWithTitleCase, getAuthConfig());
    setExercises(prevExercises =>
      prevExercises.map(exercise =>
        exercise._id === id ? response.data : exercise
      )
    );
    return response.data; // Return the updated exercise
  } catch (error) {
    console.error('Error updating exercise:', error);
    throw error;
  }
};

  const deleteExercise = async (id) => {
    try {
      await axios.delete(`${API_URL}/exercises/${id}`, getAuthConfig());
      setExercises(prevExercises => prevExercises.filter(exercise => exercise._id !== id));
      addNotification('Exercise deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting exercise:', error);
      addNotification('Failed to delete exercise', 'error');
    }
  };

  // Workout Plans
  const fetchWorkoutPlans = async () => {
    try {
      const response = await axios.get(`${API_URL}/workoutplans`, getAuthConfig());
      setWorkoutPlans(response.data);
    } catch (error) {
      console.error('Error fetching workout plans:', error);
      addNotification('Failed to fetch workout plans', 'error');
    }
  };

  const addWorkoutPlan = async (plan) => {
    try {
      const planToSend = {
        name: plan.name,
        exercises: plan.exercises.map(exercise => exercise._id)
      };
      const response = await axios.post(`${API_URL}/workoutplans`, planToSend, getAuthConfig());
      const newPlan = {
        ...response.data,
        exercises: plan.exercises
      };
      setWorkoutPlans(prevPlans => [...prevPlans, newPlan]);
      addNotification('Workout plan added successfully', 'success');
    } catch (error) {
      console.error('Error adding workout plan:', error.response ? error.response.data : error.message);
      addNotification('Failed to add workout plan', 'error');
      throw error;
    }
  };

  const updateWorkoutPlan = async (id, updatedPlan) => {
    try {
      const response = await axios.put(`${API_URL}/workoutplans/${id}`, updatedPlan, getAuthConfig());
      setWorkoutPlans(prevPlans =>
        prevPlans.map(plan =>
          plan._id === id ? response.data : plan
        )
      );
      addNotification('Workout plan updated successfully', 'success');
    } catch (error) {
      console.error('Error updating workout plan:', error);
      addNotification('Failed to update workout plan', 'error');
    }
  };

  const deleteWorkoutPlan = async (id) => {
    try {
      const response = await axios.delete(`${API_URL}/workoutplans/${id}`, getAuthConfig());
      console.log('Server response:', response.data);
      setWorkoutPlans(prevPlans => prevPlans.filter(plan => plan._id !== id));
      
      // Update workout history to reflect deleted plan
      setWorkoutHistory(prevHistory => 
        prevHistory.map(workout => 
          workout.plan && workout.plan._id === id 
            ? { ...workout, plan: null, planDeleted: true } 
            : workout
        )
      );
      addNotification('Workout plan deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting workout plan:', error.response?.data || error.message);
      addNotification('Failed to delete workout plan', 'error');
      throw error;
    }
  };

  return (
    <GymContext.Provider value={{
      workouts,
      exercises,
      workoutPlans,
      workoutHistory,
      addWorkout,
      updateWorkout,
      deleteWorkout,
      addExercise,
      updateExercise,
      deleteExercise,
      addWorkoutPlan,
      updateWorkoutPlan,
      deleteWorkoutPlan,
      fetchWorkoutHistory
    }}>
      {children}
    </GymContext.Provider>
  );
}

export default GymProvider;