// src/pages/WorkoutPlans.jsx

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGymContext } from '../context/GymContext';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import WorkoutPlanForm from '../components/WorkoutPlanForm';
import WorkoutPlanCard from '../components/WorkoutPlanCard';
import WorkoutPlanModal from '../components/WorkoutPlanModal';
import { useTranslation } from 'react-i18next';

function WorkoutPlans() {
  const { t } = useTranslation();
  const { 
    workoutPlans, 
    deleteWorkoutPlan, 
    addWorkoutPlan, 
    updateWorkoutPlan, 
    fetchWorkoutPlans,
    importWorkoutPlan,
    getExerciseById,
    showToast,
  } = useGymContext();
  const [showForm, setShowForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [ongoingWorkout, setOngoingWorkout] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [importLink, setImportLink] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const { user } = useAuth();
  const formRef = useRef(null);

  useEffect(() => {
    const storedPlan = localStorage.getItem('currentPlan');
    if (storedPlan) {
      setOngoingWorkout(JSON.parse(storedPlan));
    }
  }, []);

  useEffect(() => {
    fetchWorkoutPlans();
  }, [fetchWorkoutPlans]);

  const handleStartWorkout = (plan) => {
    const planToSave = {
      _id: plan._id,
      name: plan.name,
      exercises: plan.exercises.map(exercise => ({
        _id: exercise._id,
        name: exercise.name,
        description: exercise.description,
        category: exercise.category,
        target: exercise.target,
        imageUrl: exercise.imageUrl
      }))
    };
    localStorage.setItem(`currentPlan_${user.id}`, JSON.stringify(planToSave));
    navigate('/tracker');
  };

  const handleResumeWorkout = () => {
    navigate('/tracker');
  };

  const handleAddWorkoutPlan = async (plan) => {
    try {
      const fullExercises = await Promise.all(plan.exercises.map(async exerciseOrId => {
        if (typeof exerciseOrId === 'string') {
          return await getExerciseById(exerciseOrId);
        }
        return exerciseOrId;
      }));
      
      const validExercises = fullExercises.filter(Boolean);
      
      if (validExercises.length !== plan.exercises.length) {
        showToast('warn', 'Warning', t("Some exercises could not be found. The plan will be created with available exercises."));
      }

      const newPlan = { ...plan, exercises: validExercises };
      await addWorkoutPlan(newPlan);
      handleCancelForm();
      await fetchWorkoutPlans();
      showToast('success', 'Success', t("Workout plan added successfully"));
    } catch (error) {
      console.error('Error adding workout plan:', error);
      showToast('error', 'Error', t("Failed to add workout plan"));
    }
  };

  const handleEditWorkoutPlan = async (plan) => {
    try {
      const fullExercises = await Promise.all(plan.exercises.map(async exerciseOrId => {
        if (typeof exerciseOrId === 'string') {
          return await getExerciseById(exerciseOrId);
        }
        return exerciseOrId;
      }));
      
      const validExercises = fullExercises.filter(Boolean);
      
      if (validExercises.length !== plan.exercises.length) {
        showToast('warn', 'Warning', t("Some exercises could not be found. The plan will be updated with available exercises."));
      }

      const updatedPlan = { ...plan, exercises: validExercises };
      await updateWorkoutPlan(plan._id, updatedPlan);
      handleCancelForm();
      await fetchWorkoutPlans();
      showToast('success', 'Success', t("Workout plan updated successfully"));
    } catch (error) {
      console.error('Error updating workout plan:', error);
      showToast('error', 'Error', t("Failed to update workout plan"));
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingPlan(null);
  };

  const handleEdit = (plan) => {
    setEditingPlan(plan);
    setShowForm(true);
    // Scroll to the form
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleDelete = async (planId) => {
    try {
      await deleteWorkoutPlan(planId);
      showToast('success', 'Success', t("Workout plan deleted successfully"));
      fetchWorkoutPlans();
    } catch (error) {
      console.error('Error deleting workout plan:', error);
      showToast('error', 'Error', t("Failed to delete workout plan"));
    }
  };

  const handleImportPlan = async () => {
    if (!importLink) {
      showToast('error', 'Error', t("Please enter a valid import link"));
      return;
    }
    setIsImporting(true);
    try {
      const shareId = importLink.split('/').pop();
      const importedPlan = await importWorkoutPlan(shareId);
      setImportLink('');
      await fetchWorkoutPlans();
    } catch (error) {
      console.error('Error importing workout plan:', error);
      showToast('error', 'Error', `Failed to import workout plan: ${error.message}`);
    } finally {
      setIsImporting(false);
    }
  };

  const filteredPlans = workoutPlans.filter(plan => 
    plan.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (filterType === 'all' || plan.type === filterType)
  );

  return (
    <>
      <h1 data-aos="fade-up" className="header text-3xl text-gray-800 dark:text-white font-bold mb-4 text-center">
        {t("Workout")} <span className='headerSpan'>{t("Plans")}</span>
      </h1>
      <div className={`p-4 ${darkMode ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-900'}`}>
        {ongoingWorkout && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4" role="alert">
            <p className="font-bold">{t("Ongoing Workout")}</p>
            <p>{t("You have an unfinished workout")}: {ongoingWorkout.name}</p>
            <button
              onClick={handleResumeWorkout}
              className="mt-2 bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded"
            >
              {t("Resume Workout")}
            </button>
          </div>
        )}

        <div ref={formRef} className="mb-4 flex flex-col sm:flex-row sm:justify-between sm:items-center">
          <button
            onClick={() => {
              setShowForm(!showForm);
              setEditingPlan(null);
            }}
            className="mb-2 sm:mb-0 bg-emerald-500 text-white hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700 hover:shadow-md font-bold py-1 px-3 rounded"
          >
            {t(showForm ? 'Hide Form' : 'Create New Plan')}
          </button>
          
          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
            <input
              type="text"
              placeholder={t("Search plans...")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border rounded py-1 px-2 text-gray-700 w-full sm:w-auto"
            />
          </div>
        </div>
        
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
          <input
            type="text"
            placeholder={t("Paste import link here...")}
            value={importLink}
            onChange={(e) => setImportLink(e.target.value)}
            className="border rounded py-1 px-2 text-gray-700 w-full sm:flex-grow"
            disabled={isImporting}
          />
          <button
            onClick={handleImportPlan}
            className={`bg-emerald-500 text-white hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700 hover:shadow-md font-bold py-1 px-2 rounded text-xs sm:text-sm sm:px-3 w-full sm:w-auto ${isImporting ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={isImporting}
          >
            {t(isImporting ? "Importing..." : "Import Plan")}
          </button>
        </div>

        {showForm && (
          <WorkoutPlanForm
            onSubmit={editingPlan ? handleEditWorkoutPlan : handleAddWorkoutPlan}
            initialPlan={editingPlan}
            onCancel={handleCancelForm}
          />
        )}

        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredPlans.map((plan) => (
            <WorkoutPlanCard
              key={plan._id}
              plan={plan}
              onStart={handleStartWorkout}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>

        {selectedPlan && (
          <WorkoutPlanModal
            plan={selectedPlan}
            onClose={() => setSelectedPlan(null)}
            onEdit={handleEdit}
            onStart={handleStartWorkout}
          />
        )}
      </div>
    </>
  );
}

export default WorkoutPlans;