// src/components/AddExerciseForm.jsx
import { useState, useEffect } from 'react';
import { useGymContext } from '../context/GymContext';

function AddExerciseForm({ onSave, initialExercise }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [target, setTarget] = useState('');
  const { addExercise } = useGymContext();

  useEffect(() => {
    if (initialExercise) {
      setName(initialExercise.name);
      setDescription(initialExercise.description);
      setTarget(initialExercise.target);
    }
  }, [initialExercise]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const exercise = { name, description, target };
    if (initialExercise) {
      onSave(exercise);
    } else {
      addExercise(exercise);
    }
    // Reset form
    setName('');
    setDescription('');
    setTarget('');
  };

  return (
    <form onSubmit={handleSubmit} className=" bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
      <h2 className="text-2xl font-bold mb-4">
        {initialExercise ? 'Edit Exercise' : 'Add New Exercise'}
      </h2>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
          Exercise Name
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="name"
          type="text"
          placeholder="Exercise Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
          Description
        </label>
        <textarea
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="description"
          placeholder="Exercise Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="target">
          Target Muscle Group
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="target"
          type="text"
          placeholder="Target Muscle Group"
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          required
        />
      </div>
      <div className="flex items-center justify-between">
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          type="submit"
        >
          {initialExercise ? 'Update Exercise' : 'Add Exercise'}
        </button>
      </div>
    </form>
  );
}

export default AddExerciseForm;