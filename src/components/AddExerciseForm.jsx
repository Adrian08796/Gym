// src/components/AddExerciseForm.jsx

import React, { useState, useEffect } from 'react';
import { useGymContext } from '../context/GymContext';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';

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
  const { addExercise, updateExercise, addDefaultExercise } = useGymContext();
  const { addNotification } = useNotification();
  const { user } = useAuth();

  const [recommendations, setRecommendations] = useState({
    beginner: { weight: 0, reps: 10, sets: 3 },
    intermediate: { weight: 0, reps: 10, sets: 3 },
    advanced: { weight: 0, reps: 10, sets: 3 }
  });

  useEffect(() => {
    if (initialExercise) {
      setName(initialExercise.name);
      setDescription(initialExercise.description);
      setTarget(Array.isArray(initialExercise.target) ? initialExercise.target : [initialExercise.target]);
      setImageUrl(initialExercise.imageUrl);
      setCategory(initialExercise.category || '');
      setIsExpanded(true);
      setRecommendations(initialExercise.recommendations || {
        beginner: { weight: 0, reps: 10, sets: 3 },
        intermediate: { weight: 0, reps: 10, sets: 3 },
        advanced: { weight: 0, reps: 10, sets: 3 }
      });
      setIsDefault(initialExercise.isDefault || false);
    } else {
      resetForm();
    }
  }, [initialExercise]);

  const resetForm = () => {
    setName('');
    setDescription('');
    setTarget([]);
    setImageUrl('');
    setCategory('');
    setRecommendations({
      beginner: { weight: 0, reps: 10, sets: 3 },
      intermediate: { weight: 0, reps: 10, sets: 3 },
      advanced: { weight: 0, reps: 10, sets: 3 }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    if (target.length === 0) {
      addNotification('Please select at least one target muscle group', 'error');
      setIsSubmitting(false);
      return;
    }

    if (!category) {
      addNotification('Please select a category', 'error');
      setIsSubmitting(false);
      return;
    }

    const exerciseType = category === 'Strength' ? 'strength' : 'cardio';
    const measurementType = category === 'Strength' ? 'weight_reps' : 'duration';

    const exercise = { 
      name, 
      description, 
      target, 
      imageUrl, 
      category, 
      exerciseType, 
      measurementType,
      recommendations,
      isDefault
    };

    try {
      let savedExercise;
      if (initialExercise) {
        savedExercise = await updateExercise(initialExercise._id, exercise);
        addNotification('Exercise updated successfully', 'success');
      } else {
        if (isDefault && user.isAdmin) {
          savedExercise = await addDefaultExercise(exercise);
        } else {
          savedExercise = await addExercise(exercise);
        }
        addNotification('Exercise added successfully', 'success');
      }
      resetForm();
      setIsExpanded(false);
      onSave(savedExercise);
    } catch (error) {
      addNotification('Failed to save exercise. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRecommendationChange = (level, field, value) => {
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
        {isExpanded ? 'Hide Form' : 'Add New Exercise'}
      </button>
      {isExpanded && (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
            {initialExercise ? 'Edit Exercise' : 'Add New Exercise'}
          </h2>

          {/* Name input */}
          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="name">
              Exercise Name
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
              Description
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
              Target Muscle Groups
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
              Category
            </label>
            <select
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-white leading-tight focus:outline-none focus:shadow-outline dark:bg-gray-700 dark:border-gray-600"
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            >
              <option value="">Select a category</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Image URL input */}
          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="imageUrl">
              Image URL
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

          {/* Recommendations for Strength exercises */}
          {category === 'Strength' && (
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2 text-gray-700 dark:text-gray-300">Recommendations</h3>
              {experienceLevels.map(level => (
                <div key={level} className="mb-4">
                  <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </h4>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1" htmlFor={`${level}-weight`}>
                        Weight (kg)
                      </label>
                      <input
                        id={`${level}-weight`}
                        type="number"
                        value={recommendations[level].weight}
                        onChange={(e) => handleRecommendationChange(level, 'weight', e.target.value)}
                        className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1" htmlFor={`${level}-reps`}>
                        Reps
                      </label>
                      <input
                        id={`${level}-reps`}
                        type="number"
                        value={recommendations[level].reps}
                        onChange={(e) => handleRecommendationChange(level, 'reps', e.target.value)}
                        className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1" htmlFor={`${level}-sets`}>
                        Sets
                      </label>
                      <input
                        id={`${level}-sets`}
                        type="number"
                        value={recommendations[level].sets}
                        onChange={(e) => handleRecommendationChange(level, 'sets', e.target.value)}
                        className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
                      />
                    </div>
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
                  onChange={(e) => setIsDefault(e.target.checked)}
                  className="form-checkbox h-5 w-5 text-emerald-500"
                />
                <span className="ml-2 text-gray-700 dark:text-gray-300">Set as Default Exercise (Admin Only)</span>
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
              {isSubmitting ? 'Saving...' : (initialExercise ? 'Update Exercise' : 'Add Exercise')}
            </button>
            <button
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="button"
              onClick={handleCancel}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default AddExerciseForm;