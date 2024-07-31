// src/components/ExerciseItem.jsx
function ExerciseItem({ exercise, onEdit, onDelete }) {
  return (
    <div className="border rounded-lg p-4 mb-4 shadow-sm hover:shadow-md transition-shadow">
      <h3 className="text-xl font-semibold mb-2">{exercise.name}</h3>
      <p className="text-gray-600 mb-2">{exercise.description}</p>
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-gray-500">
          Target: {exercise.target}
        </span>
        <div>
          <button
            onClick={onEdit}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded mr-2"
          >
            Edit
          </button>
          <button
            onClick={onDelete}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default ExerciseItem;