import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

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

  const API_URL = 'http://localhost:4500/api';

  const getAuthConfig = () => {
    const token = localStorage.getItem('token');
    return {
      headers: { 'x-auth-token': token }
    };
  };

  const fetchWorkoutHistory = useCallback(async () => {
    if (user) {
      try {
        const response = await axios.get(`${API_URL}/workouts/user`, getAuthConfig());
        setWorkoutHistory(response.data);
      } catch (error) {
        console.error('Error fetching workout history:', error);
      }
    }
  }, [user]);

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
      const response = await axios.get(`${API_URL}/workouts`, getAuthConfig());
      setWorkouts(response.data);
    } catch (error) {
      console.error('Error fetching workouts:', error);
    }
  };

  const addWorkout = async (workout) => {
    try {
      console.log('Sending workout data:', workout);
      const response = await axios.post(`${API_URL}/workouts`, workout, getAuthConfig());
      console.log('Server response:', response.data);
      setWorkoutHistory(prevHistory => [response.data, ...prevHistory]);
      setWorkouts(prevWorkouts => [...prevWorkouts, response.data]);
    } catch (error) {
      console.error('Error adding workout:', error.response?.data || error.message);
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
    } catch (error) {
      console.error('Error updating workout:', error);
    }
  };

  const deleteWorkout = async (id) => {
    try {
      await axios.delete(`${API_URL}/workouts/${id}`, getAuthConfig());
      setWorkouts(prevWorkouts => prevWorkouts.filter(workout => workout._id !== id));
      setWorkoutHistory(prevHistory => prevHistory.filter(workout => workout._id !== id));
    } catch (error) {
      console.error('Error deleting workout:', error);
    }
  };

  // Exercises
  const fetchExercises = async () => {
    try {
      const response = await axios.get(`${API_URL}/exercises`, getAuthConfig());
      setExercises(response.data);
    } catch (error) {
      console.error('Error fetching exercises:', error);
    }
  };

  const addExercise = async (exercise) => {
    try {
      const response = await axios.post(`${API_URL}/exercises`, exercise, getAuthConfig());
      setExercises(prevExercises => [...prevExercises, response.data]);
    } catch (error) {
      console.error('Error adding exercise:', error);
    }
  };

  const updateExercise = async (id, updatedExercise) => {
    try {
      const response = await axios.put(`${API_URL}/exercises/${id}`, updatedExercise, getAuthConfig());
      setExercises(prevExercises =>
        prevExercises.map(exercise =>
          exercise._id === id ? response.data : exercise
        )
      );
    } catch (error) {
      console.error('Error updating exercise:', error);
    }
  };

  const deleteExercise = async (id) => {
    try {
      await axios.delete(`${API_URL}/exercises/${id}`, getAuthConfig());
      setExercises(prevExercises => prevExercises.filter(exercise => exercise._id !== id));
    } catch (error) {
      console.error('Error deleting exercise:', error);
    }
  };

  // Workout Plans
  const fetchWorkoutPlans = async () => {
    try {
      const response = await axios.get(`${API_URL}/workoutplans`, getAuthConfig());
      setWorkoutPlans(response.data);
    } catch (error) {
      console.error('Error fetching workout plans:', error);
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
    } catch (error) {
      console.error('Error adding workout plan:', error.response ? error.response.data : error.message);
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
    } catch (error) {
      console.error('Error updating workout plan:', error);
    }
  };

  const deleteWorkoutPlan = async (id) => {
    try {
      await axios.delete(`${API_URL}/workoutplans/${id}`, getAuthConfig());
      setWorkoutPlans(prevPlans => prevPlans.filter(plan => plan._id !== id));
    } catch (error) {
      console.error('Error deleting workout plan:', error);
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