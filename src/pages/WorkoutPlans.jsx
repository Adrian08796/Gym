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
  const [showForm, setShowForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [ongoingWorkout, setOngoingWorkout] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [importLink, setImportLink] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [showDefaultPlans, setShowDefaultPlans] = useState(true);
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const { user } = useAuth();
  const formRef = useRef(null);

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

  const toggleDefaultPlans = () => {
    setShowDefaultPlans(!showDefaultPlans);
  };

  const filteredPlans = workoutPlans.filter(plan => {
    const matchesSearch = plan.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = 
      filterType === 'all' || 
      (filterType === 'imported' && plan.importedFrom && plan.importedFrom.user && plan.importedFrom.user !== user.id) ||
      (filterType !== 'imported' && plan.type === filterType);
    const isVisible = showDefaultPlans || !plan.isDefault;
    return matchesSearch && matchesType && isVisible;
  });

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
            className="nav-btn"
          >
            {t(showForm ? 'Hide Form' : 'Create New Plan')}
          </button>
          
          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
            <input
              type="text"
              placeholder={t("Search plans...")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-2 py-1 lg:py-1 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:text-white text-lg"
            />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="nav-btn w-full sm:w-auto"
            >
              <option value="all">{t("All Types")}</option>
              <option value="strength">{t("Strength")}</option>
              <option value="cardio">{t("Cardio")}</option>
              <option value="imported">{t("Imported")}</option>
            </select>
            <button
              onClick={toggleDefaultPlans}
              className="nav-btn"
            >
              {showDefaultPlans ? t("Hide Default Plans") : t("Show Default Plans")}
            </button>
          </div>
        </div>
        
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
          <input
            type="text"
            placeholder={t("Paste import link here...")}
            value={importLink}
            onChange={(e) => setImportLink(e.target.value)}
            className="w-full px-2 py-1 lg:py-1 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:text-white text-lg"
            disabled={isImporting}
          />
          <button
            onClick={handleImportPlan}
            className={`nav-btn ${isImporting ? 'opacity-50 cursor-not-allowed' : ''}`}
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