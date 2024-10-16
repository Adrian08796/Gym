// src/pages/Home.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useGymContext } from '../context/GymContext';
import { FiActivity } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';

function Home() {
  const { t } = useTranslation();
  const [ongoingWorkout, setOngoingWorkout] = useState(null);
  const { user } = useAuth();
  const { loadProgress } = useGymContext();

  useEffect(() => {
    const fetchWorkoutPlan = async () => {
      if (user) {
        try {
          // First, try to load progress from the server
          const serverProgress = await loadProgress();
          
          if (serverProgress && serverProgress.plan) {
            setOngoingWorkout(serverProgress.plan);
            localStorage.setItem(`currentPlan_${user.id}`, JSON.stringify(serverProgress.plan));
          } else {
            // If no server data, check localStorage
            const storedPlan = localStorage.getItem(`currentPlan_${user.id}`);
            if (storedPlan) {
              setOngoingWorkout(JSON.parse(storedPlan));
            } else {
              // If no localStorage data, make a separate API call
              const response = await fetch(`/api/workoutPlan/${user.id}`);
              if (response.ok) {
                const data = await response.json();
                setOngoingWorkout(data);
                localStorage.setItem(`currentPlan_${user.id}`, JSON.stringify(data));
              } else {
                console.error('Failed to fetch workout plan from server');
              }
            }
          }
        } catch (error) {
          console.error('Error fetching workout plan:', error);
        }
      }
    };

    fetchWorkoutPlan();
  }, [user, loadProgress]);

  return (
    <div className="text-gray-900 dark:text-gray-100 p-6">
      <h1 data-aos="fade-up" className="text-3xl font-bold text-center my-8">
        {t("Welcome")} <span className="text-emerald-500">{user ? user.username : "Guest"}</span> {t("to Your Gym App")}
      </h1>
      <p className="text-center mb-8">{t("This is where your fitness journey begins")}!</p>

      {ongoingWorkout && (
        <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 transition-all duration-300 hover:shadow-xl mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-#111827 text-white mr-4">
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
            className="mt-4 inline-block bg-emerald-500 text-white hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700 font-bold py-2 px-4 rounded transition-colors duration-300"
          >
            {t("Resume Workout")}
          </Link>
        </div>
      )}
    </div>
  );
}

export default Home;