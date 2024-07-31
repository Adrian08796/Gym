// src/context/GymContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const GymContext = createContext();

export function useGymContext() {
  return useContext(GymContext);
}

export function GymProvider({ children }) {
  const [workouts, setWorkouts] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [workoutPlans, setWorkoutPlans] = useState([]);

  const API_URL = 'http://localhost:4500/api';

  useEffect(() => {
    fetchWorkouts();
    fetchExercises();
    fetchWorkoutPlans();
  }, []);

  // Workouts
  const fetchWorkouts = async () => {
    try {
      const response = await axios.get(`${API_URL}/workouts`);
      setWorkouts(response.data);
    } catch (error) {
      console.error('Error fetching workouts:', error);
    }
  };

  const addWorkout = async (workout) => {
    try {
      const response = await axios.post(`${API_URL}/workouts`, workout);
      setWorkouts(prevWorkouts => [...prevWorkouts, response.data]);
    } catch (error) {
      console.error('Error adding workout:', error);
    }
  };

  const updateWorkout = async (id, updatedWorkout) => {
    try {
      const response = await axios.put(`${API_URL}/workouts/${id}`, updatedWorkout);
      setWorkouts(prevWorkouts =>
        prevWorkouts.map(workout =>
          workout._id === id ? response.data : workout
        )
      );
    } catch (error) {
      console.error('Error updating workout:', error);
    }
  };

  const deleteWorkout = async (id) => {
    try {
      await axios.delete(`${API_URL}/workouts/${id}`);
      setWorkouts(prevWorkouts => prevWorkouts.filter(workout => workout._id !== id));
    } catch (error) {
      console.error('Error deleting workout:', error);
    }
  };

  // Exercises
  const fetchExercises = async () => {
    try {
      const response = await axios.get(`${API_URL}/exercises`);
      setExercises(response.data);
    } catch (error) {
      console.error('Error fetching exercises:', error);
    }
  };

  const addExercise = async (exercise) => {
    try {
      const response = await axios.post(`${API_URL}/exercises`, exercise);
      setExercises(prevExercises => [...prevExercises, response.data]);
    } catch (error) {
      console.error('Error adding exercise:', error);
    }
  };

  const updateExercise = async (id, updatedExercise) => {
    try {
      const response = await axios.put(`${API_URL}/exercises/${id}`, updatedExercise);
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
      await axios.delete(`${API_URL}/exercises/${id}`);
      setExercises(prevExercises => prevExercises.filter(exercise => exercise._id !== id));
    } catch (error) {
      console.error('Error deleting exercise:', error);
    }
  };

  // Workout Plans
  const fetchWorkoutPlans = async () => {
    try {
      const response = await axios.get(`${API_URL}/workoutplans`);
      setWorkoutPlans(response.data);
    } catch (error) {
      console.error('Error fetching workout plans:', error);
    }
  };

  const addWorkoutPlan = async (plan) => {
    try {
      const response = await axios.post(`${API_URL}/workoutplans`, plan);
      setWorkoutPlans(prevPlans => [...prevPlans, response.data]);
    } catch (error) {
      console.error('Error adding workout plan:', error);
    }
  };

  const updateWorkoutPlan = async (id, updatedPlan) => {
    try {
      const response = await axios.put(`${API_URL}/workoutplans/${id}`, updatedPlan);
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
      await axios.delete(`${API_URL}/workoutplans/${id}`);
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
      addWorkout,
      updateWorkout,
      deleteWorkout,
      addExercise,
      updateExercise,
      deleteExercise,
      addWorkoutPlan,
      updateWorkoutPlan,
      deleteWorkoutPlan
    }}>
      {children}
    </GymContext.Provider>
  );
}

export default GymProvider;