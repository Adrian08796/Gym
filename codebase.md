# vite.config.js

```js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // This makes the server listen on all addresses, including your local network
    port: 5173, // or whatever port you want to use
  },
});
```

# tailwind.config.js

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'app-dark-green': '#054029',
        'app-light-green': '#0B5C3B',
        'app-bright-green': '#10A37F',
        'app-white': '#FFFFFF',
      },
    },
  },
  plugins: [],
}
```

# recover3.jsx

```jsx
// pages/WorkoutTracker.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGymContext } from '../context/GymContext';

function WorkoutTracker() {
  const [currentPlan, setCurrentPlan] = useState(null);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [sets, setSets] = useState([]);
  const { addWorkout } = useGymContext();
  const navigate = useNavigate();

  useEffect(() => {
    const storedPlan = localStorage.getItem('currentPlan');
    const storedSets = localStorage.getItem('currentSets');
    const storedIndex = localStorage.getItem('currentExerciseIndex');

    if (storedPlan) {
      const parsedPlan = JSON.parse(storedPlan);
      setCurrentPlan(parsedPlan);
      
      if (storedSets) {
        setSets(JSON.parse(storedSets));
      } else {
        setSets(parsedPlan.exercises.map(() => []));
      }
      
      if (storedIndex) {
        setCurrentExerciseIndex(parseInt(storedIndex));
      }
    }
  }, []);

  useEffect(() => {
    if (currentPlan) {
      localStorage.setItem('currentPlan', JSON.stringify(currentPlan));
    }
    if (sets.length > 0) {
      localStorage.setItem('currentSets', JSON.stringify(sets));
    }
    localStorage.setItem('currentExerciseIndex', currentExerciseIndex.toString());
  }, [currentPlan, sets, currentExerciseIndex]);

  const handleSetComplete = (weight, reps) => {
    setSets(prevSets => {
      const newSets = [...prevSets];
      newSets[currentExerciseIndex] = [...(newSets[currentExerciseIndex] || []), { weight, reps }];
      return newSets;
    });
  };

  const handlePreviousExercise = () => {
    if (currentExerciseIndex > 0) {
      setCurrentExerciseIndex(prevIndex => prevIndex - 1);
    }
  };

  const handleNextExercise = async () => {
    if (currentExerciseIndex < currentPlan.exercises.length - 1) {
      setCurrentExerciseIndex(prevIndex => prevIndex + 1);
    } else {
      // Workout complete, save it
      const completedWorkout = {
        plan: currentPlan._id,
        planName: currentPlan.name,
        exercises: currentPlan.exercises.map((exercise, index) => ({
          exercise: exercise._id,
          sets: sets[index] || []
        }))
      };
      console.log('Completed workout data:', completedWorkout);
      try {
        await addWorkout(completedWorkout);
        alert('Workout completed and saved!');
        // Clear localStorage
        localStorage.removeItem('currentPlan');
        localStorage.removeItem('currentSets');
        localStorage.removeItem('currentExerciseIndex');
        navigate('/');
      } catch (error) {
        console.error('Error saving workout:', error);
        alert('Failed to save workout. Please try again.');
      }
    }
  };

  if (!currentPlan) {
    return <div>Loading workout plan...</div>;
  }

  const currentExercise = currentPlan.exercises[currentExerciseIndex];

  return (
    <div className="container mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-4">Workout Tracker</h2>
      <h3 className="text-xl mb-4">{currentPlan.name}</h3>
      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <h4 className="text-lg font-semibold mb-2">Current Exercise: {currentExercise.name}</h4>
        <div className="flex mb-4">
          <img 
            src={currentExercise.imageUrl} 
            alt={currentExercise.name} 
            className="w-1/3 h-auto object-cover rounded-lg mr-4"
          />
          <div>
            <p className="mb-2"><strong>Description:</strong> {currentExercise.description}</p>
            <p className="mb-2"><strong>Target Muscle:</strong> {currentExercise.target}</p>
            <p className="mb-2"><strong>Sets completed:</strong> {(sets[currentExerciseIndex] || []).length}</p>
          </div>
        </div>
        <div className="mb-4">
          <input
            type="number"
            placeholder="Weight"
            id="weight"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mr-2 mb-2"
          />
          <input
            type="number"
            placeholder="Reps"
            id="reps"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-2"
          />
        </div>
        <button
          onClick={() => {
            const weight = document.getElementById('weight').value;
            const reps = document.getElementById('reps').value;
            if (weight && reps) {
              handleSetComplete(Number(weight), Number(reps));
              document.getElementById('weight').value = '';
              document.getElementById('reps').value = '';
            } else {
              alert('Please enter both weight and reps');
            }
          }}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mb-4"
        >
          Complete Set
        </button>
      </div>
      <div className="flex justify-between">
        <button
          onClick={handlePreviousExercise}
          disabled={currentExerciseIndex === 0}
          className={`bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mb-4 ${currentExerciseIndex === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          Previous Exercise
        </button>
        <button
          onClick={handleNextExercise}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mb-4"
        >
          {currentExerciseIndex < currentPlan.exercises.length - 1 ? 'Next Exercise' : 'Finish Workout'}
        </button>
      </div>

      {/* Set Log */}
      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4">Set Log</h3>
        {currentPlan.exercises.map((exercise, index) => (
          <div key={exercise._id} className="mb-4">
            <h4 className="text-lg font-medium">{exercise.name}</h4>
            {sets[index] && sets[index].length > 0 ? (
              <ul className="list-disc pl-5">
                {sets[index].map((set, setIndex) => (
                  <li key={setIndex}>
                    Set {setIndex + 1}: {set.weight} lbs x {set.reps} reps
                  </li>
                ))}
              </ul>
            ) : (
              <p>No sets completed yet</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default WorkoutTracker;
```

# recover2.jsx

```jsx
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
      // Ensure each exercise in the plan has all its details
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
    } catch (error) {
      console.error('Error fetching workout plans:', error);
      addNotification('Failed to fetch workout plans', 'error');
    }
  };

  const addWorkoutPlan = async (plan) => {
    try {
      const response = await axios.post(`${API_URL}/workoutplans`, plan, getAuthConfig());
      // Fetch the full details of the newly added plan
      const fullPlan = await axios.get(`${API_URL}/workoutplans/${response.data._id}`, getAuthConfig());
      setWorkoutPlans(prevPlans => [...prevPlans, fullPlan.data]);
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
```

# recover1.jsx

```jsx
// src/pages/WorkoutPlans.jsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGymContext } from '../context/GymContext';
import WorkoutPlanForm from '../components/WorkoutPlanForm';

function WorkoutPlans() {
  const { workoutPlans, deleteWorkoutPlan, addWorkoutPlan } = useGymContext();
  const [showForm, setShowForm] = useState(false);
  const [ongoingWorkout, setOngoingWorkout] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedPlan = localStorage.getItem('currentPlan');
    if (storedPlan) {
      setOngoingWorkout(JSON.parse(storedPlan));
    }
  }, []);

  const handleStartWorkout = (plan) => {
    localStorage.setItem('currentPlan', JSON.stringify(plan));
    navigate('/tracker');
  };

  const handleResumeWorkout = () => {
    navigate('/tracker');
  };

  const handleAddWorkoutPlan = async (plan) => {
    try {
      await addWorkoutPlan(plan);
      setShowForm(false);
    } catch (error) {
      console.error('Error adding workout plan:', error);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Workout Plans</h1>
      {ongoingWorkout && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4" role="alert">
          <p className="font-bold">Ongoing Workout</p>
          <p>You have an unfinished workout: {ongoingWorkout.name}</p>
          <button
            onClick={handleResumeWorkout}
            className="mt-2 bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded"
          >
            Resume Workout
          </button>
        </div>
      )}
      <button
        onClick={() => setShowForm(!showForm)}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
      >
        {showForm ? 'Hide Form' : 'Create New Plan'}
      </button>
      {showForm && <WorkoutPlanForm onSubmit={handleAddWorkoutPlan} />}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {workoutPlans.map((plan) => (
          <div key={plan._id} className="border rounded-lg p-4 mb-4 shadow-sm">
            <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
            <ul className="list-disc list-inside mb-4">
              {plan.exercises.map((exercise) => (
                <li key={exercise._id} className="mb-2">
                  <span className="font-medium">{exercise.name}</span>
                  <p className="text-sm text-gray-600 ml-4">{exercise.description}</p>
                  <p className="text-sm text-gray-500 ml-4">Target: {exercise.target}</p>
                </li>
              ))}
            </ul>
            <div className="flex justify-between">
              <button
                onClick={() => handleStartWorkout(plan)}
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 rounded"
              >
                Start Workout
              </button>
              <button
                onClick={() => deleteWorkoutPlan(plan._id)}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
              >
                Delete Plan
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default WorkoutPlans;
```

# postcss.config.js

```js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}

```

# package.json

```json
{
  "name": "gym-app",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite --host='192.168.178.42' --open",
    "build": "vite build",
    "lint": "eslint . --ext js,jsx --report-unused-disable-directives --max-warnings 0",
    "preview": "vite preview"
  },
  "dependencies": {
    "axios": "^1.7.3",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.25.1"
  },
  "devDependencies": {
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.1",
    "autoprefixer": "^10.4.19",
    "eslint": "^8.57.0",
    "eslint-plugin-react": "^7.34.3",
    "eslint-plugin-react-hooks": "^4.6.2",
    "eslint-plugin-react-refresh": "^0.4.7",
    "postcss": "^8.4.40",
    "tailwindcss": "^3.4.7",
    "vite": "^5.3.4"
  }
}

```

# index.html

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Vite + React</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>

```

# README.md

```md
# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

```

# .gitignore

```
# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

node_modules
dist
dist-ssr
*.local

# Editor directories and files
.vscode/*
!.vscode/extensions.json
.idea
.DS_Store
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?

```

# .eslintrc.cjs

```cjs
module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  settings: { react: { version: '18.2' } },
  plugins: ['react-refresh'],
  rules: {
    'react/jsx-no-target-blank': 'off',
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
  },
}

```

# src/main.jsx

```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

```

# src/index.css

```css
@tailwind base;
@tailwind components;
@tailwind utilities;


```

# src/App.jsx

```jsx
// src/App.jsx

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import WorkoutTracker from './pages/WorkoutTracker';
import ExerciseLibrary from './pages/ExerciseLibrary';
import WorkoutPlans from './pages/WorkoutPlans';
import WorkoutSummary from './pages/WorkoutSummary';
import Header from './components/Header';
import Footer from './components/Footer';
import Login from './components/Login';
import Register from './components/Register';
import { AuthProvider, useAuth } from './context/AuthContext';
import { GymProvider } from './context/GymContext';
import { NotificationProvider } from './context/NotificationContext';
import NotificationToast from './components/NotificationToast';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return <div>Loading...</div>;
  }
  return user ? children : <Navigate to="/login" />;
};

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <div className="App flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          <Routes>
            <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
            <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />
            <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
            <Route path="/tracker" element={<PrivateRoute><WorkoutTracker /></PrivateRoute>} />
            <Route path="/exercises" element={<PrivateRoute><ExerciseLibrary /></PrivateRoute>} />
            <Route path="/plans" element={<PrivateRoute><WorkoutPlans /></PrivateRoute>} />
            <Route path="/workout-summary" element={<PrivateRoute><WorkoutSummary /></PrivateRoute>} />
          </Routes>
        </main>
        <Footer />
        <NotificationToast />
      </div>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <GymProvider>
          <AppContent />
        </GymProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
```

# src/App.css

```css
#root {
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
}

.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.react:hover {
  filter: drop-shadow(0 0 2em #61dafbaa);
}

@keyframes logo-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@media (prefers-reduced-motion: no-preference) {
  a:nth-of-type(2) .logo {
    animation: logo-spin infinite 20s linear;
  }
}

.card {
  padding: 2em;
}

.read-the-docs {
  color: #888;
}

```

# public/vite.svg

This is a file of the type: SVG Image

# src/pages/WorkoutTracker.jsx

```jsx
// src/pages/WorkoutTracker.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGymContext } from '../context/GymContext';
import { useNotification } from '../context/NotificationContext';

function WorkoutTracker() {
  const [currentPlan, setCurrentPlan] = useState(null);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [sets, setSets] = useState([]);
  const [startTime, setStartTime] = useState(null);
  const { addWorkout } = useGymContext();
  const { addNotification } = useNotification();
  const navigate = useNavigate();

  useEffect(() => {
    const storedPlan = localStorage.getItem('currentPlan');
    const storedSets = localStorage.getItem('currentSets');
    const storedIndex = localStorage.getItem('currentExerciseIndex');
    const storedStartTime = localStorage.getItem('workoutStartTime');

    if (storedPlan) {
      const parsedPlan = JSON.parse(storedPlan);
      setCurrentPlan(parsedPlan);
      
      if (storedSets) {
        setSets(JSON.parse(storedSets));
      } else {
        setSets(parsedPlan.exercises.map(() => []));
      }
      
      if (storedIndex !== null) {
        setCurrentExerciseIndex(parseInt(storedIndex, 10));
      }

      if (storedStartTime) {
        setStartTime(new Date(storedStartTime));
      } else {
        const newStartTime = new Date();
        setStartTime(newStartTime);
        localStorage.setItem('workoutStartTime', newStartTime.toISOString());
      }
    }
  }, []);

  useEffect(() => {
    if (currentPlan) {
      localStorage.setItem('currentPlan', JSON.stringify(currentPlan));
    }
    if (sets.length > 0) {
      localStorage.setItem('currentSets', JSON.stringify(sets));
    }
    localStorage.setItem('currentExerciseIndex', currentExerciseIndex.toString());
  }, [currentPlan, sets, currentExerciseIndex]);

  const handleSetComplete = (weight, reps) => {
    setSets(prevSets => {
      const newSets = [...prevSets];
      newSets[currentExerciseIndex] = [
        ...(newSets[currentExerciseIndex] || []),
        { weight, reps, completedAt: new Date().toISOString() }
      ];
      return newSets;
    });
    addNotification('Set completed!', 'success');
  };

  const isExerciseComplete = (index) => {
    return sets[index] && sets[index].length >= 3;
  };

  const handleExerciseChange = (newIndex) => {
    setCurrentExerciseIndex(newIndex);
  };

  const handleFinishWorkout = async () => {
    const endTime = new Date();
    const completedWorkout = {
      plan: currentPlan._id,
      planName: currentPlan.name,
      exercises: currentPlan.exercises.map((exercise, index) => ({
        exercise: exercise._id,
        sets: sets[index] || [],
        completedAt: sets[index] && sets[index].length > 0 
          ? sets[index][sets[index].length - 1].completedAt 
          : endTime.toISOString()
      })),
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString()
    };
    
    console.log('Completed workout:', JSON.stringify(completedWorkout, null, 2));
    
    try {
      await addWorkout(completedWorkout);
      addNotification('Workout completed and saved!', 'success');
      localStorage.removeItem('currentPlan');
      localStorage.removeItem('currentSets');
      localStorage.removeItem('currentExerciseIndex');
      localStorage.removeItem('workoutStartTime');
      navigate('/');
    } catch (error) {
      console.error('Error saving workout:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        console.error('Response headers:', error.response.headers);
      }
      addNotification('Failed to save workout. Please try again.', 'error');
    }
  };

  const renderCarouselIndicator = () => {
    if (!currentPlan) return null;

    return (
      <div className="flex justify-center items-center space-x-2 my-4">
        {currentPlan.exercises.map((_, index) => (
          <div
            key={index}
            className={`h-3 w-3 rounded-full cursor-pointer ${
              index === currentExerciseIndex ? 'bg-blue-500' : 'bg-gray-300'
            } ${
              isExerciseComplete(index) ? 'bg-green-500' : ''
            }`}
            title={`Exercise ${index + 1}: ${currentPlan.exercises[index].name}`}
            onClick={() => handleExerciseChange(index)}
          ></div>
        ))}
      </div>
    );
  };

  if (!currentPlan) {
    return <div>Loading workout plan...</div>;
  }

  const currentExercise = currentPlan.exercises[currentExerciseIndex];

  return (
    <div className="container mx-auto mt-8 relative">
      <h2 className="text-2xl font-bold mb-4">Workout Tracker</h2>
      <h3 className="text-xl mb-4">{currentPlan.name}</h3>
      
      {renderCarouselIndicator()}
      
      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <h4 className="text-lg font-semibold mb-2">Current Exercise: {currentExercise.name}</h4>
        <p className="text-sm text-gray-600 mb-2">Exercise {currentExerciseIndex + 1} of {currentPlan.exercises.length}</p>
        <div className="flex mb-4">
          <img 
            src={currentExercise.imageUrl} 
            alt={currentExercise.name} 
            className="w-1/3 h-auto object-cover rounded-lg mr-4"
          />
          <div>
            <p className="mb-2"><strong>Description:</strong> {currentExercise.description}</p>
            <p className="mb-2"><strong>Target Muscle:</strong> {currentExercise.target}</p>
            <p className="mb-2">
              <strong>Sets completed:</strong> {(sets[currentExerciseIndex] || []).length} / 3
              {isExerciseComplete(currentExerciseIndex) && ' (Complete)'}
            </p>
          </div>
        </div>
        <div className="mb-4">
          <input
            type="number"
            placeholder="Weight"
            id="weight"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mr-2 mb-2"
          />
          <input
            type="number"
            placeholder="Reps"
            id="reps"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-2"
          />
        </div>
        <button
          onClick={() => {
            const weight = document.getElementById('weight').value;
            const reps = document.getElementById('reps').value;
            if (weight && reps) {
              handleSetComplete(Number(weight), Number(reps));
              document.getElementById('weight').value = '';
              document.getElementById('reps').value = '';
            } else {
              addNotification('Please enter both weight and reps', 'error');
            }
          }}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mb-4"
        >
          Complete Set
        </button>
      </div>
      <div className="flex justify-between">
        <button
          onClick={() => handleExerciseChange(Math.max(0, currentExerciseIndex - 1))}
          className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mb-4"
        >
          Previous Exercise
        </button>
        {currentExerciseIndex < currentPlan.exercises.length - 1 ? (
          <button
            onClick={() => handleExerciseChange(currentExerciseIndex + 1)}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mb-4"
          >
            Next Exercise
          </button>
        ) : (
          <button
            onClick={handleFinishWorkout}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mb-4"
          >
            Finish Workout
          </button>
        )}
      </div>

      {/* Set Log */}
      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4">Set Log</h3>
        {currentPlan.exercises.map((exercise, index) => (
          <div key={exercise._id} className="mb-4">
            <h4 className="text-lg font-medium">{exercise.name}</h4>
            {sets[index] && sets[index].length > 0 ? (
              <ul className="list-disc pl-5">
                {sets[index].map((set, setIndex) => (
                  <li key={setIndex}>
                    Set {setIndex + 1}: {set.weight} lbs x {set.reps} reps
                  </li>
                ))}
              </ul>
            ) : (
              <p>No sets completed yet</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default WorkoutTracker;
```

# src/pages/WorkoutSummary.jsx

```jsx
// pages/WorkoutSummary.jsx

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGymContext } from '../context/GymContext';
import { useAuth } from '../context/AuthContext';

function WorkoutSummary() {
  const { workoutHistory, fetchWorkoutHistory } = useGymContext();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchWorkoutHistory();
    }
  }, [user, fetchWorkoutHistory]);

  const formatDuration = (start, end) => {
    if (!start || !end) return 'N/A';
    const duration = new Date(end) - new Date(start);
    const hours = Math.floor(duration / 3600000);
    const minutes = Math.floor((duration % 3600000) / 60000);
    return `${hours}h ${minutes}m`;
  };

  const formatTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  if (!user) {
    return <div className="container mx-auto mt-8">Please log in to view your workout history.</div>;
  }

  if (workoutHistory.length === 0) {
    return <div className="container mx-auto mt-8">No workout history available.</div>;
  }

  return (
    <div className="container mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-4">Workout History</h2>
      {workoutHistory.map((workout) => (
        <div key={workout._id} className="mb-8 p-4 border rounded shadow">
          <h3 className="text-xl mb-2">
            {workout.planName} {workout.planDeleted && <span className="text-red-500">(Deleted)</span>}
          </h3>
          <p className="mb-2">Date: {formatDate(workout.date || workout.startTime)}</p>
          <p className="mb-2">Start Time: {formatTime(workout.startTime)}</p>
          <p className="mb-2">End Time: {formatTime(workout.endTime)}</p>
          <p className="mb-4">Duration: {formatDuration(workout.startTime, workout.endTime)}</p>

          {workout.exercises.map((exercise, index) => (
            <div key={index} className="mb-4 p-3 bg-gray-100 rounded">
              <h4 className="text-lg font-medium">
                {exercise.exercise ? exercise.exercise.name : 'Deleted Exercise'}
              </h4>
              {exercise.completedAt && (
                <p className="text-sm text-gray-600">Completed at: {formatTime(exercise.completedAt)}</p>
              )}
              {exercise.sets && exercise.sets.length > 0 ? (
                <ul className="list-disc pl-5 mt-2">
                  {exercise.sets.map((set, setIndex) => (
                    <li key={setIndex} className="mb-1">
                      Set {setIndex + 1}: {set.weight} lbs x {set.reps} reps
                      {set.completedAt && (
                        <span className="text-sm text-gray-600 ml-2">
                          (at {formatTime(set.completedAt)})
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 italic">No sets completed</p>
              )}
            </div>
          ))}
        </div>
      ))}
      <button
        onClick={() => navigate('/')}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mt-4"
      >
        Back to Home
      </button>
    </div>
  );
}

export default WorkoutSummary;
```

# src/pages/WorkoutPlans.jsx

```jsx
// src/pages/WorkoutPlans.jsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGymContext } from '../context/GymContext';
import WorkoutPlanForm from '../components/WorkoutPlanForm';

function WorkoutPlans() {
  const { workoutPlans, deleteWorkoutPlan, addWorkoutPlan } = useGymContext();
  const [showForm, setShowForm] = useState(false);
  const [ongoingWorkout, setOngoingWorkout] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedPlan = localStorage.getItem('currentPlan');
    if (storedPlan) {
      setOngoingWorkout(JSON.parse(storedPlan));
    }
  }, []);

  const handleStartWorkout = (plan) => {
    localStorage.setItem('currentPlan', JSON.stringify(plan));
    navigate('/tracker');
  };

  const handleResumeWorkout = () => {
    navigate('/tracker');
  };

  const handleAddWorkoutPlan = async (plan) => {
    try {
      await addWorkoutPlan(plan);
      setShowForm(false);
    } catch (error) {
      console.error('Error adding workout plan:', error);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Workout Plans</h1>
      {ongoingWorkout && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4" role="alert">
          <p className="font-bold">Ongoing Workout</p>
          <p>You have an unfinished workout: {ongoingWorkout.name}</p>
          <button
            onClick={handleResumeWorkout}
            className="mt-2 bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded"
          >
            Resume Workout
          </button>
        </div>
      )}
      <button
        onClick={() => setShowForm(!showForm)}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
      >
        {showForm ? 'Hide Form' : 'Create New Plan'}
      </button>
      {showForm && <WorkoutPlanForm onSubmit={handleAddWorkoutPlan} />}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {workoutPlans.map((plan) => (
          <div key={plan._id} className="border rounded-lg p-4 mb-4 shadow-sm">
            <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
            <ul className="list-disc list-inside mb-4">
              {plan.exercises.map((exercise) => (
                <li key={exercise._id} className="mb-2">
                  <span className="font-medium">{exercise.name}</span>
                  <p className="text-sm text-gray-600 ml-4">{exercise.description}</p>
                  <p className="text-sm text-gray-500 ml-4">Target: {exercise.target}</p>
                </li>
              ))}
            </ul>
            <div className="flex justify-between">
              <button
                onClick={() => handleStartWorkout(plan)}
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 rounded"
              >
                Start Workout
              </button>
              <button
                onClick={() => deleteWorkoutPlan(plan._id)}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
              >
                Delete Plan
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default WorkoutPlans;
```

# src/pages/Home.jsx

```jsx
// src/pages/Home.jsx
function Home() {
  return (
    <div className="container mx-auto px-4">
      <h1 className="text-3xl font-bold text-center my-8">Welcome to Your Gym App</h1>
      <p className="text-center">This is where your fitness journey begins!</p>
    </div>
  );
}

export default Home;
```

# src/pages/ExerciseLibrary.jsx

```jsx
// src/pages/ExerciseLibrary.jsx

import { useState } from 'react';
import ExerciseItem from '../components/ExerciseItem';
import AddExerciseForm from '../components/AddExerciseForm';
import WorkoutPlanSelector from '../components/WorkoutPlanSelector';
import { useGymContext } from '../context/GymContext';
import { useNotification } from '../context/NotificationContext';

function ExerciseLibrary() {
  const { exercises, updateExercise, deleteExercise, addExerciseToPlan } = useGymContext();
  const { addNotification } = useNotification();
  const [editingExercise, setEditingExercise] = useState(null);
  const [showWorkoutPlanSelector, setShowWorkoutPlanSelector] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState(null);

  const handleEdit = (exercise) => {
    setEditingExercise(exercise);
  };

  const handleDelete = (id) => {
    deleteExercise(id);
  };

  const handleSave = (savedExercise) => {
    setEditingExercise(null);
  };

  const handleAddToPlan = (exercise) => {
    setSelectedExercise(exercise);
    setShowWorkoutPlanSelector(true);
  };

  const handleSelectWorkoutPlan = async (plan) => {
    if (!selectedExercise || !selectedExercise._id) {
      addNotification('No exercise selected', 'error');
      return;
    }
    
    console.log('Selected exercise:', selectedExercise);
    console.log('Selected plan:', plan);
    console.log(`Attempting to add exercise ${selectedExercise._id} to plan ${plan._id}`);
    
    const result = await addExerciseToPlan(plan._id, selectedExercise._id);
    
    if (result.success) {
      addNotification(`Exercise added to ${plan.name}`, 'success');
    } else if (result.alreadyInPlan) {
      // The notification is already handled in the GymContext
    } else {
      // The error notification is already handled in the GymContext
    }
    
    setShowWorkoutPlanSelector(false);
    setSelectedExercise(null);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Exercise Library</h1>
      <AddExerciseForm onSave={handleSave} initialExercise={editingExercise} />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {exercises.map((exercise) => (
          <ExerciseItem 
            key={exercise._id} 
            exercise={exercise}
            onEdit={() => handleEdit(exercise)}
            onDelete={() => handleDelete(exercise._id)}
            onAddToPlan={() => handleAddToPlan(exercise)}
          />
        ))}
      </div>
      {showWorkoutPlanSelector && (
        <WorkoutPlanSelector
          onSelect={handleSelectWorkoutPlan}
          onClose={() => setShowWorkoutPlanSelector(false)}
        />
      )}
    </div>
  );
}

export default ExerciseLibrary;
```

# src/context/NotificationContext.jsx

```jsx
// src/context/NotificationContext.jsx

import React, { createContext, useContext, useState } from 'react';

const NotificationContext = createContext();

export function useNotification() {
  return useContext(NotificationContext);
}

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);

  const addNotification = (message, type = 'info', duration = 5000) => {
    const id = Date.now() + Math.random(); // This should create a unique ID
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => removeNotification(id), duration);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, removeNotification }}>
      {children}
    </NotificationContext.Provider>
  );
}
```

# src/context/GymContext.jsx

```jsx
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

  const getAuthConfig = useCallback(() => {
    const token = localStorage.getItem('token');
    return {
      headers: { 'x-auth-token': token }
    };
  }, []);

  const toTitleCase = (str) => {
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
        target: toTitleCase(exercise.target)
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

  // Add a workout
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
      const response = await axios.post(`${API_URL}/workoutplans`, plan, getAuthConfig());
      const fullPlan = await axios.get(`${API_URL}/workoutplans/${response.data._id}`, getAuthConfig());
      setWorkoutPlans(prevPlans => [...prevPlans, fullPlan.data]);
      addNotification('Workout plan added successfully', 'success');
      return fullPlan.data;
    } catch (error) {
      console.error('Error adding workout plan:', error);
      addNotification('Failed to add workout plan', 'error');
      throw error;
    }
  };

  // Update a workout plan
  const updateWorkoutPlan = async (id, updatedPlan) => {
    try {
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
      setWorkoutHistory(prevHistory => 
        prevHistory.map(workout => 
          workout.plan && workout.plan._id === id 
            ? { ...workout, plan: null, planDeleted: true } 
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
    
    // Find the plan
    const plan = workoutPlans.find(p => p._id === planId);
    if (!plan) {
      console.error('Plan not found');
      addNotification('Plan not found', 'error');
      return { success: false, error: 'Plan not found' };
    }

    // Check if the exercise is already in the plan
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
      fetchWorkoutHistory,
      fetchWorkoutPlans,
      addExerciseToPlan
    }}>
      {children}
    </GymContext.Provider>
  );
}

export default GymProvider;
```

# src/context/AuthContext.jsx

```jsx
// src/context/AuthContext.jsx

import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { hostName } from './GymContext';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkLoggedIn = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await axios.get(`${hostName}:4500/api/auth/user`, {
            headers: { 'x-auth-token': token }
          });
          setUser(response.data);
        } catch (error) {
          console.error('Error fetching user:', error);
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };

    checkLoggedIn();
  }, []);

  const register = async (username, email, password) => {
    try {
      await axios.post(`${hostName}:4500/api/auth/register`, { username, email, password });
      return true;
    } catch (error) {
      console.error('Registration error:', error.response?.data || error.message);
      throw error;
    }
  };

  const login = async (username, password) => {
    try {
      const response = await axios.post(`${hostName}:4500/api/auth/login`, { username, password });
      localStorage.setItem('token', response.data.token);
      setUser(response.data.user);
      return response.data.user;
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const value = {
    user,
    register,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
```

# src/components/WorkoutPlanSelector.jsx

```jsx
// src/components/WorkoutPlanSelector.jsx

import React, { useState, useEffect } from 'react';
import { useGymContext } from '../context/GymContext';

function WorkoutPlanSelector({ onSelect, onClose }) {
  const [workoutPlans, setWorkoutPlans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { fetchWorkoutPlans } = useGymContext();

  useEffect(() => {
    const getWorkoutPlans = async () => {
      try {
        setIsLoading(true);
        const plans = await fetchWorkoutPlans();
        setWorkoutPlans(plans || []);
      } catch (error) {
        console.error('Error fetching workout plans:', error);
      } finally {
        setIsLoading(false);
      }
    };
    getWorkoutPlans();
  }, [fetchWorkoutPlans]);

  const handleSelect = async (plan) => {
    await onSelect(plan);
    onClose();
  };

  if (isLoading) {
    return <div>Loading workout plans...</div>;
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
      <div className="bg-white p-5 rounded-lg shadow-xl max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">Select Workout Plan</h2>
        {workoutPlans.length === 0 ? (
          <p>No workout plans available. Create a plan first.</p>
        ) : (
          workoutPlans.map((plan) => (
            <button
              key={plan._id}
              onClick={() => handleSelect(plan)}
              className="block w-full text-left p-2 hover:bg-gray-100 rounded mb-2"
            >
              {plan.name}
            </button>
          ))
        )}
        <button
          onClick={onClose}
          className="mt-4 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export default WorkoutPlanSelector;
```

# src/components/WorkoutPlanForm.jsx

```jsx
// src/components/WorkoutPlanForm.jsx

import { useState } from 'react';
import { useGymContext } from '../context/GymContext';

function WorkoutPlanForm({ onSubmit }) {
  const [planName, setPlanName] = useState('');
  const [selectedExercises, setSelectedExercises] = useState([]);
  const { exercises } = useGymContext();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const workoutPlan = {
        name: planName,
        exercises: selectedExercises.map(exerciseId => 
          exercises.find(exercise => exercise._id === exerciseId)
        ),
      };
      await onSubmit(workoutPlan);
      // Reset form
      setPlanName('');
      setSelectedExercises([]);
    } catch (error) {
      console.error('Error submitting workout plan:', error);
    }
  };
  
  const handleExerciseToggle = (exerciseId) => {
    setSelectedExercises(prevSelected =>
      prevSelected.includes(exerciseId)
        ? prevSelected.filter(id => id !== exerciseId)
        : [...prevSelected, exerciseId]
    );
  };   

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto mt-8">
      <div className="mb-4">
        <label htmlFor="planName" className="block text-gray-700 font-bold mb-2">
          Workout Plan Name
        </label>
        <input
          type="text"
          id="planName"
          value={planName}
          onChange={(e) => setPlanName(e.target.value)}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          required
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 font-bold mb-2">
          Select Exercises
        </label>
        {exercises.map((exercise) => (
          <div key={exercise._id} className="flex items-center mb-2">
            <input
              type="checkbox"
              id={`exercise-${exercise._id}`}
              checked={selectedExercises.includes(exercise._id)}
              onChange={() => handleExerciseToggle(exercise._id)}
              className="mr-2"
            />
            <label htmlFor={`exercise-${exercise._id}`}>{exercise.name}</label>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between">
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Create Workout Plan
        </button>
      </div>
    </form>
  );
}

export default WorkoutPlanForm;
```

# src/components/WorkoutForm.jsx

```jsx
// src/components/WorkoutForm.jsx
import { useState, useEffect } from 'react';
import { useGymContext } from '../context/GymContext';

function WorkoutForm({ onSave, initialWorkout }) {
  const [selectedExercise, setSelectedExercise] = useState('');
  const [sets, setSets] = useState('');
  const [reps, setReps] = useState('');
  const [weight, setWeight] = useState('');
  const { exercises } = useGymContext();

  useEffect(() => {
    if (initialWorkout) {
      setSelectedExercise(initialWorkout.exercise);
      setSets(initialWorkout.sets.toString());
      setReps(initialWorkout.reps.toString());
      setWeight(initialWorkout.weight.toString());
    }
  }, [initialWorkout]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const workout = {
      exercise: selectedExercise,
      sets: parseInt(sets),
      reps: parseInt(reps),
      weight: parseFloat(weight),
      date: new Date().toISOString()
    };
    onSave(workout);
    // Reset form
    setSelectedExercise('');
    setSets('');
    setReps('');
    setWeight('');
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto mt-8">
      <div className="mb-4">
        <label htmlFor="exercise" className="block text-gray-700 font-bold mb-2">
          Exercise
        </label>
        <select
          id="exercise"
          value={selectedExercise}
          onChange={(e) => setSelectedExercise(e.target.value)}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          required
        >
          <option value="">Select an exercise</option>
          {exercises.map((exercise) => (
            <option key={exercise._id} value={exercise.name}>
              {exercise.name}
            </option>
          ))}
        </select>
      </div>
      <div className="mb-4">
        <label htmlFor="sets" className="block text-gray-700 font-bold mb-2">
          Sets
        </label>
        <input
          type="number"
          id="sets"
          value={sets}
          onChange={(e) => setSets(e.target.value)}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          required
        />
      </div>
      <div className="mb-4">
        <label htmlFor="reps" className="block text-gray-700 font-bold mb-2">
          Reps
        </label>
        <input
          type="number"
          id="reps"
          value={reps}
          onChange={(e) => setReps(e.target.value)}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          required
        />
      </div>
      <div className="mb-6">
        <label htmlFor="weight" className="block text-gray-700 font-bold mb-2">
          Weight (kg)
        </label>
        <input
          type="number"
          id="weight"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          step="0.1"
          required
        />
      </div>
      <div className="flex items-center justify-between">
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          {initialWorkout ? 'Update Workout' : 'Log Workout'}
        </button>
      </div>
    </form>
  );
}

export default WorkoutForm;
```

# src/components/Register.jsx

```jsx
// src/components/Register.jsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(username, email, password);
      navigate('/login');
    } catch (error) {
      console.error('Registration failed:', error);
      // Handle error (e.g., show error message to user)
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto mt-8">
      <div className="mb-4">
        <label htmlFor="username" className="block text-gray-700 font-bold mb-2">Username</label>
        <input
          type="text"
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          required
        />
      </div>
      <div className="mb-4">
        <label htmlFor="email" className="block text-gray-700 font-bold mb-2">Email</label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          required
        />
      </div>
      <div className="mb-6">
        <label htmlFor="password" className="block text-gray-700 font-bold mb-2">Password</label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          required
        />
      </div>
      <div className="flex items-center justify-between">
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Register
        </button>
      </div>
    </form>
  );
}

export default Register;
```

# src/components/NotificationToast.jsx

```jsx
// src/components/NotificationToast.jsx

import React from 'react';
import { useNotification } from '../context/NotificationContext';

function NotificationToast() {
  const { notifications, removeNotification } = useNotification();

  return (
    <div className="fixed top-4 right-4 z-50">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`mb-2 p-4 rounded shadow-md ${
            notification.type === 'error' ? 'bg-red-500' : 
            notification.type === 'success' ? 'bg-green-500' : 
            notification.type === 'info' ? 'bg-blue-500' : 'bg-yellow-500'
          } text-white`}
        >
          {notification.message}
          <button
            onClick={() => removeNotification(notification.id)}
            className="ml-2 text-white font-bold"
          >
            &times;
          </button>
        </div>
      ))}
    </div>
  );
}

export default NotificationToast;
```

# src/components/Login.jsx

```jsx
// src/components/Login.jsx

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const { addNotification } = useNotification();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(username, password);
      addNotification('Logged in successfully', 'success');
      navigate('/'); // Redirect to home page after successful login
    } catch (err) {
      addNotification('Failed to log in', 'error');
      console.error(err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto mt-8">
      <div className="mb-4">
        <label htmlFor="username" className="block text-gray-700 font-bold mb-2">
          Username
        </label>
        <input
          type="text"
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          required
          autoComplete="username"
        />
      </div>
      <div className="mb-6">
        <label htmlFor="password" className="block text-gray-700 font-bold mb-2">
          Password
        </label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          required
          autoComplete="current-password"
        />
      </div>
      <div className="flex items-center justify-between">
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Log In
        </button>
      </div>
    </form>
  );
}

export default Login;
```

# src/components/Header.jsx

```jsx
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Header() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    // You might want to redirect to the login page after logout
    // If you're using react-router-dom v6, you can use the useNavigate hook for this
  };

  return (
    <header className="bg-blue-600 text-white p-4">
      <nav className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold">Gym App</Link>
        <ul className="flex space-x-4 items-center">
          {user ? (
            <>
              <li><Link to="/tracker">Workout Tracker</Link></li>
              <li><Link to="/exercises">Exercise Library</Link></li>
              <li><Link to="/plans">Workout Plans</Link></li>
              <li><Link to="/workout-summary">Workout History</Link></li>
              <li>
                <button 
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                >
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link 
                  to="/login"
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                  Login
                </Link>
              </li>
              <li>
                <Link 
                  to="/register"
                  className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                >
                  Register
                </Link>
              </li>
            </>
          )}
        </ul>
      </nav>
    </header>
  );
}

export default Header;
```

# src/components/Footer.jsx

```jsx
// src/components/Footer.jsx
function Footer() {
  return (
    <footer className="bg-gray-200 p-4 mt-8">
      <div className="container mx-auto text-center">
        <p>&copy; 2024 Gym App. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;
```

# src/components/ExerciseItem.jsx

```jsx
// src/components/ExerciseItem.jsx

import React from 'react';

function ExerciseItem({ exercise, onEdit, onDelete, onAddToPlan }) {
  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <img 
        src={exercise.imageUrl} 
        alt={exercise.name} 
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <h3 className="font-bold text-xl mb-2">{exercise.name}</h3>
        <p className="text-gray-700 text-base mb-2">{exercise.description}</p>
        <p className="text-gray-600 text-sm mb-4">Target: {exercise.target}</p>
        <div className="flex justify-between">
          <button 
            onClick={() => onEdit(exercise)} 
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Edit
          </button>
          <button 
            onClick={() => onDelete(exercise._id)} 
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          >
            Delete
          </button>
          <button 
            onClick={() => onAddToPlan(exercise)} 
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          >
            Add to Plan
          </button>
        </div>
      </div>
    </div>
  );
}

export default ExerciseItem;
```

# src/components/AddExerciseForm.jsx

```jsx
// src/components/AddExerciseForm.jsx

import { useState, useEffect } from 'react';
import { useGymContext } from '../context/GymContext';
import { useNotification } from '../context/NotificationContext';

function AddExerciseForm({ onSave, initialExercise }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [target, setTarget] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addExercise, updateExercise } = useGymContext();
  const { addNotification } = useNotification();

  useEffect(() => {
    if (initialExercise) {
      setName(initialExercise.name);
      setDescription(initialExercise.description);
      setTarget(initialExercise.target);
      setImageUrl(initialExercise.imageUrl);
    } else {
      setName('');
      setDescription('');
      setTarget('');
      setImageUrl('');
    }
  }, [initialExercise]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    const exercise = { name, description, target, imageUrl };
    try {
      let savedExercise;
      if (initialExercise) {
        savedExercise = await updateExercise(initialExercise._id, exercise);
        addNotification('Exercise updated successfully', 'success');
      } else {
        savedExercise = await addExercise(exercise);
        addNotification('Exercise added successfully', 'success');
      }
      // Reset form
      setName('');
      setDescription('');
      setTarget('');
      setImageUrl('');
      // Call onSave with the saved exercise from the server
      onSave(savedExercise);
    } catch (error) {
      addNotification('Failed to save exercise', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
      <h2 className="text-2xl font-bold mb-4">
        {initialExercise ? 'Edit Exercise' : 'Add New Exercise'}
      </h2>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
          Exercise Name
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="name"
          type="text"
          placeholder="Exercise Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
          Description
        </label>
        <textarea
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="description"
          placeholder="Exercise Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="target">
          Target Muscle Group
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="target"
          type="text"
          placeholder="Target Muscle Group"
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          required
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="imageUrl">
          Image URL
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="imageUrl"
          type="text"
          placeholder="Image URL"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
        />
      </div>
      <div className="flex items-center justify-between">
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          type="submit"
        >
          {initialExercise ? 'Update Exercise' : 'Add Exercise'}
        </button>
      </div>
    </form>
  );
}

export default AddExerciseForm;
```

# src/assets/react.svg

This is a file of the type: SVG Image

