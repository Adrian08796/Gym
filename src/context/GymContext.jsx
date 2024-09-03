// src/context/GymContext.jsx

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import axiosInstance from "../utils/axiosConfig";
import { useAuth } from "./AuthContext";
import { useNotification } from "./NotificationContext";

// export const hostName = "https://walrus-app-lqhsg.ondigitalocean.app/backend";
export const hostName = "http://192.168.178.42:4500";

const GymContext = createContext();

export function useGymContext() {
  return useContext(GymContext);
}

export function GymProvider({ children }) {
  const [workouts, setWorkouts] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [workoutPlans, setWorkoutPlans] = useState([]);
  const [workoutHistory, setWorkoutHistory] = useState([]);
  const { user, logout } = useAuth();
  const { addNotification } = useNotification();

  const API_URL = `${hostName}/api`;

  const getAuthConfig = useCallback(() => {
    const token = localStorage.getItem("token");
    axiosInstance.defaults.headers.common['x-auth-token'] = token;
    return axiosInstance;
  }, []);

  const toTitleCase = str => {
    if (typeof str !== "string") return str;
    return str.replace(/\w\S*/g, function (txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
  };

  const getLastWorkoutForPlan = useCallback(
    async planId => {
      try {
        const response = await axiosInstance.get(
          `${API_URL}/workouts/last/${planId}`,
          getAuthConfig()
        );
        return response.data;
      } catch (error) {
        console.error("Error fetching last workout for plan:", error);
        addNotification("Failed to fetch last workout for plan", "error");
        return null;
      }
    },
    [API_URL, getAuthConfig, addNotification]
  );

  const getExerciseById = useCallback(async (exerciseId) => {
    if (!exerciseId || exerciseId === 'undefined') {
      console.error('Invalid exerciseId provided to getExerciseById:', exerciseId);
      throw new Error('Invalid exercise ID');
    }

    try {
      console.log(`Fetching exercise details for exerciseId: ${exerciseId}`);
      const response = await axiosInstance.get(
        `${API_URL}/exercises/${exerciseId}`,
        getAuthConfig()
      );
      console.log('Exercise details response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching exercise details:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        throw new Error(`Failed to fetch exercise details: ${error.response.data.message || error.response.statusText}`);
      } else if (error.request) {
        console.error('No response received:', error.request);
        throw new Error('Failed to fetch exercise details: No response received from server');
      } else {
        console.error('Error setting up request:', error.message);
        throw error;
      }
    }
  }, [API_URL, getAuthConfig]);

  const getExerciseHistory = useCallback(async (exerciseId) => {
    if (!exerciseId || exerciseId === 'undefined') {
      console.error('Invalid exerciseId provided to getExerciseHistory:', exerciseId);
      throw new Error('Invalid exercise ID');
    }

    try {
      console.log(`Fetching exercise history for exerciseId: ${exerciseId}`);
      const response = await axiosInstance.get(
        `${API_URL}/workouts/exercise-history/${exerciseId}`,
        getAuthConfig()
      );
      console.log('Exercise history response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching exercise history:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        throw new Error(`Failed to fetch exercise history: ${error.response.data.message || error.response.statusText}`);
      } else if (error.request) {
        console.error('No response received:', error.request);
        throw new Error('Failed to fetch exercise history: No response received from server');
      } else {
        console.error('Error setting up request:', error.message);
        throw error;
      }
    }
  }, [API_URL, getAuthConfig]);

  const fetchWorkoutHistory = useCallback(async () => {
    if (user) {
      try {
        const response = await axiosInstance.get(
          `${API_URL}/workouts/user`,
          getAuthConfig()
        );
        setWorkoutHistory(response.data);
      } catch (error) {
        console.error("Error fetching workout history:", error);
        addNotification("Failed to fetch workout history", "error");
      }
    }
  }, [user, addNotification, API_URL, getAuthConfig]);

  const fetchExercises = useCallback(async () => {
    try {
      const response = await axiosInstance.get(
        `${API_URL}/exercises`,
        getAuthConfig()
      );
      const formattedExercises = response.data.map(exercise => ({
        ...exercise,
        name: toTitleCase(exercise.name),
        description: toTitleCase(exercise.description),
        target: Array.isArray(exercise.target)
          ? exercise.target.map(toTitleCase)
          : toTitleCase(exercise.target),
      }));
      setExercises(formattedExercises);
    } catch (error) {
      console.error("Error fetching exercises:", error);
      addNotification("Failed to fetch exercises", "error");
    }
  }, [API_URL, getAuthConfig, addNotification]);

  const fetchWorkoutPlans = useCallback(async () => {
    if (user) {
      try {
        const response = await axiosInstance.get(
          `${API_URL}/workoutplans`,
          getAuthConfig()
        );
        const plansWithFullExerciseDetails = await Promise.all(
          response.data.map(async plan => {
            const fullExercises = await Promise.all(
              plan.exercises.map(async exercise => {
                if (!exercise.description || !exercise.imageUrl) {
                  const fullExercise = await axiosInstance.get(
                    `${API_URL}/exercises/${exercise._id}`,
                    getAuthConfig()
                  );
                  return fullExercise.data;
                }
                return exercise;
              })
            );
            return { ...plan, exercises: fullExercises };
          })
        );
        setWorkoutPlans(plansWithFullExerciseDetails);
        return plansWithFullExerciseDetails;
      } catch (error) {
        console.error("Error fetching workout plans:", error);
        addNotification("Failed to fetch workout plans", "error");
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

  const addWorkout = async workout => {
    try {
      console.log("Sending workout data:", JSON.stringify(workout, null, 2));
      const response = await axiosInstance.post(
        `${API_URL}/workouts`,
        workout,
        getAuthConfig()
      );
      console.log("Server response:", response.data);
      setWorkoutHistory(prevHistory => [response.data, ...prevHistory]);
      setWorkouts(prevWorkouts => [...prevWorkouts, response.data]);
      addNotification("Workout added successfully", "success");
    } catch (error) {
      console.error("Error adding workout:", error);
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
        console.error("Response headers:", error.response.headers);
      } else if (error.request) {
        console.error("No response received:", error.request);
      } else {
        console.error("Error setting up request:", error.message);
      }
      addNotification("Failed to add workout", "error");
      throw error;
    }
  };

  const updateWorkout = async (id, updatedWorkout) => {
    try {
      const response = await axiosInstance.put(
        `${API_URL}/workouts/${id}`,
        updatedWorkout,
        getAuthConfig()
      );
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
      addNotification("Workout updated successfully", "success");
      return response.data;
    } catch (error) {
      console.error("Error updating workout:", error);
      addNotification("Failed to update workout", "error");
      throw error;
    }
  };

  const deleteWorkout = async id => {
    try {
      await axiosInstance.delete(`${API_URL}/workouts/${id}`, getAuthConfig());
      setWorkouts(prevWorkouts =>
        prevWorkouts.filter(workout => workout._id !== id)
      );
      setWorkoutHistory(prevHistory =>
        prevHistory.filter(workout => workout._id !== id)
      );
      addNotification("Workout deleted successfully", "success");
    } catch (error) {
      console.error("Error deleting workout:", error);
      addNotification("Failed to delete workout", "error");
      throw error;
    }
  };

  const addExercise = async exercise => {
    try {
      const exerciseWithTitleCase = {
        ...exercise,
        name: toTitleCase(exercise.name),
        description: toTitleCase(exercise.description),
        target: toTitleCase(exercise.target),
      };
      const response = await axiosInstance.post(
        `${API_URL}/exercises`,
        exerciseWithTitleCase,
        getAuthConfig()
      );
      setExercises(prevExercises => [...prevExercises, response.data]);
      return response.data;
    } catch (error) {
      console.error("Error adding exercise:", error);
      addNotification("Failed to add exercise", "error");
      throw error;
    }
  };

  const updateExercise = async (id, updatedExercise) => {
    try {
      const exerciseWithTitleCase = {
        ...updatedExercise,
        name: toTitleCase(updatedExercise.name),
        description: toTitleCase(updatedExercise.description),
        target: toTitleCase(updatedExercise.target),
      };
      const response = await axiosInstance.put(
        `${API_URL}/exercises/${id}`,
        exerciseWithTitleCase,
        getAuthConfig()
      );
      setExercises(prevExercises =>
        prevExercises.map(exercise =>
          exercise._id === id ? response.data : exercise
        )
      );
      return response.data;
    } catch (error) {
      console.error("Error updating exercise:", error);
      addNotification("Failed to update exercise", "error");
      throw error;
    }
  };

  const deleteExercise = async id => {
    try {
      await axiosInstance.delete(`${API_URL}/exercises/${id}`, getAuthConfig());
      setExercises(prevExercises =>
        prevExercises.filter(exercise => exercise._id !== id)
      );
      addNotification("Exercise deleted successfully", "success");
    } catch (error) {
      console.error("Error deleting exercise:", error);
      addNotification("Failed to delete exercise", "error");
      throw error;
    }
  };

  const addWorkoutPlan = async plan => {
    try {
      const planToSend = {
        ...plan,
        exercises: plan.exercises.map(exercise =>
          typeof exercise === "string" ? exercise : exercise._id
        ),
      };

      const response = await axiosInstance.post(
        `${API_URL}/workoutplans`,
        planToSend,
        getAuthConfig()
      );

      const fullPlan = {
        ...response.data,
        exercises: await Promise.all(
          response.data.exercises.map(async exerciseId => {
            if (typeof exerciseId === "string") {
              try {
                const exerciseResponse = await axiosInstance.get(
                  `${API_URL}/exercises/${exerciseId}`,
                  getAuthConfig()
                );
                return exerciseResponse.data;
              } catch (error) {
                console.error(`Error fetching exercise ${exerciseId}:`, error);
                return null;
              }
            }
            return exerciseId;
          })
        ),
      };

      setWorkoutPlans(prevPlans => [...prevPlans, fullPlan]);
      addNotification("Workout plan added successfully", "success");
      return fullPlan;
    } catch (error) {
      console.error("Error adding workout plan:", error);
      addNotification("Failed to add workout plan", "error");
      throw error;
    }
  };

  const updateWorkoutPlan = async (id, updatedPlan) => {
    try {
      if (!id) {
        return addWorkoutPlan(updatedPlan);
      }
      const response = await axiosInstance.put(
        `${API_URL}/workoutplans/${id}`,
        updatedPlan,
        getAuthConfig()
      );
      setWorkoutPlans(prevPlans =>
        prevPlans.map(plan => (plan._id === id ? response.data : plan))
      );
      addNotification("Workout plan updated successfully", "success");
      return response.data;
    } catch (error) {
      console.error("Error updating workout plan:", error);
      addNotification("Failed to update workout plan", "error");
      throw error;
    }
  };

  const deleteWorkoutPlan = async id => {
    try {
      await axiosInstance.delete(
        `${API_URL}/workoutplans/${id}`,
        getAuthConfig()
      );
      setWorkoutPlans(prevPlans => prevPlans.filter(plan => plan._id !== id));
      setWorkoutHistory(prevHistory =>
        prevHistory.map(workout =>
          workout.plan && workout.plan._id === id
            ? {
                ...workout,
                planDeleted: true,
                planName: workout.planName || "Deleted Plan",
              }
            : workout
        )
      );
      addNotification("Workout plan deleted successfully", "success");
    } catch (error) {
      console.error("Error deleting workout plan:", error);
      addNotification("Failed to delete workout plan", "error");
      throw error;
    }
  };

  const addExerciseToPlan = async (planId, exerciseId) => {
    if (!planId || !exerciseId) {
      throw new Error("Plan ID and Exercise ID are required");
    }
    console.log(`Attempting to add exercise ${exerciseId} to plan ${planId}`);

    const plan = workoutPlans.find(p => p._id === planId);
    if (!plan) {
      console.error("Plan not found");
      addNotification("Plan not found", "error");
      return { success: false, error: "Plan not found" };
    }

    if (plan.exercises.some(e => e._id === exerciseId)) {
      console.log("Exercise is already in the workout plan");
      addNotification("This exercise is already in the workout plan", "info");
      return { success: false, alreadyInPlan: true };
    }

    try {
      const response = await axiosInstance.post(
        `${API_URL}/workoutplans/${planId}/exercises`,
        { exerciseId },
        getAuthConfig()
      );

      console.log("Server response:", response.data);
      setWorkoutPlans(prevPlans =>
        prevPlans.map(p => (p._id === planId ? response.data : p))
      );
      addNotification("Exercise added to plan successfully", "success");
      return { success: true, data: response.data };
    } catch (error) {
      console.error("Error adding exercise to plan:", error);
      addNotification(
        `Failed to add exercise to plan: ${
          error.response ? error.response.data.message : error.message
        }`,
        "error"
      );
      return { success: false, error };
    }
  };

  const saveProgress = useCallback(async (progressData) => {
    if (!user) return;
  
    try {
      console.log('Received progress data:', progressData);
  
      if (!progressData.startTime) {
        progressData.startTime = new Date().toISOString();
      }
  
      // Ensure exercises is an array, even if empty
      const exercises = progressData.exercises || [];
  
      // Ensure exercises have the correct structure
      const formattedExercises = exercises.map(exercise => ({
        exercise: exercise.exercise?._id || exercise.exercise,
        sets: exercise.sets || [],
        notes: exercise.notes || ''
      }));
      
      const dataToSave = {
        ...progressData,
        exercises: formattedExercises,
        userId: user.id
      };
      
      console.log('Saving progress data:', dataToSave);
  
      const response = await axiosInstance.post(`${hostName}/api/workouts/progress`, dataToSave);
      localStorage.setItem(`workoutProgress_${user.id}`, JSON.stringify(progressData));
      console.log('Progress saved successfully', response.data);
    } catch (error) {
      console.error('Error saving progress:', error);
      if (error.response && error.response.status === 401) {
        addNotification('Session expired. Please log in again.', 'error');
        logout();
      } else {
        addNotification('Failed to save progress: ' + (error.response?.data?.message || error.message), 'error');
      }
      throw error;
    }
  }, [user, addNotification, logout, hostName, axiosInstance]);

  const loadProgress = useCallback(async () => {
    if (!user) return null;

    try {
      const response = await axiosInstance.get(
        `${API_URL}/workouts/progress`,
        getAuthConfig()
      );
      if (response.data) {
        const progressData = response.data;
        // Fetch full exercise details for the plan
        if (progressData.plan && progressData.plan.exercises) {
          progressData.plan.exercises = await Promise.all(
            progressData.plan.exercises.map(async (exercise) => {
              if (typeof exercise === 'string' || !exercise.description) {
                return await getExerciseById(exercise._id || exercise);
              }
              return exercise;
            })
          );
        }
        localStorage.setItem(`workoutProgress_${user.id}`, JSON.stringify(progressData));
        return progressData;
      }
      return null;
    } catch (error) {
      console.error('Error loading progress:', error);
      return null;
    }
  }, [user, API_URL, getAuthConfig, getExerciseById]);

  const clearWorkout = useCallback(async () => {
    if (!user) return;

    try {
      localStorage.removeItem(`workoutProgress_${user.id}`);
      localStorage.removeItem(`currentPlan_${user.id}`);
      localStorage.removeItem(`currentSets_${user.id}`);
      localStorage.removeItem(`currentExerciseIndex_${user.id}`);
      localStorage.removeItem(`workoutStartTime_${user.id}`);
      localStorage.removeItem(`workoutNotes_${user.id}`);
      localStorage.removeItem(`lastSetValues_${user.id}`);

      await axiosInstance.delete(
        `${API_URL}/workouts/progress`,
        { data: { userId: user.id } },
        getAuthConfig()
      );

      console.log("Workout cleared successfully");
      addNotification("Workout cleared", "success");
    } catch (error) {
      console.error("Error clearing workout:", error);
      addNotification(
        "Failed to clear workout: " +
          (error.response?.data?.message || error.message),
        "error"
      );
      throw error;
    }
  }, [user, API_URL, getAuthConfig, addNotification]);

  const contextValue = useMemo(
    () => ({
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
      saveProgress,
      clearWorkout,
      loadProgress,
      getExerciseHistory,
      getLastWorkoutForPlan,
      getExerciseById,
    }),
    [
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
      saveProgress,
      clearWorkout,
      loadProgress,
      getExerciseHistory,
      getLastWorkoutForPlan,
      getExerciseById,
    ]
  );

  return (
    <GymContext.Provider value={contextValue}>{children}</GymContext.Provider>
  );
}

export default GymProvider;
