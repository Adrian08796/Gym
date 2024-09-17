// src/pages/WorkoutPlans.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGymContext } from '../context/GymContext';
import { useNotification } from '../context/NotificationContext';
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
    getExerciseById
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
  const { addNotification } = useNotification();
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
        addNotification('Some exercises could not be found. The plan will be created with available exercises.', 'warning');
      }

      const newPlan = { ...plan, exercises: validExercises };
      await addWorkoutPlan(newPlan);
      handleCancelForm();
      await fetchWorkoutPlans();
      addNotification('Workout plan added successfully', 'success');
    } catch (error) {
      console.error('Error adding workout plan:', error);
      addNotification('Failed to add workout plan', 'error');
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
        addNotification('Some exercises could not be found. The plan will be updated with available exercises.', 'warning');
      }

      const updatedPlan = { ...plan, exercises: validExercises };
      await updateWorkoutPlan(plan._id, updatedPlan);
      handleCancelForm();
      await fetchWorkoutPlans();
      addNotification('Workout plan updated successfully', 'success');
    } catch (error) {
      console.error('Error updating workout plan:', error);
      addNotification('Failed to update workout plan', 'error');
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
      addNotification('Workout plan deleted successfully', 'success');
      fetchWorkoutPlans();
    } catch (error) {
      console.error('Error deleting workout plan:', error);
      addNotification('Failed to delete workout plan', 'error');
    }
  };

  const filteredPlans = workoutPlans.filter(plan => 
    plan.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (filterType === 'all' || plan.type === filterType)
  );

  const handleImportPlan = async () => {
    if (!importLink) {
      addNotification('Please enter a valid import link', 'error');
      return;
    }
    setIsImporting(true);
    try {
      const shareId = importLink.split('/').pop();
      const importedPlan = await importWorkoutPlan(shareId);
      addNotification('Workout plan imported successfully', 'success');
      setImportLink('');
      await fetchWorkoutPlans();
    } catch (error) {
      console.error('Error importing workout plan:', error);
      addNotification(`Failed to import workout plan: ${error.message}`, 'error');
    } finally {
      setIsImporting(false);
    }
  };

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

<div className="mb-4 flex flex-wrap items-center justify-between">
          <button
            onClick={() => {
              setShowForm(!showForm);
              setEditingPlan(null);
            }}
            className="mb-4 bg-emerald-500 text-white hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700 hover:shadow-md font-bold py-1 px-3 rounded"
          >
            {showForm ? 'Hide Form' : 'Create New Plan'}
          </button>
          
          <div className="flex items-center space-x-2">
            <input
              type="text"
              placeholder="Search plans..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border rounded py-1 px-2 text-gray-700"
            />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="border rounded py-1 px-2 text-gray-700"
            >
              <option value="all">All Types</option>
              <option value="strength">Strength</option>
              <option value="cardio">Cardio</option>
              <option value="flexibility">Flexibility</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
        
        <div className="mb-4 flex items-center space-x-2">
          <input
            type="text"
            placeholder="Paste import link here..."
            value={importLink}
            onChange={(e) => setImportLink(e.target.value)}
            className="border rounded py-1 px-2 text-gray-700 flex-grow"
            disabled={isImporting}
          />
          <button
            onClick={handleImportPlan}
            className={`bg-emerald-500 text-white hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700 hover:shadow-md font-bold py-1 px-2 rounded text-xs sm:text-sm sm:px-3 ${isImporting ? 'opacity-50 cursor-not-allowed' : ''}`}
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

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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