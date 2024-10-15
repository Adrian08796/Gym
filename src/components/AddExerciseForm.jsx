// src/components/AddExerciseForm.jsx

import React, { useState, useEffect } from 'react';
import { useGymContext } from '../context/GymContext';
import { Toast } from 'primereact/toast';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

const muscleGroups = [
  'Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Legs', 'Core', 'Full Body', 'Abs'
];

const categories = ['Strength', 'Cardio', 'Flexibility'];
const experienceLevels = ['beginner', 'intermediate', 'advanced'];

function AddExerciseForm({ onSave, initialExercise, onCancel }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [target, setTarget] = useState([]);
  const [imageUrl, setImageUrl] = useState('');
  const [category, setCategory] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDefault, setIsDefault] = useState(false);
  const [actingAsAdmin, setActingAsAdmin] = useState(false);
  const { addExercise, updateExercise, addDefaultExercise, showToast } = useGymContext();
  const { user } = useAuth();
  const { t } = useTranslation();
  

  useEffect(() => {
    console.log('DEBUGG:::: User:', user);
  } , [user]);

  const [recommendations, setRecommendations] = useState({
    beginner: { weight: 0, reps: 10, sets: 3, duration: 30, distance: 1, intensity: 5, incline: 0 },
    intermediate: { weight: 0, reps: 12, sets: 4, duration: 45, distance: 2, intensity: 7, incline: 1 },
    advanced: { weight: 0, reps: 15, sets: 5, duration: 60, distance: 3, intensity: 9, incline: 2 }
  });

  useEffect(() => {
    if (initialExercise) {
      console.log('Initial exercise:', initialExercise);
      setName(initialExercise.name || '');
      setDescription(initialExercise.description || '');
      setTarget(Array.isArray(initialExercise.target) ? initialExercise.target : [initialExercise.target] || []);
      setImageUrl(initialExercise.imageUrl || '');
      setCategory(initialExercise.category || '');
      setIsExpanded(true);
      setIsDefault(initialExercise.isDefault || false);
      setActingAsAdmin(user.isAdmin && initialExercise.isDefault);

      // Handle recommendations based on user role and exercise data
      const updatedRecommendations = { ...recommendations };
      experienceLevels.forEach(level => {
        if (initialExercise.recommendations && initialExercise.recommendations[level]) {
          updatedRecommendations[level] = {
            ...updatedRecommendations[level],
            ...initialExercise.recommendations[level]
          };
        }
      });
      setRecommendations(updatedRecommendations);
    } else {
      resetForm();
    }
  }, [initialExercise, user.isAdmin]);

  const resetForm = () => {
    setName('');
    setDescription('');
    setTarget([]);
    setImageUrl('');
    setCategory('');
    setRecommendations({
      beginner: { weight: 0, reps: 10, sets: 3, duration: 30, distance: 1, intensity: 5, incline: 0 },
      intermediate: { weight: 0, reps: 12, sets: 4, duration: 45, distance: 2, intensity: 7, incline: 1 },
      advanced: { weight: 0, reps: 15, sets: 5, duration: 60, distance: 3, intensity: 9, incline: 2 }
    });
    setIsDefault(false);
    setActingAsAdmin(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
  
    if (target.length === 0) {
      showToast('error', 'Error', 'Please select at least one target muscle group');
      setIsSubmitting(false);
      return;
    }
  
    if (!category) {
      showToast('error', 'Error', 'Please select a category');
      setIsSubmitting(false);
      return;
    }
  
    const exerciseType = category === 'Strength' ? 'strength' : 'cardio';
    const measurementType = category === 'Strength' ? 'weight_reps' : 'duration';
  
    let exerciseData = { 
      name, 
      description, 
      target, 
      imageUrl, 
      category, 
      exerciseType, 
      measurementType,
      isDefault
    };

    if (actingAsAdmin) {
      exerciseData.recommendations = recommendations;
    } else {
      exerciseData.recommendations = {
        [user.experienceLevel]: recommendations[user.experienceLevel]
      };
    }
  
    console.log('Submitting exercise:', exerciseData);

    try {
      let savedExercise;
      if (initialExercise) {
        if (actingAsAdmin) {
          savedExercise = await updateExercise(initialExercise._id, {
            ...initialExercise,
            ...exerciseData
          });
        } else {
          // If not acting as admin, only update the user's experience level
          savedExercise = await updateExercise(initialExercise._id, {
            ...initialExercise,
            recommendations: {
              ...initialExercise.recommendations,
              [user.experienceLevel]: exerciseData.recommendations[user.experienceLevel]
            }
          });
        }
        // showToast('success', 'Success', 'Exercise updated successfully');
      } else {
        if (isDefault && user.isAdmin) {
          savedExercise = await addDefaultExercise(exerciseData);
        } else {
          savedExercise = await addExercise(exerciseData);
        }
        // showToast('success', 'Success', 'Exercise added successfully');
      }
      console.log('Saved exercise:', savedExercise);
      resetForm();
      setIsExpanded(false);
      onSave(savedExercise);
    } catch (error) {
      console.error('Error saving exercise:', error);
      showToast('error', 'Error', 'Failed to save exercise. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRecommendationChange = (level, field, value) => {
    console.log(`Updating ${field} for ${level} to ${value}`);
    setRecommendations(prev => ({
      ...prev,
      [level]: {
        ...prev[level],
        [field]: Number(value)
      }
    }));
  };

  const handleTargetChange = (group) => {
    setTarget(prev => 
      prev.includes(group) 
        ? prev.filter(item => item !== group)
        : [...prev, group]
    );
  };

  const handleCancel = () => {
    resetForm();
    setIsExpanded(false);
    if (typeof onCancel === 'function') {
      onCancel();
    }
  };

  const toggleForm = () => {
    setIsExpanded(!isExpanded);
    if (!isExpanded) {
      resetForm();
    }
  };

  return (
    <div className="mb-8">
      <button
        onClick={toggleForm}
        className="mb-4 bg-emerald-500 text-white hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700 hover:shadow-md font-bold py-2 px-4 rounded"
      >
        {t(isExpanded ? ('Hide Form') : 'Add New Exercise')}
      </button>
      {isExpanded && (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
          {t(initialExercise ? "Edit Exercise" : "Add New Exercise")}
          </h2>

          {/* Name input */}
          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="name">
              {t("Exercise Name")}
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-white leading-tight focus:outline-none focus:shadow-outline dark:bg-gray-700 dark:border-gray-600"
              id="name"
              type="text"
              placeholder="Exercise Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* Description input */}
          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="description">
              {t("Description")}
            </label>
            <textarea
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-white leading-tight focus:outline-none focus:shadow-outline dark:bg-gray-700 dark:border-gray-600"
              id="description"
              placeholder="Exercise Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          {/* Target muscle groups */}
          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
              {t("Target Muscle Groups")}
            </label>
            <div className="flex flex-wrap -mx-1">
              {muscleGroups.map(group => (
                <div key={group} className="px-1 mb-2">
                  <button
                    type="button"
                    onClick={() => handleTargetChange(group)}
                    className={`py-1 px-2 rounded ${
                      target.includes(group)
                        ? 'bg-emerald-500 text-white hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700 hover:shadow-md'
                        : 'bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-300'
                    }`}
                  >
                    {group}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Category selection */}
          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="category">
              {t("Category")}
            </label>
            <select
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-white leading-tight focus:outline-none focus:shadow-outline dark:bg-gray-700 dark:border-gray-600"
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            >
              <option value="">{t("Select a category")}</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Image URL input */}
          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="imageUrl">
              {t("Image URL")}
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-white leading-tight focus:outline-none focus:shadow-outline dark:bg-gray-700 dark:border-gray-600"
              id="imageUrl"
              type="text"
              placeholder="Image URL"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
          </div>

          {/* Recommendations for exercises */}
      {(category === 'Strength' || category === 'Cardio') && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2 text-gray-700 dark:text-gray-300">{t("Recommendations")}</h3>
          {(actingAsAdmin ? experienceLevels : [user.experienceLevel]).map(level => (
            <div key={level} className="mb-4">
              <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-2">
                {console.log("LEVEL:::", level)}
                {typeof level === "string" && level.charAt(0).toUpperCase() + level.slice(1)}
              </h4>
              <div className="grid grid-cols-3 gap-2">
                {category === 'Strength' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1" htmlFor={`${level}-weight`}>
                        {t("Weight (kg)")}
                      </label>
                      <input
                        id={`${level}-weight`}
                        type="number"
                        value={recommendations[level]?.weight || 0}
                        onChange={(e) => handleRecommendationChange(level, 'weight', e.target.value)}
                        className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1" htmlFor={`${level}-reps`}>
                        {t("Reps")}
                      </label>
                      <input
                        id={`${level}-reps`}
                        type="number"
                        value={recommendations[level]?.reps || 0}
                        onChange={(e) => handleRecommendationChange(level, 'reps', e.target.value)}
                        className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1" htmlFor={`${level}-sets`}>
                        {t("Sets")}
                      </label>
                      <input
                        id={`${level}-sets`}
                        type="number"
                        value={recommendations[level]?.sets || 0}
                        onChange={(e) => handleRecommendationChange(level, 'sets', e.target.value)}
                        className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
                      />
                    </div>
                  </>
                )}
                {category === 'Cardio' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1" htmlFor={`${level}-duration`}>
                        {t("Duration (min)")}
                      </label>
                      <input
                        id={`${level}-duration`}
                        type="number"
                        value={recommendations[level]?.duration || 0}
                        onChange={(e) => handleRecommendationChange(level, 'duration', e.target.value)}
                        className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1" htmlFor={`${level}-distance`}>
                        {t("Distance (km)")}
                      </label>
                      <input
                        id={`${level}-distance`}
                        type="number"
                        value={recommendations[level]?.distance || 0}
                        onChange={(e) => handleRecommendationChange(level, 'distance', e.target.value)}
                        className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1" htmlFor={`${level}-intensity`}>
                        {t("Intensity (1-10)")}
                      </label>
                      <input
                        id={`${level}-intensity`}
                        type="number"
                        min="1"
                        max="10"
                        value={recommendations[level]?.intensity || 1}
                        onChange={(e) => handleRecommendationChange(level, 'intensity', e.target.value)}
                        className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1" htmlFor={`${level}-incline`}>
                        {t("Incline (%)")}
                      </label>
                      <input
                        id={`${level}-incline`}
                        type="number"
                        value={recommendations[level]?.incline || 0}
                        onChange={(e) => handleRecommendationChange(level, 'incline', e.target.value)}
                        className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      {user.isAdmin && (
        <div className="mb-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={isDefault}
              onChange={(e) => {
                setIsDefault(e.target.checked);
                setActingAsAdmin(e.target.checked);
              }}
              className="form-checkbox h-5 w-5 text-emerald-500"
            />
            <span className="ml-2 text-gray-700 dark:text-gray-300">{t("Set as Default Exercise (Admin Only)")}</span>
          </label>
        </div>
      )}
          {/* Submit and Cancel buttons */}
          <div className="flex items-center justify-between">
            <button
              className={`bg-emerald-500 text-white hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700 hover:shadow-md font-bold py-2 px-4 rounded ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
              type="submit"
              disabled={isSubmitting}
            >
              {t(isSubmitting ? 'Saving...' : (initialExercise ? 'Update Exercise' : 'Add Exercise'))}
            </button>
            <button
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="button"
              onClick={handleCancel}
            >
              {t("Cancel")} 
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default AddExerciseForm;