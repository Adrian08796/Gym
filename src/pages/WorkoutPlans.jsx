// src/pages/WorkoutPlans.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGymContext } from '../context/GymContext';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import WorkoutPlanForm from '../components/WorkoutPlanForm';
import WorkoutPlanCard from '../components/WorkoutPlanCard';
import WorkoutPlanModal from '../components/WorkoutPlanModal';

function WorkoutPlans() {
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
        showToast('warn', 'Warning', 'Some exercises could not be found. The plan will be created with available exercises.');
      }

      const newPlan = { ...plan, exercises: validExercises };
      await addWorkoutPlan(newPlan);
      handleCancelForm();
      await fetchWorkoutPlans();
      showToast('success', 'Success', 'Workout plan added successfully');
    } catch (error) {
      console.error('Error adding workout plan:', error);
      showToast('error', 'Error', 'Failed to add workout plan');
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
        showToast('warn', 'Warning', 'Some exercises could not be found. The plan will be updated with available exercises.');
      }

      const updatedPlan = { ...plan, exercises: validExercises };
      await updateWorkoutPlan(plan._id, updatedPlan);
      handleCancelForm();
      await fetchWorkoutPlans();
      showToast('success', 'Success', 'Workout plan updated successfully');
    } catch (error) {
      console.error('Error updating workout plan:', error);
      showToast('error', 'Error', 'Failed to update workout plan');
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingPlan(null);
  };

  const handleEdit = (plan) => {
    setEditingPlan(plan);
    setShowForm(true);
  };

  const handleDelete = async (planId) => {
    try {
      await deleteWorkoutPlan(planId);
      showToast('success', 'Success', 'Workout plan deleted successfully');
      fetchWorkoutPlans();
    } catch (error) {
      console.error('Error deleting workout plan:', error);
      showToast('error', 'Error', 'Failed to delete workout plan');
    }
  };

  const handleImportPlan = async () => {
    if (!importLink) {
      showToast('error', 'Error', 'Please enter a valid import link');
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
      <h1 data-aos="fade-up" className="header text-3xl font-bold mb-4 text-center">
        Workout <span className='headerSpan'>Plans</span>
      </h1>
      <div className={`p-4 ${darkMode ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-900'}`}>
        {ongoingWorkout && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4" role="alert">
            <p className="font-bold">Ongoing Workout</p>
            <p>You have an unfinished workout: {ongoingWorkout.name}</p>
            <button
              onClick={handleResumeWorkout}
              className="mt-2 bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded"
            >
              Resume Workout
            </button>
          </div>
        )}

        <div className="mb-4 flex flex-col sm:flex-row sm:justify-between sm:items-center">
          <button
            onClick={() => {
              setShowForm(!showForm);
              setEditingPlan(null);
            }}
            className="mb-2 sm:mb-0 bg-emerald-500 text-white hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700 hover:shadow-md font-bold py-1 px-3 rounded"
          >
            {showForm ? 'Hide Form' : 'Create New Plan'}
          </button>
          
          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
            <input
              type="text"
              placeholder="Search plans..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border rounded py-1 px-2 text-gray-700 w-full sm:w-auto"
            />
            {/* <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="border rounded py-1 px-2 text-gray-700 w-full sm:w-auto"
            >
              <option value="all">All Types</option>
              <option value="strength">Strength</option>
              <option value="cardio">Cardio</option>
              <option value="flexibility">Flexibility</option>
              <option value="other">Other</option>
            </select> */}
          </div>
        </div>
        
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
          <input
            type="text"
            placeholder="Paste import link here..."
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
            {isImporting ? 'Importing...' : 'Import Plan'}
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