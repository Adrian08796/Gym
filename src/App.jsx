import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import WorkoutTracker from './pages/WorkoutTracker';
import ExerciseLibrary from './pages/ExerciseLibrary';
import WorkoutPlans from './pages/WorkoutPlans';
import WorkoutSummary from './pages/WorkoutSummary'; // Import the new WorkoutSummary component
import Header from './components/Header';
import Footer from './components/Footer';
import Login from './components/Login';
import Register from './components/Register';
import { AuthProvider, useAuth } from './context/AuthContext';
import { GymProvider } from './context/GymContext';

const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
};

function AppContent() {
  return (
    <Router>
      <div className="App flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
            <Route path="/tracker" element={<PrivateRoute><WorkoutTracker /></PrivateRoute>} />
            <Route path="/exercises" element={<PrivateRoute><ExerciseLibrary /></PrivateRoute>} />
            <Route path="/plans" element={<PrivateRoute><WorkoutPlans /></PrivateRoute>} />
            <Route path="/workout-summary" element={<PrivateRoute><WorkoutSummary /></PrivateRoute>} /> {/* Add this new route */}
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <GymProvider>
        <AppContent />
      </GymProvider>
    </AuthProvider>
  );
}

export default App;