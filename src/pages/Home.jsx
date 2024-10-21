// src/pages/Home.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useGymContext } from '../context/GymContext';
import { FiActivity } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import AppGuideModal from '../components/AppGuideModal';

function Home() {
  const { t } = useTranslation();
  const [ongoingWorkout, setOngoingWorkout] = useState(null);
  const [showGuide, setShowGuide] = useState(false);
  const { user, updateUser } = useAuth();
  const { loadProgress, showToast } = useGymContext();

  const fetchWorkoutPlan = useCallback(async () => {
    if (user) {
      try {
        const serverProgress = await loadProgress();
        
        if (serverProgress && serverProgress.plan) {
          setOngoingWorkout(serverProgress.plan);
          localStorage.setItem(`currentPlan_${user.id}`, JSON.stringify(serverProgress.plan));
        } else {
          const storedPlan = localStorage.getItem(`currentPlan_${user.id}`);
          if (storedPlan) {
            setOngoingWorkout(JSON.parse(storedPlan));
          }
        }
      } catch (error) {
        console.error('Error fetching workout plan:', error);
        showToast('error', 'Error', t("Failed to load workout plan"));
      }
    }
  }, [user, loadProgress, showToast, t]);

  useEffect(() => {
    fetchWorkoutPlan();

    if (user && user.hasSeenGuide === false) {
      setShowGuide(true);
    }
  }, [user, fetchWorkoutPlan]);

  const handleCloseGuide = async () => {
    try {
      const updatedUser = await updateUser({ hasSeenGuide: true });
      if (updatedUser && updatedUser.hasSeenGuide) {
        setShowGuide(false);
        showToast('success', 'Success', t("Guide preferences updated"));
      } else {
        throw new Error('Failed to update hasSeenGuide status');
      }
    } catch (error) {
      console.error('Failed to update user:', error);
      showToast('error', 'Error', t("Failed to update user preferences"));
    }
  };

  return (
    <div className="text-gray-900 dark:text-gray-100 p-6">
      <h1 data-aos="fade-up" className="text-3xl font-bold text-center my-8">
        {t("Welcome")} <span className="text-emerald-500">{user ? user.username : t("Guest")}</span> {t("to Level Up")}
      </h1>
      <p className="text-center mb-8">{t("This is where your fitness journey begins")}!</p>

      {ongoingWorkout ? (
        <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 transition-all duration-300 hover:shadow-xl mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-gray-800 dark:bg-gray-700 text-white mr-4">
                <FiActivity className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t("Ongoing Workout")}</p>
                <p className="text-2xl font-semibold text-gray-700 dark:text-gray-200">{ongoingWorkout.name}</p>
              </div>
            </div>
          </div>
          <Link 
            to="/tracker" 
            className="nav-btn mt-4 inline-block w-full text-center  font-bold py-2 px-4 rounded transition-colors duration-300"
          >
            {t("Resume Workout")}
          </Link>
        </div>
      ) : (
        <div className="flex flex-col items-center space-y-4">
          <Link 
            to="/plans" 
            className="nav-btn w-full sm:w-auto text-center  font-bold py-2 px-4 rounded"
          >
            {t("Start a New Workout")}
          </Link>
          <Link 
            to="/exercises" 
            className="nav-btn w-full sm:w-auto text-center font-bold py-2 px-4 rounded"
          >
            {t("Explore Exercises")}
          </Link>
        </div>
      )}
      <AppGuideModal isOpen={showGuide} onClose={handleCloseGuide} />
    </div>
  );
}

export default Home;