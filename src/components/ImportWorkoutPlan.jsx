// src/components/ImportWorkoutPlan.jsx

import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useGymContext } from '../context/GymContext';

function ImportWorkoutPlan() {
  const { shareId } = useParams();
  const [isImporting, setIsImporting] = useState(false);
  const { importWorkoutPlan, fetchExercises, showToast } = useGymContext();
  const navigate = useNavigate();

  const handleImport = async () => {
    setIsImporting(true);
    try {
      await importWorkoutPlan(shareId);
      await fetchExercises(); // Fetch exercises after successful import
      showToast('success', 'Success', 'Workout plan imported successfully');
      navigate('/plans');
    } catch (error) {
      showToast('error', 'Error', 'Failed to import workout plan');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">Import Shared Workout Plan</h2>
        <p className="mb-4">You're about to import a shared workout plan. This will add the plan and its exercises to your library.</p>
        <button
          onClick={handleImport}
          disabled={isImporting}
          className="bg-emerald-500 text-white hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700 hover:shadow-md font-bold py-2 px-4 rounded"
        >
          {isImporting ? 'Importing...' : 'Import Plan'}
        </button>
      </div>
    </div>
  );
}

export default ImportWorkoutPlan;