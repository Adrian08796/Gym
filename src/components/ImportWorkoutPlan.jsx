// src/ImportWorkoutPlan.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useGymContext } from '../context/GymContext';
import { useTranslation } from 'react-i18next';

function ImportWorkoutPlan() {
  const { t } = useTranslation();
  const { shareId } = useParams();
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState(null);
  const { importWorkoutPlan, fetchExercises, showToast } = useGymContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (!shareId) {
      setError('Invalid share link. Please check the URL and try again.');
    }
  }, [shareId]);

  const handleImport = async () => {
    if (isImporting) return;
    
    setIsImporting(true);
    setError(null);
    
    try {
      const result = await importWorkoutPlan(shareId);
      await fetchExercises(); // Fetch exercises after successful import
      
      if (result.alreadyImported) {
        showToast('info', 'Already Imported', t("This workout plan has already been imported."));
      } else {
        showToast('success', 'Success', t("Workout plan imported successfully"));
      }
      
      navigate('/plans');
    } catch (error) {
      console.error('Import error:', error);
      if (error.message === 'Shared workout plan not found') {
        setError('The shared workout plan is no longer available. It may have been deleted by the owner.');
        showToast('error', 'Import Failed', t("The shared workout plan is no longer available."));
      } else {
        setError('An error occurred while importing the workout plan. Please try again.');
        showToast('error', 'Import Failed', t("An error occurred while importing the workout plan."));
      }
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">{t("Import Shared Workout Plan")}</h2>
        {error ? (
          <p className="text-red-500 mb-4">{error}</p>
        ) : (
          <p className="mb-4">{t("You're about to import a shared workout plan. This will add the plan and its exercises to your library")}.</p>
        )}
        <button
          onClick={handleImport}
          disabled={isImporting || error}
          className={`w-full bg-emerald-500 text-white hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700 hover:shadow-md font-bold py-2 px-4 rounded ${
            (isImporting || error) ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isImporting ? 'Importing...' : 'Import Plan'}
        </button>
        {error && (
          <button
            onClick={() => navigate('/plans')}
            className="w-full mt-4 bg-gray-300 text-gray-700 hover:bg-gray-400 font-bold py-2 px-4 rounded"
          >
            {t("Go Back to Plans")}
          </button>
        )}
      </div>
    </div>
  );
}

export default ImportWorkoutPlan;