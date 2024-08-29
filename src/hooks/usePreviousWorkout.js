// src/hooks/usePreviousWorkout.js

import { useState, useEffect } from "react";
import axiosInstance from "./../utils/axiosConfig";

export const usePreviousWorkout = (planId, API_URL, addNotification) => {
  const [isPreviousWorkoutLoading, setIsPreviousWorkoutLoading] =
    useState(false);
  const [previousWorkout, setPreviousWorkout] = useState(null);

  useEffect(() => {
    const fetchPreviousWorkout = async () => {
      if (!planId) return;

      setIsPreviousWorkoutLoading(true);
      try {
        const response = await axiosInstance.get(
          `${API_URL}/api/workouts/last/${planId}`,
          {
            headers: { "x-auth-token": localStorage.getItem("token") },
          }
        );
        setPreviousWorkout(response.data);
      } catch (error) {
        console.error("Error fetching previous workout:", error);
        addNotification("Failed to fetch previous workout data", "error");
      } finally {
        setIsPreviousWorkoutLoading(false);
      }
    };

    fetchPreviousWorkout();
  }, [planId, API_URL, addNotification]);

  return { isPreviousWorkoutLoading, previousWorkout };
};
