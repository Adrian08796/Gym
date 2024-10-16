// src/components/WorkoutForm.jsx
import { useState, useEffect } from 'react';
import { useGymContext } from '../context/GymContext';
import { useTranslation } from 'react-i18next';

function WorkoutForm({ onSave, initialWorkout }) {
  const [selectedExercise, setSelectedExercise] = useState('');
  const [sets, setSets] = useState('');
  const [reps, setReps] = useState('');
  const [weight, setWeight] = useState('');
  const { exercises } = useGymContext();
  const { t } = useTranslation();

  useEffect(() => {
    if (initialWorkout) {
      setSelectedExercise(initialWorkout.exercise);
      setSets(initialWorkout.sets.toString());
      setReps(initialWorkout.reps.toString());
      setWeight(initialWorkout.weight.toString());
    }
  }, [initialWorkout]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const workout = {
      exercise: selectedExercise,
      sets: parseInt(sets),
      reps: parseInt(reps),
      weight: parseFloat(weight),
      date: new Date().toISOString()
    };
    onSave(workout);
    // Reset form
    setSelectedExercise('');
    setSets('');
    setReps('');
    setWeight('');
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto mt-8">
      <div className="mb-4">
        <label htmlFor="exercise" className="block text-gray-700 font-bold mb-2">
          {t("Exercise")}
        </label>
        <select
          id="exercise"
          value={selectedExercise}
          onChange={(e) => setSelectedExercise(e.target.value)}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          required
        >
          <option value="">{t("Select an exercise")}</option>
          {exercises.map((exercise) => (
            <option key={exercise._id} value={exercise.name}>
              {exercise.name}
            </option>
          ))}
        </select>
      </div>
      <div className="mb-4">
        <label htmlFor="sets" className="block text-gray-700 font-bold mb-2">
          {t("Sets")}
        </label>
        <input
          type="number"
          id={t("sets")}
          value={sets}
          onChange={(e) => setSets(e.target.value)}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          required
        />
      </div>
      <div className="mb-4">
        <label htmlFor="reps" className="block text-gray-700 font-bold mb-2">
          {t("Reps")}
        </label>
        <input
          type="number"
          id="reps"
          value={reps}
          onChange={(e) => setReps(e.target.value)}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          required
        />
      </div>
      <div className="mb-6">
        <label htmlFor="weight" className="block text-gray-700 font-bold mb-2">
          {t("Weight (kg)")}
        </label>
        <input
          type="number"
          id="weight"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          step="0.1"
          required
        />
      </div>
      <div className="flex items-center justify-between">
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          {t(initialWorkout ? "Update Workout" : "Log Workout")}
        </button>
      </div>
    </form>
  );
}

export default WorkoutForm;