// src/hooks/usePreviousWorkout.js

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

export const usePreviousWorkout = (currentPlan, API_URL, addNotification) => {
  const [isPreviousWorkoutLoading, setIsPreviousWorkoutLoading] = useState(false);
  const [previousWorkout, setPreviousWorkout] = useState(null);

  const fetchPreviousWorkout = useCallback(async () => {
    if (!currentPlan) return;
    setIsPreviousWorkoutLoading(true);
    try {
      const response = await axios.get(`${API_URL}/workouts/last/${currentPlan._id}`);
      setPreviousWorkout(response.data);
    } catch (error) {
      console.error('Error fetching previous workout:', error);
      addNotification('Failed to fetch previous workout data', 'error');
    } finally {
      setIsPreviousWorkoutLoading(false);
    }
  }, [currentPlan, API_URL, addNotification]);

  useEffect(() => {
    fetchPreviousWorkout();
  }, [fetchPreviousWorkout]);

  return { isPreviousWorkoutLoading, previousWorkout };
};