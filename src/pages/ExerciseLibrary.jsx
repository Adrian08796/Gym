import { useState } from 'react';
import ExerciseItem from '../components/ExerciseItem';
import AddExerciseForm from '../components/AddExerciseForm';
import { useGymContext } from '../context/GymContext';

function ExerciseLibrary() {
  const { exercises, addExercise, updateExercise, deleteExercise } = useGymContext();
  const [editingExercise, setEditingExercise] = useState(null);

  const handleEdit = (exercise) => {
    setEditingExercise(exercise);
  };

  const handleDelete = (id) => {
    deleteExercise(id);
  };

  const handleSave = (exerciseData) => {
    if (editingExercise) {
      updateExercise(editingExercise._id, exerciseData);
      setEditingExercise(null);
    } else {
      addExercise(exerciseData);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Exercise Library</h1>
      <AddExerciseForm onSave={handleSave} initialExercise={editingExercise} />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {exercises.map((exercise) => (
          <ExerciseItem 
            key={exercise._id} 
            exercise={exercise}
            onEdit={() => handleEdit(exercise)}
            onDelete={() => handleDelete(exercise._id)}
          />
        ))}
      </div>
    </div>
  );
}

export default ExerciseLibrary;