import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
import { AuthProvider, useAuth } from './context/AuthContext';
import { GymProvider } from './context/GymContext';
import { NotificationProvider } from './context/NotificationContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import NotificationToast from './components/NotificationToast';
import ErrorBoundary from './components/ErrorBoundary';
import axiosInstance from './utils/axiosConfig';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return <div>Loading...</div>;
  }
  return user ? children : <Navigate to="/login" />;
};

function AppContent() {
  const { user, loading } = useAuth();
  const { darkMode } = useTheme();
  const authContext = useAuth();
  
  useEffect(() => {
    window.authContext = authContext;
    return () => {
      delete window.authContext;
    };
  }, [authContext]);

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
            <Route path="/tracker" element={
              <PrivateRoute>
                <ErrorBoundary>
                  <WorkoutTracker />
                </ErrorBoundary>
              </PrivateRoute>
            } />
            <Route path="/exercises" element={<PrivateRoute><ExerciseLibrary /></PrivateRoute>} />
            <Route path="/plans" element={<PrivateRoute><WorkoutPlans /></PrivateRoute>} />
            <Route path="/plans/:id" element={<PrivateRoute><WorkoutPlanDetails /></PrivateRoute>} />
            <Route path="/workout-summary" element={<PrivateRoute><WorkoutSummary /></PrivateRoute>} />
            <Route path="/workout-summary/:id" element={<PrivateRoute><IndividualWorkoutSummary /></PrivateRoute>} />
          </Routes>
        </div>
      </main>
      <Footer />
      <NotificationToast />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <NotificationProvider>
          <GymProvider>
            <ThemeProvider>
              <AppContent />
            </ThemeProvider>
          </GymProvider>
        </NotificationProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;