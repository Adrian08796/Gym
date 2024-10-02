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
      const result = await importWorkoutPlan(shareId);
      await fetchExercises(); // Fetch exercises after successful import
      
      if (result.alreadyImported) {
        showToast('warn', 'Already Imported', 'This workout plan has already been imported.');
      } else {
        showToast('success', 'Success', 'Workout plan imported successfully');
      }
      
      navigate('/plans');
    } catch (error) {
      if (error.message === 'Shared workout plan not found') {
        showToast('error', 'Import Failed', 'The shared workout plan is no longer available. It may have been deleted by the owner.');
      } else {
        showToast('error', 'Import Failed', 'An error occurred while importing the workout plan. Please try again.');
      }
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