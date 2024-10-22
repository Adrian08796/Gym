// src/components/WorkoutPlanForm.jsx

import React, { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useGymContext } from '../context/GymContext';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useTranslation } from 'react-i18next';

// Validation Schema
const WorkoutPlanSchema = Yup.object().shape({
  name: Yup.string()
    .min(3, 'Name is too short')
    .max(50, 'Name is too long')
    .required('Plan name is required'),
  type: Yup.string()
    .oneOf(['strength', 'cardio', 'flexibility', 'other'], 'Invalid type')
    .required('Type is required'),
  scheduledDate: Yup.date()
    .nullable()
    .min(new Date(), 'Date cannot be in the past'),
  exercises: Yup.array()
    .of(Yup.mixed())
    .min(0, 'At least one exercise is required'),
  isDefault: Yup.boolean()
});

function WorkoutPlanForm({ onSubmit, initialPlan, onCancel }) {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditable, setIsEditable] = useState(true);
  const { exercises, addWorkoutPlan, updateWorkoutPlan, addDefaultWorkoutPlan, showToast } = useGymContext();
  const { darkMode } = useTheme();
  const { user } = useAuth();

  const initialValues = {
    name: initialPlan?.name || '',
    type: initialPlan?.type || 'strength',
    scheduledDate: initialPlan?.scheduledDate ? new Date(initialPlan.scheduledDate).toISOString().split('T')[0] : '',
    exercises: initialPlan?.exercises || [],
    isDefault: initialPlan?.isDefault || false
  };

  useEffect(() => {
    setIsEditable(user.isAdmin || !initialPlan?.isDefault);
  }, [initialPlan, user.isAdmin]);

  const filteredExercises = exercises.filter(exercise =>
    exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (Array.isArray(exercise.target) && exercise.target.some(t => t.toLowerCase().includes(searchTerm.toLowerCase())))
  );

  const groupedExercises = filteredExercises.reduce((acc, exercise) => {
    const targets = Array.isArray(exercise.target) ? exercise.target : [exercise.target];
    targets.forEach(target => {
      if (!acc[target]) {
        acc[target] = [];
      }
      acc[target].push(exercise);
    });
    return acc;
  }, {});

  const handleFormSubmit = async (values, { setSubmitting }) => {
    if (!isEditable) {
      showToast('error', 'Error', t("You don't have permission to edit this plan."));
      return;
    }

    try {
      const workoutPlan = {
        name: values.name,
        exercises: values.exercises.map(exercise => {
          if (typeof exercise === 'string') return exercise;
          if (exercise && exercise._id) return exercise._id;
          console.error('Invalid exercise object:', exercise);
          return null;
        }).filter(id => id !== null),
        type: values.type,
        scheduledDate: values.scheduledDate ? new Date(values.scheduledDate).toISOString() : null,
        isDefault: values.isDefault
      };

      let savedPlan;
      if (initialPlan) {
        savedPlan = await updateWorkoutPlan(initialPlan._id, workoutPlan);
      } else if (values.isDefault && user.isAdmin) {
        savedPlan = await addDefaultWorkoutPlan(workoutPlan);
      } else {
        savedPlan = await addWorkoutPlan(workoutPlan);
      }

      if (!savedPlan) {
        throw new Error("No plan returned from the server");
      }

      onSubmit(savedPlan);
      onCancel();
    } catch (error) {
      console.error('Error saving workout plan:', error);
      showToast('error', 'Error', error.message || t('Failed to save workout plan'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={WorkoutPlanSchema}
      onSubmit={handleFormSubmit}
      enableReinitialize
    >
      {({ values, setFieldValue, isSubmitting, errors, touched }) => (
        <Form className="bg-white dark:bg-gray-800 shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <div className="mb-4">
            <label className="block text-sm font-bold mb-2">
              {t("Workout Plan Name")}
            </label>
            <Field
              name="name"
              type="text"
              className={`shadow appearance-none border rounded w-full py-2 px-3 
                ${darkMode ? 'bg-gray-700 text-white' : 'text-gray-700'} 
                leading-tight focus:outline-none focus:shadow-outline 
                ${!isEditable ? 'opacity-50 cursor-not-allowed' : ''}
                ${errors.name && touched.name ? 'border-red-500' : ''}`}
              disabled={!isEditable}
            />
            <ErrorMessage name="name" component="div" className="text-red-500 text-xs italic mt-1" />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-bold mb-2">
              {t("Workout Type")}
            </label>
            <Field
              as="select"
              name="type"
              className={`shadow appearance-none border rounded w-full py-2 px-3 
                ${darkMode ? 'bg-gray-700 text-white' : 'text-gray-700'} 
                leading-tight focus:outline-none focus:shadow-outline 
                ${!isEditable ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={!isEditable}
            >
              <option value="strength">{t("Strength")}</option>
              <option value="cardio">{t("Cardio")}</option>
              <option value="flexibility">{t("Flexibility")}</option>
              <option value="other">{t("Other")}</option>
            </Field>
            <ErrorMessage name="type" component="div" className="text-red-500 text-xs italic mt-1" />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-bold mb-2">
              {t("Scheduled Date")}
            </label>
            <Field
              name="scheduledDate"
              type="date"
              className={`shadow appearance-none border rounded w-full py-2 px-3 
                ${darkMode ? 'bg-gray-700 text-white' : 'text-gray-700'} 
                leading-tight focus:outline-none focus:shadow-outline 
                ${!isEditable ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={!isEditable}
            />
            <ErrorMessage name="scheduledDate" component="div" className="text-red-500 text-xs italic mt-1" />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
              {t("Select Exercises")}
            </label>
            <input
              type="text"
              placeholder={t("Search exercises...")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`shadow appearance-none border rounded w-full py-2 px-3 
                ${darkMode ? 'bg-gray-700 text-white' : 'text-gray-700'} 
                leading-tight focus:outline-none focus:shadow-outline mb-4 
                ${!isEditable ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={!isEditable}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className={`border rounded p-4 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} overflow-y-auto h-96`}>
                {Object.entries(groupedExercises).map(([target, targetExercises]) => (
                  <div key={target} className="mb-4">
                    <h3 className="font-bold mb-2">{target}</h3>
                    {targetExercises.map(exercise => (
                      <div key={exercise._id} className="flex items-center mb-2">
                        <input
                          type="checkbox"
                          checked={values.exercises.some(e => e._id === exercise._id)}
                          onChange={() => {
                            const newExercises = values.exercises.some(e => e._id === exercise._id)
                              ? values.exercises.filter(e => e._id !== exercise._id)
                              : [...values.exercises, exercise];
                            setFieldValue('exercises', newExercises);
                          }}
                          className={`mr-2 ${!isEditable ? 'opacity-50 cursor-not-allowed' : ''}`}
                          disabled={!isEditable}
                        />
                        <label className="text-sm">
                          {exercise.name}
                          {exercise.importedFrom && exercise.importedFrom.username && (
                            <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                              ({t("Imported from")} {exercise.importedFrom.username})
                            </span>
                          )}
                        </label>
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              <div className={`border rounded p-4 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} overflow-y-auto h-96`}>
                <h3 className="font-bold mb-2">{t("Selected Exercises")}</h3>
                <DragDropContext
                  onDragEnd={(result) => {
                    if (!result.destination || !isEditable) return;
                    const items = Array.from(values.exercises);
                    const [reorderedItem] = items.splice(result.source.index, 1);
                    items.splice(result.destination.index, 0, reorderedItem);
                    setFieldValue('exercises', items);
                  }}
                >
                  <Droppable droppableId="selected-exercises" isDropDisabled={!isEditable}>
                    {(provided) => (
                      <ul {...provided.droppableProps} ref={provided.innerRef}>
                        {values.exercises.map((exercise, index) => (
                          <Draggable
                            key={exercise._id}
                            draggableId={exercise._id}
                            index={index}
                            isDragDisabled={!isEditable}
                          >
                            {(provided) => (
                              <li
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className="flex items-center justify-between mb-2 bg-gray-200 dark:bg-gray-600 p-2 rounded"
                              >
                                <span className="text-sm">
                                  {exercise.name}
                                  {exercise.importedFrom && exercise.importedFrom.username && (
                                    <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                                      ({t("Imported from")} {exercise.importedFrom.username})
                                    </span>
                                  )}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newExercises = values.exercises.filter(e => e._id !== exercise._id);
                                    setFieldValue('exercises', newExercises);
                                  }}
                                  className={`text-red-500 hover:text-red-700 ${!isEditable ? 'opacity-50 cursor-not-allowed' : ''}`}
                                  disabled={!isEditable}
                                >
                                  {t("Remove")}
                                </button>
                              </li>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </ul>
                    )}
                  </Droppable>
                </DragDropContext>
              </div>
            </div>
            <ErrorMessage name="exercises" component="div" className="text-red-500 text-xs italic mt-1" />
          </div>

          {user.isAdmin && (
            <div className="mb-4">
              <label className="flex items-center">
                <Field
                  type="checkbox"
                  name="isDefault"
                  className="form-checkbox h-5 w-5 text-emerald-500"
                />
                <span className="ml-2 text-gray-700 dark:text-gray-300">
                  {t("Set as Default Workout Plan (Admin Only)")}
                </span>
              </label>
            </div>
          )}

          <div className="flex items-center justify-between mt-6">
            <button
              type="submit"
              disabled={!isEditable || isSubmitting}
              className={`nav-btn ${(!isEditable || isSubmitting) ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isSubmitting 
                ? t("Saving...") 
                : t(initialPlan ? "Update Workout Plan" : "Create Workout Plan")}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="nav-btn"
            >
              {t("Cancel")}
            </button>
          </div>

          {!isEditable && (
            <p className="mt-4 text-red-500 text-sm">
              {t("This is a default plan created by an admin. You don't have permission to edit it.")}
            </p>
          )}
        </Form>
      )}
    </Formik>
  );
}

export default WorkoutPlanForm;