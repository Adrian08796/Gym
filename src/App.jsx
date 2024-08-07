// src/App.jsx

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import WorkoutTracker from './pages/WorkoutTracker';
import ExerciseLibrary from './pages/ExerciseLibrary';
import WorkoutPlans from './pages/WorkoutPlans';
import WorkoutSummary from './pages/WorkoutSummary';
import IndividualWorkoutSummary from './components/IndividualWorkoutSummary';
import Header from './components/Header';
import Footer from './components/Footer';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import WorkoutCalendar from './components/WorkoutCalendar';
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
            <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/calendar" element={<PrivateRoute><WorkoutCalendar /></PrivateRoute>} />
            <Route path="/tracker" element={<PrivateRoute><WorkoutTracker /></PrivateRoute>} />
            <Route path="/exercises" element={<PrivateRoute><ExerciseLibrary /></PrivateRoute>} />
            <Route path="/plans" element={<PrivateRoute><WorkoutPlans /></PrivateRoute>} />
            <Route path="/workout-summary" element={<PrivateRoute><WorkoutSummary /></PrivateRoute>} />
            <Route path="/workout-summary/:id" element={<PrivateRoute><IndividualWorkoutSummary /></PrivateRoute>} />
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