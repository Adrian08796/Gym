// src/pages/WorkoutTracker.jsx

import React, { 
  useState, 
  useEffect, 
  useRef, 
  useCallback, 
  useMemo 
} from "react";
import { useNavigate } from "react-router-dom";
import { useGymContext } from "../context/GymContext";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { CSSTransition, SwitchTransition } from "react-transition-group";
import {
  FiChevronLeft,
  FiChevronRight,
  FiChevronDown,
  FiChevronUp,
  FiSettings,
  FiX,
} from "react-icons/fi";
import { usePreviousWorkout } from "../hooks/usePreviousWorkout";
import PreviousWorkoutDisplay from "../components/PreviousWorkoutDisplay";
import { formatTime } from "../utils/timeUtils";
import { canVibrate, vibrateDevice } from "../utils/deviceUtils";
import "./WorkoutTracker.css";

function WorkoutTracker() {
  const [currentPlan, setCurrentPlan] = useState(null);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [sets, setSets] = useState([]);
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [restTime, setRestTime] = useState(120);
  const [isResting, setIsResting] = useState(false);
  const [remainingRestTime, setRemainingRestTime] = useState(0);
  const [notes, setNotes] = useState([]);
  const [totalPauseTime, setTotalPauseTime] = useState(0);
  const [skippedPauses, setSkippedPauses] = useState(0);
  const [progression, setProgression] = useState(0);
  const [lastSetValues, setLastSetValues] = useState({});
  const [requiredSets, setRequiredSets] = useState({});
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [swipeDirection, setSwipeDirection] = useState(null);
  const [isExerciseDetailsOpen, setIsExerciseDetailsOpen] = useState(false);
  const [isExerciseOptionsOpen, setIsExerciseOptionsOpen] = useState(false);
  const [isPreviousWorkoutOpen, setIsPreviousWorkoutOpen] = useState(false);
  const [isCurrentSetLogOpen, setIsCurrentSetLogOpen] = useState(false);
  const [isConfirmingCancel, setIsConfirmingCancel] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [exerciseHistory, setExerciseHistory] = useState({});
  const [completedSets, setCompletedSets] = useState(0);
  const [totalSets, setTotalSets] = useState(0);
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");
  const [duration, setDuration] = useState("");
  const [distance, setDistance] = useState("");
  const [intensity, setIntensity] = useState("");
  const [incline, setIncline] = useState("");
  const [exerciseHistoryError, setExerciseHistoryError] = useState(null);
  const [userExperienceLevel, setUserExperienceLevel] = useState('beginner');  

  const {
    addWorkout,
    saveProgress,
    clearWorkout,
    getExerciseHistory,
    loadProgress,
    getExerciseById,
    updateExerciseRecommendations,
    updateUserRecommendation,
    showToast,
    confirm,
  } = useGymContext();
  const { darkMode } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const nodeRef = useRef(null);

  const API_URL = import.meta.env.VITE_BACKEND_HOST;

  const { isPreviousWorkoutLoading, previousWorkout } = usePreviousWorkout(
    currentPlan?._id,
    API_URL,
    showToast
  );

  // Fetch full exercise details from the API
  const fetchFullExerciseDetails = useCallback(
    async exerciseIdOrObject => {
      if (typeof exerciseIdOrObject === "string") {
        try {
          return await getExerciseById(exerciseIdOrObject);
        } catch (error) {
          console.error(
            `Error fetching exercise details for ID ${exerciseIdOrObject}:`,
            error
          );
          throw error;
        }
      }
      return exerciseIdOrObject;
    },
    [getExerciseById]
  );

  // Fetch exercise history for a specific exercise
  const fetchExerciseHistory = useCallback(
    async exerciseIdOrObject => {
      try {
        const fullExercise = await fetchFullExerciseDetails(exerciseIdOrObject);
        if (!fullExercise || !fullExercise._id) {
          throw new Error("Invalid exercise data");
        }

        const history = await getExerciseHistory(fullExercise._id);
        setExerciseHistory(prevHistory => ({
          ...prevHistory,
          [fullExercise._id]: history,
        }));
      } catch (error) {
        console.error("Error fetching exercise history:", error);
        setExerciseHistoryError(
          `Failed to fetch exercise history: ${error.message}`
        );
        // Set empty history to prevent continuous retries
        if (typeof exerciseIdOrObject === "object" && exerciseIdOrObject._id) {
          setExerciseHistory(prevHistory => ({
            ...prevHistory,
            [exerciseIdOrObject._id]: [],
          }));
        }
      }
    },
    [getExerciseHistory, fetchFullExerciseDetails]
  );

  // Fetch exercise history for all exercises in the current plan
  useEffect(() => {
    const fetchHistories = async () => {
      if (currentPlan && currentPlan.exercises) {
        for (const exercise of currentPlan.exercises) {
          await fetchExerciseHistory(exercise);
        }
      }
    };

    fetchHistories();
  }, [currentPlan, fetchExerciseHistory]);

  useEffect(() => {
    const loadWorkout = async () => {
      setIsLoading(true);
      try {
        const progress = await loadProgress();
        if (progress && progress.plan && progress.plan.exercises && progress.plan.exercises.length > 0) {
          const fullPlan = await loadFullPlanDetails(progress.plan);
          setCurrentPlan(fullPlan);
          setSets(progress.exercises.map(exercise => exercise.sets || []));
          setCurrentExerciseIndex(progress.currentExerciseIndex || 0);
          setStartTime(progress.startTime ? new Date(progress.startTime) : new Date());
          setNotes(progress.exercises.map(exercise => exercise.notes || ""));
          setLastSetValues(progress.lastSetValues || {});
          setTotalPauseTime(progress.totalPauseTime || 0);
          setSkippedPauses(progress.skippedPauses || 0);
          
          // Set requiredSets
          const newRequiredSets = {};
          fullPlan.exercises.forEach((exercise, index) => {
            newRequiredSets[exercise._id] = progress.exercises[index]?.requiredSets || 3;
          });
          setRequiredSets(newRequiredSets);
          
          setCompletedSets(progress.completedSets || 0);
          setTotalSets(progress.totalSets || fullPlan.exercises.reduce((total, exercise) => total + (newRequiredSets[exercise._id] || 3), 0));
          
          // Restore input fields for the current exercise
          const currentExercise = fullPlan.exercises[progress.currentExerciseIndex || 0];
          if (currentExercise) {
            const lastValues = progress.lastSetValues[currentExercise._id];
            if (lastValues) {
              if (currentExercise.category === "Strength") {
                setWeight(lastValues.weight?.toString() || "");
                setReps(lastValues.reps?.toString() || "");
              } else if (currentExercise.category === "Cardio") {
                setDuration(lastValues.duration?.toString() || "");
                setDistance(lastValues.distance?.toString() || "");
                setIntensity(lastValues.intensity?.toString() || "");
                setIncline(lastValues.incline?.toString() || "");
              }
            }
          }
        } else {
          // No valid progress found, try to load from localStorage
          const storedPlan = localStorage.getItem(`currentPlan_${user.id}`);
          if (storedPlan) {
            try {
              const plan = JSON.parse(storedPlan);
              if (plan && plan.exercises && plan.exercises.length > 0) {
                const fullPlan = await loadFullPlanDetails(plan);
                setCurrentPlan(fullPlan);
                loadStoredData(fullPlan);
              } else {
                throw new Error("Invalid plan data in localStorage");
              }
            } catch (error) {
              console.error("Error loading workout plan from localStorage:", error);
              navigate("/plans");
              showToast("error", "Error", "Error loading workout plan. Please select a new plan.");
            }
          } else {
            console.log("No workout plan found in progress or localStorage");
            showToast("info", "Info", "No workout plan selected. Please choose a plan.");
            navigate("/plans");
          }
        }
      } catch (error) {
        console.error("Error loading workout:", error);
        showToast("error", "Error", "Failed to load workout. Please try again.");
        navigate("/plans");
      } finally {
        setIsLoading(false);
      }
    };
  
    loadWorkout();
  }, [navigate, showToast, loadProgress, user.id]);

  const loadFullPlanDetails = async (plan) => {
    if (!plan || !plan.exercises) {
      console.error("Invalid plan data:", plan);
      return null;
    }
    const fullExercises = await Promise.all(
      plan.exercises.map(async (exercise) => {
        if (typeof exercise === "string" || !exercise.description) {
          try {
            return await getExerciseById(exercise._id || exercise);
          } catch (error) {
            console.error(`Error fetching exercise details: ${error.message}`);
            return null;
          }
        }
        return exercise;
      })
    );
    return { ...plan, exercises: fullExercises.filter(Boolean) };
  };

  useEffect(() => {
  const saveInterval = setInterval(async () => {
    if (currentPlan) {
      try {
        await saveProgress({
          plan: currentPlan,
          exercises: currentPlan.exercises.map((exercise, index) => ({
            exercise: exercise._id,
            sets: sets[index] || [],
            notes: notes[index] || "",
          })),
          currentExerciseIndex,
          startTime,
          lastSetValues,
          totalPauseTime,
          skippedPauses,
          completedSets,
          totalSets,
        });
      } catch (error) {
        console.error("Failed to save progress:", error);
      }
    }
  }, 30000); // Save every 30 seconds

  return () => clearInterval(saveInterval);
}, [currentPlan, sets, currentExerciseIndex, startTime, notes, lastSetValues, saveProgress, totalPauseTime, skippedPauses, completedSets, totalSets]);

  useEffect(() => {
    let timer;
    if (startTime) {
      const updateElapsedTime = () => {
        const now = new Date();
        const elapsed = Math.floor((now - startTime) / 1000);
        setElapsedTime(elapsed);
      };

      updateElapsedTime(); // Update immediately
      timer = setInterval(updateElapsedTime, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [startTime]);

  useEffect(() => {
    let restTimer;
    if (isResting && remainingRestTime > 0) {
      restTimer = setInterval(() => {
        setRemainingRestTime(prevTime => prevTime - 1);
      }, 1000);
    } else if (remainingRestTime === 0 && isResting) {
      setIsResting(false);
      showToast("info", "Info", "Rest time is over. Ready for the next set!");
      try {
        if (canVibrate()) {
          vibrateDevice();
        }
      } catch (error) {
        console.error("Error with vibration:", error);
      }
    }
    return () => clearInterval(restTimer);
  }, [isResting, remainingRestTime, showToast]);

  useEffect(() => {
    saveDataToLocalStorage();
  }, [currentPlan, sets, currentExerciseIndex, notes, lastSetValues]);

  const loadStoredData = (plan) => {
    const initialTotalSets = plan.exercises.reduce(
      (total, exercise) => total + (exercise.requiredSets || 3),
      0
    );
    setTotalSets(initialTotalSets);
    const storedSets = localStorage.getItem(`currentSets_${user.id}`);
    if (storedSets) {
      const parsedSets = JSON.parse(storedSets);
      const initialCompletedSets = parsedSets.reduce(
        (total, exerciseSets) => total + exerciseSets.length,
        0
      );
      setCompletedSets(initialCompletedSets);
      setSets(parsedSets);
    } else {
      setCompletedSets(0);
      setSets(plan.exercises.map(() => []));
    }
    const storedIndex = localStorage.getItem(`currentExerciseIndex_${user.id}`);
    const storedStartTime = localStorage.getItem(`workoutStartTime_${user.id}`);
    if (storedStartTime) {
      setStartTime(new Date(storedStartTime));
      const now = new Date();
      const elapsed = Math.floor((now - new Date(storedStartTime)) / 1000);
      setElapsedTime(elapsed);
    } else {
      const newStartTime = new Date();
      setStartTime(newStartTime);
      localStorage.setItem(
        `workoutStartTime_${user.id}`,
        newStartTime.toISOString()
      );
      setElapsedTime(0);
    }
    const storedNotes = localStorage.getItem(`workoutNotes_${user.id}`);
    const storedLastSetValues = localStorage.getItem(
      `lastSetValues_${user.id}`
    );
  
    if (storedIndex !== null) {
      setCurrentExerciseIndex(parseInt(storedIndex, 10));
    }
  
    if (storedNotes) {
      setNotes(JSON.parse(storedNotes));
    } else {
      setNotes(plan.exercises.map(() => ""));
    }
  
    if (storedLastSetValues) {
      const parsedLastSetValues = JSON.parse(storedLastSetValues);
      setLastSetValues(parsedLastSetValues);
  
      // Restore the input fields for the current exercise
      const currentExercise = plan.exercises[currentExerciseIndex];
      const lastValues = parsedLastSetValues[currentExercise._id];
      if (lastValues) {
        if (currentExercise.category === "Strength") {
          setWeight(lastValues.weight?.toString() || "");
          setReps(lastValues.reps?.toString() || "");
        } else if (currentExercise.category === "Cardio") {
          setDuration(lastValues.duration?.toString() || "");
          setDistance(lastValues.distance?.toString() || "");
          setIntensity(lastValues.intensity?.toString() || "");
          setIncline(lastValues.incline?.toString() || "");
        }
      }
    }
  
    const initialRequiredSets = {};
    plan.exercises.forEach(exercise => {
      initialRequiredSets[exercise._id] = exercise.requiredSets || 3;
    });
    setRequiredSets(initialRequiredSets);
  };

  const saveDataToLocalStorage = () => {
    if (currentPlan) {
      localStorage.setItem(
        `currentPlan_${user.id}`,
        JSON.stringify(currentPlan)
      );
    }
    if (sets.length > 0) {
      localStorage.setItem(`currentSets_${user.id}`, JSON.stringify(sets));
    }
    localStorage.setItem(
      `currentExerciseIndex_${user.id}`,
      currentExerciseIndex.toString()
    );
    localStorage.setItem(`workoutNotes_${user.id}`, JSON.stringify(notes));
    localStorage.setItem(
      `lastSetValues_${user.id}`,
      JSON.stringify(lastSetValues)
    );
    localStorage.setItem(
      `requiredSets_${user.id}`,
      JSON.stringify(requiredSets)
    );
    localStorage.setItem(`completedSets_${user.id}`, completedSets.toString());
    localStorage.setItem(`totalSets_${user.id}`, totalSets.toString());
  };

  useEffect(() => {
    if (user && user.experienceLevel) {
      setUserExperienceLevel(user.experienceLevel);
    }
  }, [user]);

  const loadExerciseRecommendations = useCallback(async (exerciseId) => {
    const exercise = await getExerciseById(exerciseId);
    if (exercise && exercise.recommendations && exercise.recommendations[userExperienceLevel]) {
      const rec = exercise.recommendations[userExperienceLevel];
      setWeight(rec.weight.toString());
      setReps(rec.reps.toString());
      setRequiredSets(prevSets => ({
        ...prevSets,
        [exerciseId]: rec.sets
      }));
    }
  }, [getExerciseById, userExperienceLevel]);

  useEffect(() => {
    if (currentPlan && currentPlan.exercises && currentPlan.exercises[currentExerciseIndex]) {
      const currentExercise = currentPlan.exercises[currentExerciseIndex];
      loadExerciseRecommendations(currentExercise._id);
    }
  }, [currentPlan, currentExerciseIndex, loadExerciseRecommendations]);

  const renderExerciseInputs = () => {
    const currentExercise = currentPlan.exercises[currentExerciseIndex];
    const recommendation = currentExercise.recommendations?.[userExperienceLevel];

    if (currentExercise.category === "Strength") {
      return (
        <div className="mb-4 flex flex-col">
          <div className="flex mb-2">
            <div className="relative w-full mr-2">
              <input
                type="number"
                value={weight}
                onChange={e => setWeight(e.target.value)}
                className="input-with-placeholder shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
              <span className="placeholder-text">Weight (kg)</span>
            </div>
            <div className="relative w-full">
              <input
                type="number"
                value={reps}
                onChange={e => setReps(e.target.value)}
                className="input-with-placeholder shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
              <span className="placeholder-text">Reps</span>
            </div>
          </div>
        </div>
      );
    } else if (currentExercise.category === "Cardio") {
      return (
        <div className="mb-4 grid grid-cols-2 gap-2">
          <input
            type="number"
            placeholder="Duration (minutes)"
            value={duration}
            onChange={e => setDuration(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
          <input
            type="number"
            placeholder="Distance (km)"
            value={distance}
            onChange={e => setDistance(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
          <input
            type="number"
            placeholder="Intensity (1-10)"
            value={intensity}
            onChange={e => setIntensity(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
          <input
            type="number"
            placeholder="Incline (%)"
            value={incline}
            onChange={e => setIncline(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
      );
    }
    // You can add an else clause here for Flexibility exercises if needed
  };

  const handleSetComplete = async () => {
    const currentExercise = currentPlan.exercises[currentExerciseIndex];
    let newSet;
  
    if (currentExercise.category === "Strength") {
      if (!weight || !reps) {
        showToast("error", "Error", "Please enter both weight and reps");
        return;
      }
      newSet = {
        weight: Number(weight),
        reps: Number(reps),
        completedAt: new Date().toISOString(),
        skippedRest: isResting,
      };
  
      // Update the user-specific recommendation
      try {
        await updateUserRecommendation(currentExercise._id, {
          weight: Number(weight),
          reps: Number(reps),
          sets: requiredSets[currentExercise._id] || 3
        });
      } catch (error) {
        console.error('Failed to update user-specific recommendation:', error);
        showToast('error', 'Error', 'Failed to update exercise recommendation');
      }
    } else if (currentExercise.category === "Cardio") {
      if (!duration) {
        showToast("error", "Error", "Please enter at least the duration");
        return;
      }
      newSet = {
        duration: Number(duration),
        distance: distance ? Number(distance) : undefined,
        intensity: intensity ? Number(intensity) : undefined,
        incline: incline ? Number(incline) : undefined,
        completedAt: new Date().toISOString(),
        skippedRest: isResting,
      };
  
      // Update the user-specific recommendation for cardio exercises
      try {
        await updateUserRecommendation(currentExercise._id, {
          duration: Number(duration),
          distance: distance ? Number(distance) : undefined,
          intensity: intensity ? Number(intensity) : undefined,
          incline: incline ? Number(incline) : undefined
        });
      } catch (error) {
        console.error('Failed to update user-specific recommendation for cardio:', error);
      }
    }
  
    setSets(prevSets => {
      const newSets = [...prevSets];
      if (currentExercise.category === "Cardio") {
        newSets[currentExerciseIndex] = [newSet];
      } else {
        newSets[currentExerciseIndex] = [
          ...(newSets[currentExerciseIndex] || []),
          newSet,
        ];
      }
      return newSets;
    });
  
    setCompletedSets(prevCompletedSets => prevCompletedSets + 1);
  
    setLastSetValues(prev => ({
      ...prev,
      [currentExercise._id]: newSet,
    }));
  
    // Update progress
    const newProgress = calculateProgress();
    setProgression(newProgress);
  
    // Save progress to database
    try {
      const exercisesProgress = currentPlan.exercises.map((exercise, index) => ({
        exercise: exercise._id,
        sets: sets[index] || [],
        notes: notes[index] || "",
        requiredSets: requiredSets[exercise._id] || 3,
      }));
  
      await saveProgress({
        plan: currentPlan._id,
        exercises: exercisesProgress,
        currentExerciseIndex,
        lastSetValues: {
          ...lastSetValues,
          [currentExercise._id]: newSet,
        },
        startTime: startTime.toISOString(),
        completedSets: completedSets + 1,
        totalSets,
        totalPauseTime,
        skippedPauses,
      });
  
      showToast("success", "Success", `${currentExercise.category === "Cardio" ? "Exercise" : "Set"} completed and progress saved!`);
    } catch (error) {
      console.error("Error saving progress:", error);
      showToast("error", "Error", "Failed to save progress");
    }
  
    // For cardio exercises, we don't start the rest timer
    if (currentExercise.category !== "Cardio") {
      startRestTimer();
    }
  
    // Check if exercise is complete and move to the next one if it is
    if (isExerciseComplete(currentExercise._id, sets[currentExerciseIndex] || [])) {
      if (currentExerciseIndex < currentPlan.exercises.length - 1) {
        handleExerciseChange(currentExerciseIndex + 1);
      } else {
        showToast("success", "Success", "Workout complete! You can finish your workout now.");
      }
    }
  };

  const isExerciseComplete = useCallback(
    (exerciseId, exerciseSets) => {
      const exercise = currentPlan.exercises.find(e => e._id === exerciseId);
      if (exercise.category === "Cardio") {
        return exerciseSets.length > 0;
      }
      return exerciseSets.length >= (requiredSets[exerciseId] || 0);
    },
    [currentPlan, requiredSets]
  );

  const startRestTimer = () => {
    setIsResting(true);
    setRemainingRestTime(restTime);
  };

  const skipRestTimer = () => {
    setIsResting(false);
    setRemainingRestTime(0);
    setSkippedPauses(prevSkipped => prevSkipped + 1);
    showToast("info", "Info", "Rest timer skipped");
  };

  const updateProgression = () => {
    const totalExercises = currentPlan.exercises.length;
    const completedExercises = currentPlan.exercises.filter((exercise, index) =>
      isExerciseComplete(exercise._id, sets[index] || [])
    ).length;
    const newProgression = (completedExercises / totalExercises) * 100;
    setProgression(newProgression);
  };

  const handleFinishWorkout = async () => {
    // Ensure the final exercise progress is saved
    await saveProgress({
      plan: currentPlan._id,
      exercise: currentPlan.exercises[currentExerciseIndex]._id,
      sets: sets[currentExerciseIndex] || [],
      notes: notes[currentExerciseIndex],
      currentExerciseIndex,
      lastSetValues,
      startTime: startTime.toISOString(),
    });

    // Recalculate the final progression
    const finalProgression = calculateProgress();

    const endTime = new Date();
    const completedWorkout = {
      plan: currentPlan._id,
      planName: currentPlan.name,
      exercises: currentPlan.exercises.map((exercise, index) => ({
        exercise: exercise._id,
        sets: sets[index] || [],
        completedAt:
          sets[index] && sets[index].length > 0
            ? sets[index][sets[index].length - 1].completedAt
            : endTime.toISOString(),
        notes: notes[index],
      })),
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      totalPauseTime,
      skippedPauses,
      progression: finalProgression, // Use the recalculated progression
    };

    try {
      await addWorkout(completedWorkout);
      await clearWorkout();
      showToast("success", "Success", "Workout completed and saved!");
      navigate("/");
    } catch (error) {
      console.error("Error saving workout:", error);
      showToast("error", "Error", "Failed to save workout. Please try again.");
    }
  };

  const handleCancelWorkout = () => {
    if (isConfirmingCancel) return;
    setIsConfirmingCancel(true);
    
    confirm({
      message: 'Are you sure you want to cancel this workout? All progress will be lost.',
      header: 'Cancel Workout',
      icon: 'pi pi-exclamation-triangle',
      acceptClassName: 'custom-nav-btn custom-nav-btn-danger',
      rejectClassName: 'custom-nav-btn',
      acceptLabel: 'Yes, Cancel',
      rejectLabel: 'No, Continue',
      className: 'custom-confirm-dialog',
      style: { width: '350px' },
      contentClassName: 'confirm-content',
      headerClassName: 'confirm-header',
      defaultFocus: 'reject',
      closable: false,
      accept: async () => {
        try {
          await clearWorkout();
          localStorage.removeItem("workoutStartTime");
          resetWorkoutState();
          clearLocalStorage();
          showToast('info', 'Info', 'Workout cancelled');
          setIsConfirmingCancel(false);
          navigate("/plans");
        } catch (error) {
          console.error("Error cancelling workout:", error);
          showToast('error', 'Error', 'Failed to cancel workout. Please try again.');
        }
      },
      reject: () => {
        setIsConfirmingCancel(false);
      }
    });
  };

  const resetWorkoutState = () => {
    setCurrentPlan(null);
    setSets([]);
    setNotes([]);
    setStartTime(null);
    setElapsedTime(0);
    setLastSetValues({});
    setCurrentExerciseIndex(0);
    setWeight("");
    setReps("");
    setRestTime(120);
    setIsResting(false);
    setRemainingRestTime(0);
    setTotalPauseTime(0);
    setSkippedPauses(0);
    setProgression(0);
    setRequiredSets({});
  };

  const clearLocalStorage = () => {
    localStorage.removeItem("currentPlan");
    localStorage.removeItem("currentSets");
    localStorage.removeItem("currentExerciseIndex");
    localStorage.removeItem("workoutStartTime");
    localStorage.removeItem("workoutNotes");
    localStorage.removeItem("lastSetValues");
  };

  const safelyFormatNumber = (value, decimalPlaces = 2) => {
    return typeof value === "number" ? value.toFixed(decimalPlaces) : "0.00";
  };

  const calculateProgress = useMemo(() => {
    return () => {
      if (totalSets === 0) return 0;
      let completedExercises = 0;
      let totalExercises = 0;

      currentPlan.exercises.forEach((exercise, index) => {
        if (exercise.category === "Cardio") {
          totalExercises += 1;
          if (sets[index] && sets[index].length > 0) {
            completedExercises += 1;
          }
        } else {
          const requiredSetsForExercise = requiredSets[exercise._id] || 3; // Default to 3 if not set
          totalExercises += requiredSetsForExercise;
          completedExercises += Math.min(
            (sets[index] || []).length,
            requiredSetsForExercise
          );
        }
      });

      return Math.min((completedExercises / totalExercises) * 100, 100); // Cap at 100%
    };
  }, [currentPlan, sets, requiredSets, totalSets]);

  const handleNoteChange = (index, value) => {
    setNotes(prevNotes => {
      const newNotes = [...prevNotes];
      newNotes[index] = value;
      return newNotes;
    });
  };

  const handleExerciseChange = async newIndex => {
    try {
      const exercisesProgress = currentPlan.exercises.map(
        (exercise, index) => ({
          exercise: exercise._id,
          sets: sets[index] || [],
          notes: notes[index] || "",
        })
      );

      await saveProgress({
        plan: currentPlan._id,
        exercises: exercisesProgress,
        currentExerciseIndex,
        lastSetValues,
        startTime: startTime.toISOString(),
        completedSets,
        totalSets,
        totalPauseTime,
        skippedPauses,
      });

      setCurrentExerciseIndex(newIndex);

      const newExercise = currentPlan.exercises[newIndex];
      const lastValues = lastSetValues[newExercise._id];
      if (lastValues) {
        if (newExercise.category === "Strength") {
          setWeight(lastValues.weight?.toString() || "");
          setReps(lastValues.reps?.toString() || "");
        } else if (newExercise.category === "Cardio") {
          setDuration(lastValues.duration?.toString() || "");
          setDistance(lastValues.distance?.toString() || "");
          setIntensity(lastValues.intensity?.toString() || "");
          setIncline(lastValues.incline?.toString() || "");
        }
      } else {
        // Reset all input fields if there are no last values
        setWeight("");
        setReps("");
        setDuration("");
        setDistance("");
        setIntensity("");
        setIncline("");
      }
    } catch (error) {
      console.error("Error saving progress before switching exercise:", error);
      showToast("error", "Error", "Failed to save progress.");
    }
  };

  const handleTouchStart = e => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = e => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (
      isLeftSwipe &&
      currentExerciseIndex < currentPlan.exercises.length - 1
    ) {
      handleExerciseChange(currentExerciseIndex + 1);
    } else if (isRightSwipe && currentExerciseIndex > 0) {
      handleExerciseChange(currentExerciseIndex - 1);
    }

    setTouchStart(null);
    setTouchEnd(null);
  };

  const toggleExerciseDetails = () => {
    setIsExerciseDetailsOpen(!isExerciseDetailsOpen);
  };

  const toggleExerciseOptions = () => {
    setIsExerciseOptionsOpen(!isExerciseOptionsOpen);
  };

  const togglePreviousWorkout = () => {
    setIsPreviousWorkoutOpen(!isPreviousWorkoutOpen);
  };

  const toggleCurrentSetLog = () => {
    setIsCurrentSetLogOpen(!isCurrentSetLogOpen);
  };

  if (isLoading) {
    return <div className="text-center mt-8">Loading workout...</div>;
  }

  if (
    !currentPlan ||
    !currentPlan.exercises ||
    currentPlan.exercises.length === 0
  ) {
    return (
      <div className="text-center mt-8">
        <p>No workout plan or exercises found. Please select a plan.</p>
        <button
          onClick={() => navigate("/plans")}
          className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Go to Plans
        </button>
      </div>
    );
  }

  const currentExercise = currentPlan.exercises[currentExerciseIndex];

  const renderSetDetails = (set, exerciseCategory) => {
    if (exerciseCategory === "Strength") {
      return `${set.weight} kg x ${set.reps} reps`;
    } else if (exerciseCategory === "Cardio") {
      let details = `${set.duration} minutes`;
      if (set.distance) details += `, ${set.distance} km`;
      if (set.intensity) details += `, Intensity: ${set.intensity}`;
      if (set.incline) details += `, Incline: ${set.incline}%`;
      return details;
    } else {
      return "No data available";
    }
  };

  return (
    <>
      <h2 data-aos="fade-up" className="header text-3xl font-bold text-center mb-4">Workout <span className="headerSpan">Tracker</span></h2>
      <div
        className={`workout-tracker container mx-auto mt-8 p-4 ${
          darkMode ? 'dark-mode bg-gray-800 text-white' : 'bg-white text-gray-800'
        }`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}>
        {exerciseHistoryError && (
          <div
            className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4"
            role="alert">
            <p className="font-bold">Error</p>
            <p>{exerciseHistoryError}</p>
          </div>
        )}

        <div className="relative mb-6">
          <button
            onClick={handleCancelWorkout}
            className="border-solid border-2 border-bg-white absolute top-0 right-0 bg-btn-close hover:bg-btn-hover text-white font-bold py-1 px-2 sm:py-2 sm:px-4 rounded focus:outline-none focus:shadow-outline text-xs sm:text-base"
            disabled={isConfirmingCancel}>
            <FiX strokeWidth="3" className="w-4 h-4 sm:w-6 sm:h-6" />
          </button>
          <h3 className="text-xl text-center mt-2 pr-12 sm:pr-0">{currentPlan.name}</h3>
        </div>

      <div className="mb-4 text-lg text-center">
        Elapsed Time: {formatTime(elapsedTime)}
      </div>

      <div className="mb-4">
        <div className="progress-bar">
          <div
            className="progress-bar-fill"
            style={{ width: `${calculateProgress().toFixed(2)}%` }}></div>
        </div>
        <p className="text-sm mt-2 text-center">
          Overall Progress: {calculateProgress().toFixed(2)}%
        </p>
      </div>

      <div className="mb-4 flex justify-center items-center">
        <div className="flex items-center space-x-2 overflow-x-auto py-2 px-4 carousel-container">
          {currentPlan.exercises.map((exercise, index) => (
            <button
              key={exercise._id}
              onClick={() => handleExerciseChange(index)}
              className={`w-4 h-4 rounded-full focus:outline-none transition-all duration-200 ${
                index === currentExerciseIndex
                  ? "bg-color1 w-5 h-5"
                  : isExerciseComplete(exercise._id, sets[index] || [])
                  ? "bg-white"
                  : "bg-gray-300 dark:bg-gray-600"
              }`}
              title={exercise.name}
              aria-label={`Go to exercise: ${exercise.name}`}
            />
          ))}
        </div>
      </div>

      <SwitchTransition mode="out-in">
        <CSSTransition
          key={currentExerciseIndex}
          nodeRef={nodeRef}
          timeout={300}
          classNames="fade">
          <div
            ref={nodeRef}
            className="exercise-container bg-gray-100 dark:bg-gray-700 shadow-md rounded px-8 pt-6 pb-8 mb-4">
            {currentExercise ? (
              <>
                <div className="flex flex-col md:flex-row mb-4">
                  <img
                    src={currentExercise.imageUrl}
                    alt={currentExercise.name}
                    className="w-full md:w-1/3 h-48 object-cover rounded-lg mr-0 md:mr-4 mb-4 md:mb-0"
                  />
                  <div className="flex-grow">
                    <div
                      className="flex justify-between items-center cursor-pointer"
                      onClick={toggleExerciseDetails}>
                      <h4 className="headerSpan text-lg font-semibold mb-2">
                        {currentExercise.name}
                      </h4>
                      {isExerciseDetailsOpen ? (
                        <FiChevronUp />
                      ) : (
                        <FiChevronDown />
                      )}
                    </div>
                    <div
                      className={`collapsible-content ${
                        isExerciseDetailsOpen ? "open" : ""
                      }`}>
                      <p className="mb-2">
                        <strong>Description:</strong>{" "}
                        {currentExercise.description}
                      </p>
                      <p className="mb-2">
                        <strong>Target Muscle:</strong> {currentExercise.target}
                      </p>
                    </div>
                    {currentExercise.category === "Cardio" ? (
                      <p className="mb-2">
                        <strong>Exercise completed:</strong>{" "}
                        {isExerciseComplete(
                          currentExercise._id,
                          sets[currentExerciseIndex] || []
                        )
                          ? "1"
                          : "0"}{" "}
                        / 1
                      </p>
                    ) : (
                      <p className="mb-2">
                        <strong>Sets completed:</strong>{" "}
                        {(sets[currentExerciseIndex] || []).length} /{" "}
                        {requiredSets[currentExercise._id] || 3}
                      </p>
                    )}
                  </div>
                </div>

                {renderExerciseInputs()}
                <div className="mb-4 flex justify-between items-center">
                  <button
                    onClick={handleSetComplete}
                    className="btn btn-secondary">
                    {currentExercise.category === "Cardio"
                      ? "Complete Exercise"
                      : "Complete Set"}
                  </button>
                  <button
                    onClick={toggleExerciseOptions}
                    className="btn btn-secondary flex items-center">
                    <FiSettings className="mr-2" /> Options
                    {isExerciseOptionsOpen ? (
                      <FiChevronUp className="ml-2" />
                    ) : (
                      <FiChevronDown className="ml-2" />
                    )}
                  </button>
                </div>

                <div
                  className={`collapsible-content ${
                    isExerciseOptionsOpen ? "open" : ""
                  }`}>
                  <div className="mb-4">
                    <label
                      className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2"
                      htmlFor="restTime">
                      Rest Time (seconds):
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      id="restTime"
                      value={restTime || ""}
                      onChange={e => setRestTime(Number(e.target.value))}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                  </div>
                  <div className="mb-4">
                    <label
                      className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2"
                      htmlFor={`notes-${currentExerciseIndex}`}>
                      Exercise Notes:
                    </label>
                    <textarea
                      id={`notes-${currentExerciseIndex}`}
                      value={notes[currentExerciseIndex] || ""}
                      onChange={e =>
                        handleNoteChange(currentExerciseIndex, e.target.value)
                      }
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      rows="3"></textarea>
                  </div>
                </div>

                {isResting && (
                  <div className="rest-timer mb-4">
                    <p>Rest Time Remaining: {formatTime(remainingRestTime)}</p>
                    <div className="rest-timer-bar">
                      <div
                        className="rest-timer-fill"
                        style={{
                          width: `${(remainingRestTime / restTime) * 100}%`,
                        }}></div>
                    </div>
                    {/* <button
                      onClick={skipRestTimer}
                      className="mt-2 bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-2 rounded focus:outline-none focus:shadow-outline">
                      Skip Rest
                    </button> */}
                    {canVibrate() && (
                      <p className="text-sm mt-2">
                        Your device will vibrate when the rest time is over.
                      </p>
                    )}
                  </div>
                )}
              </>
            ) : (
              <p>No exercise data available for this index.</p>
            )}
          </div>
        </CSSTransition>
      </SwitchTransition>

      <div className="flex justify-between items-center mt-4">
        <button
          onClick={() =>
            handleExerciseChange(Math.max(0, currentExerciseIndex - 1))
          }
          className={`btn btn-primary-previous ${
            currentExerciseIndex === 0 ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={currentExerciseIndex === 0}>
          <FiChevronLeft className="inline-block mr-1" /> Previous
        </button>
        <span className="text-lg font-semibold">
          {currentExerciseIndex + 1} / {currentPlan.exercises.length}
        </span>
        {currentExerciseIndex < currentPlan.exercises.length - 1 ? (
          <button
            onClick={() => handleExerciseChange(currentExerciseIndex + 1)}
            className="btn btn-primary">
            Next <FiChevronRight className="inline-block ml-1" />
          </button>
        ) : (
          <button onClick={handleFinishWorkout} className="btn btn-primary">
            Finish Workout
          </button>
        )}
      </div>

      <div
        className={`mt-8 rounded-lg ${
          darkMode ? "bg-gray-700" : "bg-blue-100"
        }`}>
        <button
          onClick={togglePreviousWorkout}
          className={`w-full p-4 text-left font-semibold flex justify-between items-center ${
            darkMode ? "text-blue-300" : "text-blue-800"
          }`}>
          <span>Previous Workout and Exercise Performance</span>
          {isPreviousWorkoutOpen ? <FiChevronUp /> : <FiChevronDown />}
        </button>
        <div
          className={`collapsible-content ${
            isPreviousWorkoutOpen ? "open" : ""
          }`}>
          <PreviousWorkoutDisplay
            previousWorkout={previousWorkout}
            exerciseHistory={exerciseHistory[currentExercise?._id]}
            isLoading={isPreviousWorkoutLoading}
            formatTime={formatTime}
            darkMode={darkMode}
            currentExercise={currentExercise}
          />
        </div>
      </div>

      <div
        className={`mt-8 rounded-lg ${
          darkMode ? "bg-gray-700" : "bg-green-100"
        }`}>
        <button
          onClick={toggleCurrentSetLog}
          className={`w-full p-4 text-left font-semibold flex justify-between items-center ${
            darkMode ? "text-green-300" : "text-green-800"
          }`}>
          <span>Current Workout Log</span>
          {isCurrentSetLogOpen ? <FiChevronUp /> : <FiChevronDown />}
        </button>
        <div
          className={`collapsible-content ${
            isCurrentSetLogOpen ? "open" : ""
          }`}>
          <div className="p-4">
            {currentPlan.exercises.map((exercise, index) => (
              <div key={exercise._id} className="mb-4">
                <h4
                  className={`text-lg font-medium ${
                    darkMode ? "text-green-200" : "text-green-700"
                  }`}>
                  {exercise.name}
                  {isExerciseComplete(exercise._id, sets[index] || []) &&
                    " (Complete)"}
                </h4>
                {sets[index] && sets[index].length > 0 ? (
                  <ul className="list-disc pl-5">
                    {exercise.category === "Cardio" ? (
                      <li>
                        {renderSetDetails(sets[index][0], exercise.category)}
                      </li>
                    ) : (
                      sets[index].map((set, setIndex) => (
                        <li key={setIndex}>
                          Set {setIndex + 1}:{" "}
                          {renderSetDetails(set, exercise.category)}
                        </li>
                      ))
                    )}
                  </ul>
                ) : (
                  <p>No data recorded yet</p>
                )}
                {exercise.category === "Cardio" ? (
                  <p>
                    Exercise completed:{" "}
                    {isExerciseComplete(exercise._id, sets[index] || [])
                      ? "1"
                      : "0"}{" "}
                    / 1
                  </p>
                ) : (
                  <p>
                    {sets[index] ? sets[index].length : 0} /{" "}
                    {requiredSets[exercise._id] || 0} sets completed
                  </p>
                )}
                {notes[index] && (
                  <p className="mt-2 italic">Notes: {notes[index]}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={`swipe-overlay ${swipeDirection ? "active" : ""}`}>
        {swipeDirection === "left" && (
          <div className="swipe-indicator right">
            <FiChevronRight />
          </div>
        )}
        {swipeDirection === "right" && (
          <div className="swipe-indicator left">
            <FiChevronLeft />
          </div>
        )}
      </div>
      </div>
    </>
  );
}

export default WorkoutTracker;