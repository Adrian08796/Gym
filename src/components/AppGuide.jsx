import React from 'react';
import { useTranslation } from 'react-i18next';

function AppGuide() {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">{t("Welcome to Level Up")}</h1>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">{t("Getting Started")}</h2>
        <p className="mb-4">{t("Level Up is your personal fitness companion. Here's how to get started:")}</p>
        <ol className="list-decimal list-inside">
          <li className="mb-2">{t("Create a workout plan or choose from our default plans")}</li>
          <li className="mb-2">{t("Add exercises to your plan from our extensive library")}</li>
          <li className="mb-2">{t("Start your workout and track your progress")}</li>
          <li className="mb-2">{t("View your workout history and see your improvements")}</li>
        </ol>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">{t("Key Features")}</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-xl font-medium mb-2">{t("Workout Plans")}</h3>
            <p>{t("Create custom workout plans or use our pre-made ones.")}</p>
            <img src="/images/workout-plans.png" alt={t("Workout Plans Screenshot")} className="mt-2 rounded-lg shadow-md" />
          </div>
          <div>
            <h3 className="text-xl font-medium mb-2">{t("Exercise Library")}</h3>
            <p>{t("Browse our extensive library of exercises with detailed instructions.")}</p>
            <img src="/images/exercise-library.png" alt={t("Exercise Library Screenshot")} className="mt-2 rounded-lg shadow-md" />
          </div>
          <div>
            <h3 className="text-xl font-medium mb-2">{t("Workout Tracker")}</h3>
            <p>{t("Track your workouts in real-time and log your progress.")}</p>
            <img src="/images/workout-tracker.png" alt={t("Workout Tracker Screenshot")} className="mt-2 rounded-lg shadow-md" />
          </div>
          <div>
            <h3 className="text-xl font-medium mb-2">{t("Progress Dashboard")}</h3>
            <p>{t("View your workout history and track your improvements over time.")}</p>
            <img src="/images/progress-dashboard.png" alt={t("Progress Dashboard Screenshot")} className="mt-2 rounded-lg shadow-md" />
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">{t("Tips for Success")}</h2>
        <ul className="list-disc list-inside">
          <li className="mb-2">{t("Consistency is key - try to stick to your workout schedule")}</li>
          <li className="mb-2">{t("Track your progress regularly to stay motivated")}</li>
          <li className="mb-2">{t("Don't hesitate to modify exercises or plans to suit your needs")}</li>
          <li className="mb-2">{t("Stay hydrated and maintain a balanced diet for best results")}</li>
        </ul>
      </section>
    </div>
  );
}

export default AppGuide;