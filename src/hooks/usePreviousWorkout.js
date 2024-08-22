// src/hooks/usePreviousWorkout.js

import { useState, useEffect } from 'react';
import axios from 'axios';

export const usePreviousWorkout = (planId, API_URL, addNotification) => {
  const [isPreviousWorkoutLoading, setIsPreviousWorkoutLoading] = useState(false);
  const [previousWorkout, setPreviousWorkout] = useState(null);

  useEffect(() => {
    const fetchPreviousWorkout = async () => {
      if (!planId) return;
      
      setIsPreviousWorkoutLoading(true);
      try {
        const response = await axios.get(`${API_URL}/workouts/last/${planId}`, {
          headers: { 'x-auth-token': localStorage.getItem('token') }
        });
        setPreviousWorkout(response.data);
      } catch (error) {
        console.error('Error fetching previous workout:', error);
        addNotification('Failed to fetch previous workout data', 'error');
      } finally {
        setIsPreviousWorkoutLoading(false);
      }
    };

    fetchPreviousWorkout();
  }, [planId, API_URL, addNotification]);

  return { isPreviousWorkoutLoading, previousWorkout };
};