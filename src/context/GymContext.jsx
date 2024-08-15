// src/context/GymContext.jsx

import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
import { useNotification } from './NotificationContext';

// Update this line to use HTTPS and your DigitalOcean app URL
// export const hostName = 'https://gym-app-xnglh.ondigitalocean.app';
export const hostName = '/api';

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
  
  const API_URL = `${hostName}/api`;

  const getAuthConfig = useCallback(() => {
    const token = localStorage.getItem('token');
    return {
      headers: { 'x-auth-token': token }
    };
  }, []);

  const toTitleCase = (str) => {
    if (typeof str !== 'string') return str;
    return str.replace(
      /\w\S*/g,
      function(txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
      }
    );
  };

  // Fetch workout history
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
  }, [user, addNotification, API_URL, getAuthConfig]);

  // Fetch exercises
  const fetchExercises = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/exercises`, getAuthConfig());
      const formattedExercises = response.data.map(exercise => ({
        ...exercise,
        name: toTitleCase(exercise.name),
        description: toTitleCase(exercise.description),
        target: Array.isArray(exercise.target) 
          ? exercise.target.map(toTitleCase) 
          : toTitleCase(exercise.target)
      }));
      setExercises(formattedExercises);
    } catch (error) {
      console.error('Error fetching exercises:', error);
      addNotification('Failed to fetch exercises', 'error');
    }
  }, [API_URL, getAuthConfig, addNotification]);

  // Fetch workout plans
  const fetchWorkoutPlans = useCallback(async () => {
    if (user) {
      try {
        const response = await axios.get(`${API_URL}/workoutplans`, getAuthConfig());
        const plansWithFullExerciseDetails = await Promise.all(response.data.map(async (plan) => {
          const fullExercises = await Promise.all(plan.exercises.map(async (exercise) => {
            if (!exercise.description || !exercise.imageUrl) {
              const fullExercise = await axios.get(`${API_URL}/exercises/${exercise._id}`, getAuthConfig());
              return fullExercise.data;
            }
            return exercise;
          }));
          return { ...plan, exercises: fullExercises };
        }));
        setWorkoutPlans(plansWithFullExerciseDetails);
        return plansWithFullExerciseDetails;
      } catch (error) {
        console.error('Error fetching workout plans:', error);
        addNotification('Failed to fetch workout plans', 'error');
        return [];
      }
    }
    return [];
  }, [user, API_URL, getAuthConfig, addNotification]);

  useEffect(() => {
    if (user) {
      fetchWorkoutHistory();
      fetchExercises();
      fetchWorkoutPlans();
    }
  }, [user, fetchWorkoutHistory, fetchExercises, fetchWorkoutPlans]);

  // Add a workout (updated to include notes)
  const addWorkout = async (workout) => {
    try {
      console.log('Sending workout data:', JSON.stringify(workout, null, 2));
      const response = await axios.post(`${API_URL}/workouts`, workout, getAuthConfig());
      console.log('Server response:', response.data);
      setWorkoutHistory(prevHistory => [response.data, ...prevHistory]);
      setWorkouts(prevWorkouts => [...prevWorkouts, response.data]);
      addNotification('Workout added successfully', 'success');
    } catch (error) {
      console.error('Error adding workout:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        console.error('Response headers:', error.response.headers);
      } else if (error.request) {
        console.error('No response received:', error.request);
      } else {
        console.error('Error setting up request:', error.message);
      }
      addNotification('Failed to add workout', 'error');
      throw error;
    }
  };

  // Update a workout
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
      return response.data;
    } catch (error) {
      console.error('Error updating workout:', error);
      addNotification('Failed to update workout', 'error');
      throw error;
    }
  };

  // Delete a workout
  const deleteWorkout = async (id) => {
    try {
      await axios.delete(`${API_URL}/workouts/${id}`, getAuthConfig());
      setWorkouts(prevWorkouts => prevWorkouts.filter(workout => workout._id !== id));
      setWorkoutHistory(prevHistory => prevHistory.filter(workout => workout._id !== id));
      addNotification('Workout deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting workout:', error);
      addNotification('Failed to delete workout', 'error');
      throw error;
    }
  };

  // Add an exercise
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
      return response.data;
    } catch (error) {
      console.error('Error adding exercise:', error);
      addNotification('Failed to add exercise', 'error');
      throw error;
    }
  };

  // Update an exercise
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
      return response.data;
    } catch (error) {
      console.error('Error updating exercise:', error);
      addNotification('Failed to update exercise', 'error');
      throw error;
    }
  };

  // Delete an exercise
  const deleteExercise = async (id) => {
    try {
      await axios.delete(`${API_URL}/exercises/${id}`, getAuthConfig());
      setExercises(prevExercises => prevExercises.filter(exercise => exercise._id !== id));
      addNotification('Exercise deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting exercise:', error);
      addNotification('Failed to delete exercise', 'error');
      throw error;
    }
  };

  // Add a workout plan
  const addWorkoutPlan = async (plan) => {
    try {
      const planToSend = {
        ...plan,
        exercises: plan.exercises.map(exercise => 
          typeof exercise === 'string' ? exercise : exercise._id
        )
      };

      const response = await axios.post(`${API_URL}/workoutplans`, planToSend, getAuthConfig());
      
      const fullPlan = {
        ...response.data,
        exercises: await Promise.all(response.data.exercises.map(async (exerciseId) => {
          if (typeof exerciseId === 'string') {
            try {
              const exerciseResponse = await axios.get(`${API_URL}/exercises/${exerciseId}`, getAuthConfig());
              return exerciseResponse.data;
            } catch (error) {
              console.error(`Error fetching exercise ${exerciseId}:`, error);
              return null;
            }
          }
          return exerciseId;
        }))
      };

      setWorkoutPlans(prevPlans => [...prevPlans, fullPlan]);
      addNotification('Workout plan added successfully', 'success');
      return fullPlan;
    } catch (error) {
      console.error('Error adding workout plan:', error);
      addNotification('Failed to add workout plan', 'error');
      throw error;
    }
  };

  // Update a workout plan
  const updateWorkoutPlan = async (id, updatedPlan) => {
    try {
      if (!id) {
        return addWorkoutPlan(updatedPlan);
      }
      const response = await axios.put(`${API_URL}/workoutplans/${id}`, updatedPlan, getAuthConfig());
      setWorkoutPlans(prevPlans =>
        prevPlans.map(plan =>
          plan._id === id ? response.data : plan
        )
      );
      addNotification('Workout plan updated successfully', 'success');
      return response.data;
    } catch (error) {
      console.error('Error updating workout plan:', error);
      addNotification('Failed to update workout plan', 'error');
      throw error;
    }
  };

  // Delete a workout plan
  const deleteWorkoutPlan = async (id) => {
    try {
      await axios.delete(`${API_URL}/workoutplans/${id}`, getAuthConfig());
      setWorkoutPlans(prevPlans => prevPlans.filter(plan => plan._id !== id));
      // Update workouts to mark the plan as deleted instead of removing the association
      setWorkoutHistory(prevHistory => 
        prevHistory.map(workout => 
          workout.plan && workout.plan._id === id 
            ? { ...workout, planDeleted: true, planName: workout.planName || 'Deleted Plan' } 
            : workout
        )
      );
      addNotification('Workout plan deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting workout plan:', error);
      addNotification('Failed to delete workout plan', 'error');
      throw error;
    }
  };

  // Add an exercise to a workout plan
  const addExerciseToPlan = async (planId, exerciseId) => {
    if (!planId || !exerciseId) {
      throw new Error('Plan ID and Exercise ID are required');
    }
    console.log(`Attempting to add exercise ${exerciseId} to plan ${planId}`);
    
    const plan = workoutPlans.find(p => p._id === planId);
    if (!plan) {
      console.error('Plan not found');
      addNotification('Plan not found', 'error');
      return { success: false, error: 'Plan not found' };
    }

    if (plan.exercises.some(e => e._id === exerciseId)) {
      console.log('Exercise is already in the workout plan');
      addNotification('This exercise is already in the workout plan', 'info');
      return { success: false, alreadyInPlan: true };
    }

    try {
      const response = await axios.post(
        `${API_URL}/workoutplans/${planId}/exercises`,
        { exerciseId },
        getAuthConfig()
      );
      
      console.log('Server response:', response.data);
      setWorkoutPlans(prevPlans =>
        prevPlans.map(p =>
          p._id === planId ? response.data : p
        )
      );
      addNotification('Exercise added to plan successfully', 'success');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error adding exercise to plan:', error);
      addNotification(`Failed to add exercise to plan: ${error.response ? error.response.data.message : error.message}`, 'error');
      return { success: false, error };
    }
  };

  // Get the last workout for a given plan
  const getLastWorkoutByPlan = useCallback(async (planId) => {
    try {
      const response = await axios.get(`${API_URL}/workouts/last/${planId}`, getAuthConfig());
      return response.data;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        // No previous workout found, this is not an error
        console.log('No previous workout found for this plan');
        return null;
      }
      console.error('Error fetching last workout:', error);
      addNotification('Failed to fetch last workout', 'error');
      return null;
    }
  }, [API_URL, getAuthConfig, addNotification]);

  const contextValue = useMemo(() => ({
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
    fetchWorkoutHistory,
    fetchWorkoutPlans,
    addExerciseToPlan,
    getLastWorkoutByPlan
  }), [workouts, exercises, workoutPlans, workoutHistory, getLastWorkoutByPlan, fetchWorkoutPlans, fetchWorkoutHistory]);

  return (
    <GymContext.Provider value={contextValue}>
      {children}
    </GymContext.Provider>
  );
}

export default GymProvider;