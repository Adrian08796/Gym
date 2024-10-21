// src/context/GymContext.jsx

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from "react";
import axiosInstance from "../utils/axiosConfig";
import { useAuth } from "./AuthContext";
import { Toast } from 'primereact/toast';
import { confirmDialog } from 'primereact/confirmdialog';
import { useTranslation } from 'react-i18next';

export const hostName = import.meta.env.VITE_BACKEND_HOST;

const GymContext = createContext();

export function useGymContext() {
  return useContext(GymContext);
}

export function GymProvider({ children }) {
  const { t } = useTranslation();
  const [workouts, setWorkouts] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [workoutPlans, setWorkoutPlans] = useState([]);
  const [workoutHistory, setWorkoutHistory] = useState([]);
  const { user, logout } = useAuth();
  const toast = useRef(null);

  const showToast = useCallback((severity, summary, detail) => {
    toast.current.show({ severity, summary, detail, life: 3000 });
  }, []);

  const confirm = useCallback((options) => {
    confirmDialog(options);
  }, []);

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
        showToast("error", "Error", t("Failed to fetch last workout for plan"));
        return null;
      }
    },
    [API_URL, getAuthConfig, showToast]
  );

  const exerciseCache = new Map();

  const getExerciseById = useCallback(async (exerciseId) => {
    if (!exerciseId || typeof exerciseId !== 'string') {
      console.error('Invalid exerciseId provided to getExerciseById:', exerciseId);
      return null;
    }
  
    try {
      console.log(`Fetching exercise details for exerciseId: ${exerciseId}`);
      const response = await axiosInstance.get(
        `${API_URL}/exercises/${exerciseId}`,
        getAuthConfig()
      );
      console.log('Exercise details response:', response.data);
  
      // Ensure the exercise object has a recommendations property
      const exercise = response.data;
      if (!exercise.recommendations) {
        exercise.recommendations = {
          beginner: { weight: 0, reps: 10, sets: 3 },
          intermediate: { weight: 0, reps: 10, sets: 3 },
          advanced: { weight: 0, reps: 10, sets: 3 }
        };
      }
  
      return exercise;
    } catch (error) {
      console.error('Error fetching exercise details:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        if (error.response.status === 404) {
          showToast('error', 'Error', "Exercise not found");
        } else {
          showToast('error', 'Error', "Failed to fetch exercise details");
        }
      } else {
        showToast('error', 'Error', "Network error while fetching exercise details");
      }
      return null;
    }
  }, [API_URL, getAuthConfig, showToast]);

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
        showToast("error", "Error", t("Failed to fetch workout history"));
      }
    }
  }, [user, showToast, API_URL, getAuthConfig]);

  const fetchExercises = useCallback(async () => {
    if (user) {
      try {
        console.log('Fetching exercises...');
        const response = await axiosInstance.get(
          `${API_URL}/exercises`,
          getAuthConfig()
        );
        console.log('Fetched exercises:', response.data);
        const formattedExercises = response.data.map(exercise => ({
          ...exercise,
          name: toTitleCase(exercise.name),
          description: toTitleCase(exercise.description),
          target: Array.isArray(exercise.target)
            ? exercise.target.map(toTitleCase)
            : toTitleCase(exercise.target),
          isDefault: !exercise.user
        }));
        console.log('Formatted exercises:', formattedExercises);
        setExercises(formattedExercises);
      } catch (error) {
        console.error("Error fetching exercises:", error);
        if (error.response) {
          console.error("Error response:", error.response.data);
        }
        showToast("error", "Error", t("Failed to fetch exercises"));
      }
    }
  }, [user, API_URL, getAuthConfig, showToast]);

  const fetchWorkoutPlans = useCallback(async () => {
    if (user) {
      try {
        console.log('Fetching workout plans...');
        const response = await axiosInstance.get(
          `${API_URL}/workoutplans`,
          getAuthConfig()
        );
  
        console.log('Workout plans response:', response);
  
        if (response.headers['content-type']?.includes('text/html')) {
          console.error('Received HTML response instead of JSON');
          throw new Error('Server returned an HTML response instead of JSON');
        }
  
        if (!response.data || !response.data.plans) {
          console.error('Invalid response structure:', response.data);
          throw new Error('Invalid response structure from server');
        }
  
        const plansWithFullExerciseDetails = await Promise.all(
          response.data.plans.map(async plan => {
            const fullExercises = await Promise.all(
              plan.exercises.map(async exercise => {
                if (!exercise.description || !exercise.imageUrl) {
                  const exerciseResponse = await axiosInstance.get(
                    `${API_URL}/exercises/${exercise._id}`,
                    getAuthConfig()
                  );
                  return exerciseResponse.data;
                }
                return exercise;
              })
            );
            return { ...plan, exercises: fullExercises };
          })
        );
        
        const uniquePlans = plansWithFullExerciseDetails.reduce((acc, current) => {
          const x = acc.find(item => item._id === current._id);
          if (!x) {
            return acc.concat([current]);
          } else {
            return acc;
          }
        }, []);
        
        console.log('Unique plans after processing:', uniquePlans);
        setWorkoutPlans(uniquePlans);
        return uniquePlans;
      } catch (error) {
        console.error("Error fetching workout plans:", error);
        if (error.response) {
          console.error('Error status:', error.response.status);
          console.error('Error headers:', error.response.headers);
          if (error.response.headers['content-type']?.includes('text/html')) {
            console.error('HTML Error Response:', error.response.data);
          } else {
            console.error('Error Data:', error.response.data);
          }
        }
        showToast("error", "Error", t("Failed to fetch workout plans. Please check console for details."));
        return [];
      }
    }
    return [];
  }, [user, API_URL, getAuthConfig, showToast]);

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
      // showToast("success", "Success", "Workout added successfully");
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
      showToast("error", "Error", t("Failed to add workout"));
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
      showToast("success", "Success", t("Workout updated successfully"));
      return response.data;
    } catch (error) {
      console.error("Error updating workout:", error);
      showToast("error", "Error", t("Failed to update workout"));
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
      showToast("success", "Success", t("Workout deleted successfully"));
    } catch (error) {
      console.error("Error deleting workout:", error);
      showToast("error", "Error", t("Failed to delete workout"));
      throw error;
    }
  };
  // Admin add default exercise
  const addDefaultExercise = async (exerciseData) => {
    try {
      const response = await axiosInstance.post(`${API_URL}/exercises/default`, exerciseData, getAuthConfig());
      const newExercise = {
        ...response.data,
        name: toTitleCase(response.data.name),
        description: toTitleCase(response.data.description),
        target: Array.isArray(response.data.target)
          ? response.data.target.map(toTitleCase)
          : toTitleCase(response.data.target),
        isDefault: true
      };
      setExercises(prevExercises => [...prevExercises, newExercise]);
      // showToast('success', 'Success', 'Default exercise added successfully');
      return newExercise;
    } catch (error) {
      console.error('Error adding default exercise:', error);
      showToast('error', 'Error', t("Failed to add default exercise"));
      throw error;
    }
  };

  const addExercise = async exercise => {
    try {
      console.log('Adding exercise, received data:', exercise);

      const exerciseWithTitleCase = {
        ...exercise,
        name: toTitleCase(exercise.name),
        description: toTitleCase(exercise.description),
        target: Array.isArray(exercise.target)
          ? exercise.target.map(toTitleCase)
          : [toTitleCase(exercise.target)],
      };

      console.log('Processed exercise data to be sent:', exerciseWithTitleCase);

      const response = await axiosInstance.post(
        `${API_URL}/exercises`,
        exerciseWithTitleCase,
        getAuthConfig()
      );

      console.log('Response from adding exercise:', response.data);

      setExercises(prevExercises => [...prevExercises, response.data]);
      showToast("success", "Success", t("Exercise added successfully"));
      return response.data;
    } catch (error) {
      console.error("Error adding exercise:", error);
      if (error.response) {
        console.error('Error response:', error.response.data);
      }
      showToast("error", "Error", t("Failed to add exercise"));
      throw error;
    }
  };

  const updateExercise = async (id, updatedExercise) => {
    try {
      console.log('Updating exercise, received data:', updatedExercise);

      const exerciseWithTitleCase = {
        ...updatedExercise,
        name: toTitleCase(updatedExercise.name),
        description: toTitleCase(updatedExercise.description),
        target: Array.isArray(updatedExercise.target)
          ? updatedExercise.target.map(toTitleCase)
          : [toTitleCase(updatedExercise.target)],
      };

      console.log('Processed exercise data to be sent:', exerciseWithTitleCase);

      const response = await axiosInstance.put(
        `${API_URL}/exercises/${id}`,
        exerciseWithTitleCase,
        getAuthConfig()
      );

      console.log('Response from updating exercise:', response.data);

      setExercises(prevExercises =>
        prevExercises.map(exercise => {
          if (exercise._id === id) {
            return {
              ...exercise,
              ...response.data,
              recommendations: {
                ...exercise.recommendations,
                [user.experienceLevel]: response.data.recommendations?.[user.experienceLevel]
              }
            };
          }
          return exercise;
        })
      );

      showToast("success", "Success", t("Exercise updated successfully"));
      return response.data;
    } catch (error) {
      console.error("Error updating exercise:", error);
      if (error.response) {
        console.error('Error response:', error.response.data);
      }
      showToast("error", "Error", t("Failed to update exercise"));
      throw error;
    }
  };

  const updateExerciseRecommendations = useCallback(async (exerciseId, level, newRecommendations) => {
    try {
      const response = await axiosInstance.put(
        `${API_URL}/exercises/${exerciseId}/recommendations`,
        { level, recommendations: newRecommendations },
        getAuthConfig()
      );
      
      // Update the local state
      setExercises(prevExercises => 
        prevExercises.map(exercise => 
          exercise._id === exerciseId 
            ? { 
                ...exercise, 
                recommendations: {
                  ...exercise.recommendations,
                  [level]: newRecommendations
                }
              }
            : exercise
        )
      );

      return response.data;
    } catch (error) {
      console.error('Error updating exercise recommendations:', error);
      throw error;
    }
  }, [API_URL, getAuthConfig]);

  const deleteExercise = async id => {
    try {
      const response = await axiosInstance.delete(`${API_URL}/exercises/${id}`, getAuthConfig());
      if (response.data.message === 'Exercise removed from your view') {
        // For normal users, just remove the exercise from the local state
        setExercises(prevExercises => prevExercises.filter(exercise => exercise._id !== id));
      } else {
        // For admins or user's own custom exercises, remove from state as before
        setExercises(prevExercises => prevExercises.filter(exercise => exercise._id !== id));
      }
      showToast("success", "Success", response.data.message);
    } catch (error) {
      console.error("Error deleting exercise:", error);
      showToast("warn", "Warning", t("Default exercises cannot be deleted"));
      throw error;
    }
  };

  // Admin add default workout plan
  const addDefaultWorkoutPlan = async (planData) => {
    try {
      const response = await axiosInstance.post(`${API_URL}/workoutplans/default`, planData, getAuthConfig());
      const newPlan = {
        ...response.data,
        exercises: await Promise.all(
          response.data.exercises.map(async exerciseId => {
            return await getExerciseById(exerciseId);
          })
        ).then(exercises => exercises.filter(Boolean))
      };
      
      setWorkoutPlans(prevPlans => {
        // Check if the plan already exists to prevent duplicates
        const planExists = prevPlans.some(plan => plan._id === newPlan._id);
        if (!planExists) {
          return [...prevPlans, newPlan];
        }
        return prevPlans;
      });
      
      // showToast('success', 'Success', 'Default workout plan added successfully');
      return newPlan;
    } catch (error) {
      console.error('Error adding default workout plan:', error);
      showToast('error', 'Error', t("Failed to add default workout plan"));
      throw error;
    }
  };

  const addWorkoutPlan = async plan => {
    try {
      console.log('Adding workout plan, received plan:', JSON.stringify(plan, null, 2));

      const planToSend = {
        ...plan,
        exercises: plan.exercises ? plan.exercises.map(exercise => {
          if (typeof exercise === 'string') return exercise;
          if (exercise && exercise._id) return exercise._id;
          console.error('Invalid exercise object:', exercise);
          return null;
        }).filter(id => id !== null) : []
      };

      console.log('Plan to send to backend:', JSON.stringify(planToSend, null, 2));

      const response = await axiosInstance.post(
        `${API_URL}/workoutplans`,
        planToSend,
        getAuthConfig()
      );

      console.log('Raw backend response:', response);
      console.log('Backend response data:', JSON.stringify(response.data, null, 2));

      const fullPlan = response.data;

      console.log('Full plan with exercise details:', JSON.stringify(fullPlan, null, 2));

      setWorkoutPlans(prevPlans => {
        const existingPlanIndex = prevPlans.findIndex(p => p._id === fullPlan._id);
        if (existingPlanIndex === -1) {
          return [...prevPlans, fullPlan];
        } else {
          return prevPlans.map((p, index) => index === existingPlanIndex ? fullPlan : p);
        }
      });

      showToast("success", "Success", t("Workout plan added successfully"));
      return fullPlan;
    } catch (error) {
      console.error("Error adding workout plan:", error);
      if (error.response) {
        console.error('Error response from server:', JSON.stringify(error.response.data, null, 2));
      }
      showToast("error", "Error", t("Failed to add workout plan: ") + error.message);
      throw error;
    }
  };

  const updateWorkoutPlan = async (id, updatedPlan) => {
    try {
      console.log('Updating workout plan:', id, JSON.stringify(updatedPlan, null, 2));

      const planToSend = {
        ...updatedPlan,
        exercises: updatedPlan.exercises ? updatedPlan.exercises.map(exercise => {
          if (typeof exercise === 'string') return exercise;
          if (exercise && exercise._id) return exercise._id;
          console.error('Invalid exercise object:', exercise);
          return null;
        }).filter(id => id !== null) : []
      };

      console.log('Plan to send to backend:', JSON.stringify(planToSend, null, 2));

      const response = await axiosInstance.put(
        `${API_URL}/workoutplans/${id}`,
        planToSend,
        getAuthConfig()
      );

      console.log('Raw backend response:', response);
      console.log('Backend response data:', JSON.stringify(response.data, null, 2));

      const updatedPlanWithExercises = response.data;

      console.log('Updated plan with exercise details:', JSON.stringify(updatedPlanWithExercises, null, 2));

      setWorkoutPlans(prevPlans =>
        prevPlans.map(plan => plan._id === id ? updatedPlanWithExercises : plan)
      );

      showToast("success", "Success", t("Workout plan updated successfully"));
      return updatedPlanWithExercises;
    } catch (error) {
      console.error("Error updating workout plan:", error);
      if (error.response) {
        console.error('Error response from server:', JSON.stringify(error.response.data, null, 2));
      }
      showToast("error", "Error", t("Failed to update workout plan: ") + error.message);
      throw error;
    }
  };

  const deleteWorkoutPlan = async (id) => {
    try {
      const response = await axiosInstance.delete(
        `${API_URL}/workoutplans/${id}`,
        getAuthConfig()
      );
      
      if (response.data.message === 'Workout plan removed from your view') {
        // For normal users, just remove the plan from the local state
        setWorkoutPlans(prevPlans => prevPlans.filter(plan => plan._id !== id));
        showToast("success", "Success", t("Workout plan removed from your view"));
      } else {
        // For admins or user's own custom plans, remove from state as before
        setWorkoutPlans(prevPlans => prevPlans.filter(plan => plan._id !== id));
        showToast("success", "Success", t("Workout plan deleted successfully"));
      }
    } catch (error) {
      console.error("Error deleting workout plan:", error);
      if (error.response && error.response.status === 404) {
        // If the plan is not found, remove it from the local state anyway
        setWorkoutPlans(prevPlans => prevPlans.filter(plan => plan._id !== id));
        showToast("warn", "Warning", t("Workout plan not found, but removed from local state"));
      } else {
        showToast("error", "Error", t("Failed to delete workout plan"));
      }
      throw error;
    }
  };

  const addExerciseToPlan = async (planId, exerciseId) => {
    try {
      console.log('Adding exercise to plan:', planId, exerciseId);
      
      // Check if the plan exists and if the user has permission to modify it
      const currentPlan = workoutPlans.find(plan => plan._id === planId);
      if (!currentPlan) {
        showToast("error", "Error", t("Workout plan not found"));
        return { success: false, error: 'Plan not found' };
      }
  
      if (currentPlan.isDefault && !user.isAdmin) {
        showToast("warn", "Warning", t("You cannot modify admin-created plans"));
        return { success: false, error: 'Unauthorized' };
      }
  
      // Check if the exercise is already in the plan
      if (currentPlan.exercises.some(ex => ex._id === exerciseId)) {
        // showToast("warn", "Warning", "Exercise already in the plan");
        return { success: false, error: 'Duplicate exercise' };
      }
  
      const response = await axiosInstance.post(
        `${API_URL}/workoutplans/${planId}/exercises`,
        { exerciseId },
        getAuthConfig()
      );
  
      setWorkoutPlans(prevPlans =>
        prevPlans.map(p => p._id === planId ? response.data : p)
      );
      showToast("success", "Success", t("Exercise added to plan successfully"));
      return { success: true, updatedPlan: response.data };
    } catch (error) {
      console.error("Error adding exercise to plan:", error);
      if (error.response) {
        switch (error.response.status) {
          case 400:
            if (error.response.data.message === 'Exercise already in the workout plan') {
              showToast("warn", "Warning", t("The exercise is already in the plan"));
            } else {
              showToast("error", "Error", error.response.data.message || "Bad request");
            }
            break;
          case 403:
            showToast("error", "Error", t("You don't have permission to modify this plan"));
            break;
          case 404:
            showToast("error", "Error", t("Workout plan or exercise not found"));
            break;
          default:
            // showToast("error", "Error", "Failed to add exercise to plan");
        }
      } else if (error.request) {
        showToast("error", "Error", t("No response received from server"));
      } else {
        showToast("error", "Error", t("Error setting up request"));
      }
      return { success: false, error };
    }
  };

  const removeExerciseFromPlan = async (planId, exerciseId) => {
    try {
      console.log(`Removing exercise ${exerciseId} from plan ${planId}`);
      const response = await axiosInstance.delete(
        `${API_URL}/workoutplans/${planId}/exercises/${exerciseId}`,
        getAuthConfig()
      );
      setWorkoutPlans(prevPlans =>
        prevPlans.map(p => p._id === planId ? response.data : p)
      );
      showToast("success", "Success", t("Exercise removed from plan successfully"));
      return { success: true, updatedPlan: response.data };
    } catch (error) {
      console.error("Error removing exercise from plan:", error);
      if (error.response && error.response.status === 404) {
        showToast("error", "Error", t("Exercise or workout plan not found"));
      } else {
        showToast("error", "Error", t("Failed to remove exercise from plan"));
      }
      throw error;
    }
  };

  const reorderExercisesInPlan = async (planId, exerciseId, newPosition) => {
    try {
      const response = await axiosInstance.put(
        `${API_URL}/workoutplans/${planId}/reorder`,
        { exerciseId, newPosition },
        getAuthConfig()
      );
  
      console.log("Server response:", response.data);
      setWorkoutPlans(prevPlans =>
        prevPlans.map(p => (p._id === planId ? response.data : p))
      );
      showToast("success", "Success", t("Exercises reordered successfully"));
      return { success: true, data: response.data };
    } catch (error) {
      console.error("Error reordering exercises in plan:", error);
      showToast("error", "Error", `Failed to reorder exercises: ${
          error.response ? error.response.data.message : error.message
        }`);
      return { success: false, error };
    }
  };

  const saveProgress = useCallback(async (progressData) => {
    if (!user) return;
  
    try {
      console.log('Saving progress data:', progressData);
  
      if (!progressData.startTime) {
        progressData.startTime = new Date().toISOString();
      }
  
      const exercises = progressData.exercises || [];
  
      const formattedExercises = exercises.map(exercise => ({
        exercise: exercise.exercise?._id || exercise.exercise,
        sets: (exercise.sets || []).map(set => ({
          ...set,
          completedAt: set.completedAt || new Date().toISOString()
        })),
        notes: exercise.notes || '',
        requiredSets: exercise.requiredSets || 3,
        recommendations: exercise.recommendations || {} // Include recommendations
      }));
      
      const dataToSave = {
        ...progressData,
        exercises: formattedExercises,
        userId: user.id,
        experienceLevel: user.experienceLevel // Include user's experience level
      };
      
      console.log('Saving progress data:', dataToSave);
  
      const response = await axiosInstance.post(`${hostName}/api/workouts/progress`, dataToSave);
      localStorage.setItem(`workoutProgress_${user.id}`, JSON.stringify(dataToSave));
      console.log('Progress saved successfully', response.data);
    } catch (error) {
      console.error('Error saving progress:', error);
      if (error.response && error.response.status === 404) {
        // If the document is not found, create a new one
        try {
          const newProgressResponse = await axiosInstance.post(`${hostName}/api/workouts/progress/new`, dataToSave);
          localStorage.setItem(`workoutProgress_${user.id}`, JSON.stringify(dataToSave));
          console.log('New progress created successfully', newProgressResponse.data);
        } catch (newError) {
          console.error('Error creating new progress:', newError);
          showToast('error', 'Error', 'Failed to create new progress: ' + (newError.response?.data?.message || newError.message));
          throw newError;
        }
      } else if (error.response && error.response.status === 409) {
        // Handle version conflict
        showToast('warn', 'Warning', t("Progress data is out of sync. Please refresh and try again."));
      } else if (error.response && error.response.status === 401) {
        showToast('error', 'Error', t("Session expired. Please log in again."));
        logout();
      } else {
        showToast('error', 'Error', 'Failed to save progress: ' + (error.response?.data?.message || error.message));
      }
      throw error;
    }
  }, [user, showToast, logout, hostName, axiosInstance]);

  const loadProgress = useCallback(async () => {
    console.log('LOAD PROGRESS EXECUTED::::');
    if (!user) return null;
  
    try {
      const response = await axiosInstance.get(
        `${API_URL}/workouts/progress`,
        getAuthConfig()
      );
      console.log("😤",response);
      if (response.data) {
        let progressData = response.data;
        
        // Ensure progressData has the expected structure
        progressData = {
          plan: progressData.plan || null,
          exercises: progressData.exercises || [],
          currentExerciseIndex: progressData.currentExerciseIndex || 0,
          lastSetValues: progressData.lastSetValues || {},
          startTime: progressData.startTime || new Date().toISOString(),
          totalPauseTime: progressData.totalPauseTime || 0,
          skippedPauses: progressData.skippedPauses || 0,
          completedSets: progressData.completedSets || 0,
          totalSets: progressData.totalSets || 0,
          experienceLevel: progressData.experienceLevel || user.experienceLevel || 'beginner',
          ...progressData
        };
  
        // Fetch full exercise details for the plan
        if (progressData.plan && progressData.plan.exercises) {
          progressData.plan.exercises = await Promise.all(
            progressData.plan.exercises.map(async (exercise, index) => {
              try {
                let fullExercise;
                if (typeof exercise === 'string' || !exercise.description) {
                  fullExercise = await getExerciseById(exercise._id || exercise);
                } else {
                  fullExercise = exercise;
                }
                // Ensure requiredSets and recommendations are set
                fullExercise.requiredSets = progressData.exercises[index]?.requiredSets || 3;
                fullExercise.recommendations = fullExercise.recommendations || {
                  beginner: { weight: 0, reps: 10, sets: 3 },
                  intermediate: { weight: 0, reps: 10, sets: 3 },
                  advanced: { weight: 0, reps: 10, sets: 3 }
                };
                return fullExercise;
              } catch (error) {
                console.error(`Error fetching exercise details: ${error.message}`);
                return null; // Return null for failed exercise fetches
              }
            })
          );
          // Filter out any null exercises (failed fetches)
          progressData.plan.exercises = progressData.plan.exercises.filter(Boolean);
        }
  
        // If the workout is empty (no exercises), return null
        if (!progressData.plan || progressData.plan.exercises.length === 0) {
          console.log('Workout progress is empty, returning null');
          return null;
        }
  
        localStorage.setItem(`workoutProgress_${user.id}`, JSON.stringify(progressData));
        return progressData;
      }
      return null;
    } catch (error) {
      console.error('Error loading progress from server:', error);
      showToast('error', 'Error', t("Failed to load workout progress from server"));
      // If there's an error fetching from the server, try to load from localStorage
      const localProgress = localStorage.getItem(`workoutProgress_${user.id}`);
      if (localProgress) {
        try {
          const parsedProgress = JSON.parse(localProgress);
          // Check if the locally stored progress is valid
          if (parsedProgress && parsedProgress.plan && parsedProgress.plan.exercises && parsedProgress.plan.exercises.length > 0) {
            return parsedProgress;
          }
        } catch (parseError) {
          console.error('Error parsing local progress:', parseError);
        }
      }
      return null;
    }
  }, [user, API_URL, getAuthConfig, getExerciseById, showToast]);

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
  
      // showToast("success", "Success", "Workout cleared");
    } catch (error) {
      console.error("Error clearing workout:", error);
      showToast("error", "Error", "Failed to clear workout: " +
          (error.response?.data?.message || error.message));
      throw error;
    }
  }, [user, API_URL, getAuthConfig, showToast]);

  const shareWorkoutPlan = async (planId) => {
    try {
      const planResponse = await axiosInstance.get(`${API_URL}/workoutplans/${planId}`, getAuthConfig());
      const fullPlan = planResponse.data;
  
      if (!fullPlan.exercises || fullPlan.exercises.length === 0) {
        // throw new Error('The workout plan has no exercises');
        showToast('info', 'Info', t("You must add at least one exercise to the plan to share it"));
      }
  
      const planToShare = {
        ...fullPlan,
        exercises: fullPlan.exercises.map(exercise => exercise._id)
      };
  
      const shareResponse = await axiosInstance.post(`${API_URL}/workoutplans/${planId}/share`, planToShare, getAuthConfig());
      
      // showToast('success', 'Success', 'Workout plan shared successfully');
      return shareResponse.data.shareLink;
    } catch (error) {
      console.error('Error sharing workout plan:', error);
      showToast('error', 'Error', `Failed to share workout plan: ${error.message}`);
      throw error;
    }
  };

  const importWorkoutPlan = async (shareId) => {
    try {
      console.log('Attempting to import workout plan with shareId:', shareId);
      const response = await axiosInstance.post(`${API_URL}/workoutplans/import/${shareId}`, {}, getAuthConfig());
      console.log('Import response:', response.data);
  
      const importedPlan = response.data;
  
      // Check if the plan already exists
      const existingPlan = workoutPlans.find(plan => plan._id === importedPlan._id);
      if (existingPlan) {
        console.log('Plan already imported:', importedPlan.name);
        return { alreadyImported: true };
      }
  
      setWorkoutPlans(prevPlans => [...prevPlans, importedPlan]);
  
      const newExercises = importedPlan.exercises.filter(exercise => 
        !exercises.some(existingExercise => existingExercise._id === exercise._id)
      );
      if (newExercises.length > 0) {
        setExercises(prevExercises => [...prevExercises, ...newExercises]);
      }
      showToast('success', 'Success', t("Workout plan imported successfully"));
      return { success: true, plan: importedPlan };
    } catch (error) {
      console.error('Error importing workout plan:', error);
      if (error.response && error.response.status === 404) {
        throw new Error('Shared workout plan not found');
      }
      throw error;
    }
  };

  const updateUserRecommendation = async (exerciseId, recommendation) => {
    try {
      const response = await axiosInstance.put(
        `${API_URL}/exercises/${exerciseId}/user-recommendation`,
        recommendation,
        getAuthConfig()
      );
      console.log('User recommendation updated:', response.data);
      
      // Update the local state
      setExercises(prevExercises => 
        prevExercises.map(exercise => 
          exercise._id === exerciseId 
            ? { 
                ...exercise, 
                userRecommendation: response.data.userRecommendation,
                target: recommendation.target // Update the target as well
              }
            : exercise
        )
      );
  
      return response.data;
    } catch (error) {
      console.error('Error updating user recommendation:', error);
      if (error.response && error.response.status === 404) {
        showToast('error', 'Error', t("Exercise not found"));
      } else {
        showToast('error', 'Error', t("Failed to update exercise recommendation"));
      }
      throw error;
    }
  };

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
      reorderExercisesInPlan,
      saveProgress,
      clearWorkout,
      loadProgress,
      getExerciseHistory,
      getLastWorkoutForPlan,
      getExerciseById,
      shareWorkoutPlan,
      fetchExercises,
      importWorkoutPlan,
      updateExerciseRecommendations,
      removeExerciseFromPlan,
      addDefaultExercise,
      addDefaultWorkoutPlan,
      updateUserRecommendation,
      showToast,
      confirm,
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
      reorderExercisesInPlan,
      saveProgress,
      clearWorkout,
      loadProgress,
      getExerciseHistory,
      getLastWorkoutForPlan,
      getExerciseById,
      shareWorkoutPlan,
      fetchExercises,
      importWorkoutPlan,
      updateExerciseRecommendations,
      removeExerciseFromPlan,
      addDefaultExercise,
      addDefaultWorkoutPlan,
      updateUserRecommendation,
      showToast,
      confirm,
    ]
  );

  return (
    <GymContext.Provider value={contextValue}>
      {children}
      <Toast ref={toast} />
    </GymContext.Provider>
  );
}

export default GymProvider;