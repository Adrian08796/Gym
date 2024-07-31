// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import WorkoutTracker from './pages/WorkoutTracker';
import ExerciseLibrary from './pages/ExerciseLibrary';
import WorkoutPlans from './pages/WorkoutPlans';
import Header from './components/Header';
import Footer from './components/Footer';
import { GymProvider } from './context/GymContext';

function App() {
  return (
    <GymProvider>
      <Router>
        <div className="App flex flex-col min-h-screen">
          <Header />
          <main className="flex-grow container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/tracker" element={<WorkoutTracker />} />
              <Route path="/exercises" element={<ExerciseLibrary />} />
              <Route path="/plans" element={<WorkoutPlans />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </GymProvider>
  );
}

export default App;