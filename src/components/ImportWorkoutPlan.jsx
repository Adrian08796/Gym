import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useGymContext } from '../context/GymContext';
import { useNotification } from '../context/NotificationContext';

function ImportWorkoutPlan() {
  const { shareId } = useParams();
  const [isImporting, setIsImporting] = useState(false);
  const { importWorkoutPlan } = useGymContext();
  const { addNotification } = useNotification();
  const navigate = useNavigate();

  const handleImport = async () => {
    setIsImporting(true);
    try {
      await importWorkoutPlan(shareId);
      addNotification('Workout plan imported successfully', 'success');
      navigate('/plans');
    } catch (error) {
      addNotification('Failed to import workout plan', 'error');
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
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          {isImporting ? 'Importing...' : 'Import Plan'}
        </button>
      </div>
    </div>
  );
}

export default ImportWorkoutPlan;