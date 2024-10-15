// src/App.jsx

import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';
import Home from './pages/Home';
import WorkoutTracker from './pages/WorkoutTracker';
import ExerciseLibrary from './pages/ExerciseLibrary';
import WorkoutPlans from './pages/WorkoutPlans';
import WorkoutSummary from './pages/WorkoutSummary';
import IndividualWorkoutSummary from './components/IndividualWorkoutSummary';
import WorkoutPlanDetails from './components/WorkoutPlanDetails';
import Header from './components/Header';
import Footer from './components/Footer';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import ImportWorkoutPlan from './components/ImportWorkoutPlan';
import { AuthProvider, useAuth } from './context/AuthContext';
import { GymProvider } from './context/GymContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { Toast } from 'primereact/toast';
import { useRef } from 'react';
import UserProfile from './components/UserProfile';
import { ConfirmDialog } from 'primereact/confirmdialog';
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import '../src/components/ConfirmDialog.css';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return <div>Loading...</div>;
  }
  return user ? children : <Navigate to="/login" />;
};

function AppContent() {
  const { user, loading, updateActivity } = useAuth();
  const { darkMode } = useTheme();
  const authContext = useAuth();
  const toast = useRef(null);
  
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
    });

    window.authContext = authContext;

    const handleActivity = () => {
      if (typeof updateActivity === 'function') {
        updateActivity();
      }
    };

    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('click', handleActivity);
    window.addEventListener('scroll', handleActivity);

    return () => {
      delete window.authContext;
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('click', handleActivity);
      window.removeEventListener('scroll', handleActivity);
    };
  }, [authContext, updateActivity]);

  useEffect(() => {
    AOS.refresh();
  });

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className={`App min-h-screen flex flex-col ${darkMode ? 'dark' : ''}`}>
      <Header />
      <main className="flex-grow bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <div className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
            <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />
            <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
            <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/tracker" element={<PrivateRoute><WorkoutTracker /></PrivateRoute>} />
            <Route path="/exercises" element={<PrivateRoute><ExerciseLibrary /></PrivateRoute>} />
            <Route path="/plans" element={<PrivateRoute><WorkoutPlans /></PrivateRoute>} />
            <Route path="/plans/:id" element={<PrivateRoute><WorkoutPlanDetails /></PrivateRoute>} />
            <Route path="/workout-summary" element={<PrivateRoute><WorkoutSummary /></PrivateRoute>} />
            <Route path="/workout-summary/:id" element={<PrivateRoute><IndividualWorkoutSummary /></PrivateRoute>} />
            <Route path="/profile" element={<PrivateRoute><UserProfile /></PrivateRoute>} />
            <Route path="/import/:shareId" element={<PrivateRoute><ImportWorkoutPlan /></PrivateRoute>} />
          </Routes>
        </div>
      </main>
      <Footer />
      <Toast ref={toast} />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <GymProvider>
          <ThemeProvider>
            <AppContent />
            <ConfirmDialog className="custom-confirm-dialog" />
          </ThemeProvider>       
        </GymProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;