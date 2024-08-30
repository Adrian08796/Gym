// src/components/AddExerciseForm.jsx

import { useState, useEffect } from 'react';
import { useGymContext } from '../context/GymContext';
import { useNotification } from '../context/NotificationContext';

const muscleGroups = [
  'Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Legs', 'Core', 'Full Body', 'Abs'
];

const categories = ['Strength', 'Cardio', 'Flexibility'];

function AddExerciseForm({ onSave, initialExercise, onCancel }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [target, setTarget] = useState([]);
  const [imageUrl, setImageUrl] = useState('');
  const [category, setCategory] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const { addExercise, updateExercise } = useGymContext();
  const { addNotification } = useNotification();

  useEffect(() => {
    if (initialExercise) {
      setName(initialExercise.name);
      setDescription(initialExercise.description);
      setTarget(Array.isArray(initialExercise.target) ? initialExercise.target : [initialExercise.target]);
      setImageUrl(initialExercise.imageUrl);
      setCategory(initialExercise.category || '');
      setIsExpanded(true);
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
      measurementType 
    };

    try {
      let savedExercise;
      if (initialExercise) {
        savedExercise = await updateExercise(initialExercise._id, exercise);
        addNotification('Exercise updated successfully', 'success');
      } else {
        savedExercise = await addExercise(exercise);
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
        className="mb-4 bg-emerald-500 text-white hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700 hover:shadow-md font-bold py-1 px-3 rounded"
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

          {/* Submit and Cancel buttons */}
          <div className="flex items-center justify-between">
            <button
              className={`mb-4 bg-emerald-500 text-white hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700 hover:shadow-md font-bold py-1 px-3 rounded ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : (initialExercise ? 'Update Exercise' : 'Add Exercise')}
            </button>
            <button
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-1 px-3 rounded focus:outline-none focus:shadow-outline"
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