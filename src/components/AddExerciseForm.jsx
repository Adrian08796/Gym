// src/components/AddExerciseForm.jsx

import React, { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage, getIn } from 'formik';
import * as Yup from 'yup';
import { useGymContext } from '../context/GymContext';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

const muscleGroups = [
  'Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Legs', 'Core', 'Full Body', 'Abs'
];

const categories = ['Strength', 'Cardio', 'Flexibility'];
const experienceLevels = ['beginner', 'intermediate', 'advanced'];

function AddExerciseForm({ onSave, initialExercise, onCancel }) {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditable, setIsEditable] = useState(true);
  const { addExercise, updateExercise, addDefaultExercise, showToast } = useGymContext();
  const { user } = useAuth();

  const FormErrorMessage = ({ name }) => {
    return (
      <Field name={name}>
        {({ form }) => {
          const error = getIn(form.errors, name);
          const touch = getIn(form.touched, name);
          return touch && error ? (
            <div className="text-red-500 text-xs italic mt-1">{error}</div>
          ) : null;
        }}
      </Field>
    );
  };
  
    // Yup validation schema
    const ExerciseSchema = Yup.object().shape({
      name: Yup.string()
        .min(3, t('Name must be at least 3 characters'))
        .max(50, t('Name must be less than 50 characters'))
        .required(t('Name is required')),
      description: Yup.string()
        .min(10, t('Description must be at least 10 characters'))
        .max(500, t('Description must be less than 500 characters'))
        .required(t('Description is required')),
      target: Yup.array()
        .min(1, t('At least one target muscle group is required'))
        .required(t('Target muscle group is required')),
      imageUrl: Yup.string()
        .url(t('Must be a valid URL'))
        .nullable(),
      category: Yup.string()
        .oneOf(['Strength', 'Cardio', 'Flexibility'], t('Invalid category'))
        .required(t('Category is required')),
      isDefault: Yup.boolean(),
      recommendations: Yup.object().shape({
        beginner: Yup.object().shape({
          weight: Yup.number()
            .transform((value) => (isNaN(value) ? undefined : value))
            .min(0, t('Weight must be 0 or greater'))
            .nullable(),
          reps: Yup.number()
            .transform((value) => (isNaN(value) ? undefined : value))
            .min(0, t('Reps must be 0 or greater'))
            .nullable(),
          sets: Yup.number()
            .transform((value) => (isNaN(value) ? undefined : value))
            .min(0, t('Sets must be 0 or greater'))
            .nullable(),
          duration: Yup.number()
            .transform((value) => (isNaN(value) ? undefined : value))
            .min(0, t('Duration must be 0 or greater'))
            .nullable(),
          distance: Yup.number()
            .transform((value) => (isNaN(value) ? undefined : value))
            .min(0, t('Distance must be 0 or greater'))
            .nullable(),
          intensity: Yup.number()
            .transform((value) => (isNaN(value) ? undefined : value))
            .min(1, t('Intensity must be between 1 and 10'))
            .max(10, t('Intensity must be between 1 and 10'))
            .nullable(),
          incline: Yup.number()
            .transform((value) => (isNaN(value) ? undefined : value))
            .min(0, t('Incline must be 0 or greater'))
            .nullable()
        }),
        intermediate: Yup.object().shape({
          weight: Yup.number()
            .transform((value) => (isNaN(value) ? undefined : value))
            .min(0, t('Weight must be 0 or greater'))
            .nullable(),
          reps: Yup.number()
            .transform((value) => (isNaN(value) ? undefined : value))
            .min(0, t('Reps must be 0 or greater'))
            .nullable(),
          sets: Yup.number()
            .transform((value) => (isNaN(value) ? undefined : value))
            .min(0, t('Sets must be 0 or greater'))
            .nullable(),
          duration: Yup.number()
            .transform((value) => (isNaN(value) ? undefined : value))
            .min(0, t('Duration must be 0 or greater'))
            .nullable(),
          distance: Yup.number()
            .transform((value) => (isNaN(value) ? undefined : value))
            .min(0, t('Distance must be 0 or greater'))
            .nullable(),
          intensity: Yup.number()
            .transform((value) => (isNaN(value) ? undefined : value))
            .min(1, t('Intensity must be between 1 and 10'))
            .max(10, t('Intensity must be between 1 and 10'))
            .nullable(),
          incline: Yup.number()
            .transform((value) => (isNaN(value) ? undefined : value))
            .min(0, t('Incline must be 0 or greater'))
            .nullable()
        }),
        advanced: Yup.object().shape({
          weight: Yup.number()
            .transform((value) => (isNaN(value) ? undefined : value))
            .min(0, t('Weight must be 0 or greater'))
            .nullable(),
          reps: Yup.number()
            .transform((value) => (isNaN(value) ? undefined : value))
            .min(0, t('Reps must be 0 or greater'))
            .nullable(),
          sets: Yup.number()
            .transform((value) => (isNaN(value) ? undefined : value))
            .min(0, t('Sets must be 0 or greater'))
            .nullable(),
          duration: Yup.number()
            .transform((value) => (isNaN(value) ? undefined : value))
            .min(0, t('Duration must be 0 or greater'))
            .nullable(),
          distance: Yup.number()
            .transform((value) => (isNaN(value) ? undefined : value))
            .min(0, t('Distance must be 0 or greater'))
            .nullable(),
          intensity: Yup.number()
            .transform((value) => (isNaN(value) ? undefined : value))
            .min(1, t('Intensity must be between 1 and 10'))
            .max(10, t('Intensity must be between 1 and 10'))
            .nullable(),
          incline: Yup.number()
            .transform((value) => (isNaN(value) ? undefined : value))
            .min(0, t('Incline must be 0 or greater'))
            .nullable()
        })
      })
    });

  useEffect(() => {
    setIsEditable(user.isAdmin || !initialExercise?.isDefault);
  }, [initialExercise, user.isAdmin]);

  const initialValues = {
    name: initialExercise?.name || '',
    description: initialExercise?.description || '',
    target: initialExercise?.target || [],
    imageUrl: initialExercise?.imageUrl || '',
    category: initialExercise?.category || '',
    isDefault: initialExercise?.isDefault || false,
    recommendations: {
      beginner: {
        weight: 0,
        reps: 10,
        sets: 3,
        duration: 30,
        distance: 1,
        intensity: 5,
        incline: 0,
        ...initialExercise?.recommendations?.beginner
      },
      intermediate: {
        weight: 0,
        reps: 12,
        sets: 4,
        duration: 45,
        distance: 2,
        intensity: 7,
        incline: 1,
        ...initialExercise?.recommendations?.intermediate
      },
      advanced: {
        weight: 0,
        reps: 15,
        sets: 5,
        duration: 60,
        distance: 3,
        intensity: 9,
        incline: 2,
        ...initialExercise?.recommendations?.advanced
      }
    }
  };

  const handleSubmit = async (values, { setSubmitting, setFieldError }) => {
    try {
      let exerciseData = { ...values };
  
      if (values.category === 'Strength') {
        for (const level of experienceLevels) {
          const recommendations = values.recommendations[level];
          if (recommendations.weight < 0) {
            setFieldError(`recommendations.${level}.weight`, t('Weight cannot be negative'));
            setSubmitting(false);
            return;
          }
          if (recommendations.reps < 0) {
            setFieldError(`recommendations.${level}.reps`, t('Reps cannot be negative'));
            setSubmitting(false);
            return;
          }
          if (recommendations.sets < 0) {
            setFieldError(`recommendations.${level}.sets`, t('Sets cannot be negative'));
            setSubmitting(false);
            return;
          }
        }
      }
  
      if (values.category === 'Cardio') {
        for (const level of experienceLevels) {
          const recommendations = values.recommendations[level];
          if (recommendations.duration < 0) {
            setFieldError(`recommendations.${level}.duration`, t('Duration cannot be negative'));
            setSubmitting(false);
            return;
          }
          if (recommendations.distance < 0) {
            setFieldError(`recommendations.${level}.distance`, t('Distance cannot be negative'));
            setSubmitting(false);
            return;
          }
          if (recommendations.intensity < 1 || recommendations.intensity > 10) {
            setFieldError(`recommendations.${level}.intensity`, t('Intensity must be between 1 and 10'));
            setSubmitting(false);
            return;
          }
          if (recommendations.incline < 0) {
            setFieldError(`recommendations.${level}.incline`, t('Incline cannot be negative'));
            setSubmitting(false);
            return;
          }
        }
      }
  
      if (!user.isAdmin) {
        exerciseData.recommendations = {
          [user.experienceLevel]: values.recommendations[user.experienceLevel]
        };
      }
  
      const response = initialExercise
        ? await updateExercise(initialExercise._id, exerciseData)
        : values.isDefault && user.isAdmin
        ? await addDefaultExercise(exerciseData)
        : await addExercise(exerciseData);
  
      showToast('success', 'Success', t(initialExercise ? 'Exercise updated successfully' : 'Exercise added successfully'));
      onSave(response);
      setIsExpanded(false);
    } catch (error) {
      console.error('Error saving exercise:', error);
      if (error.response?.data?.errors) {
        Object.entries(error.response.data.errors).forEach(([field, message]) => {
          setFieldError(field, message);
        });
      } else {
        showToast('error', 'Error', t('Failed to save exercise'));
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mb-8">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="nav-btn mb-4 font-bold py-2 px-4 rounded"
      >
        {t(isExpanded ? 'Hide Form' : 'Add New Exercise')}
      </button>

      {isExpanded && (
        <Formik
          initialValues={initialValues}
          validationSchema={ExerciseSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ values, errors, touched, setFieldValue, isSubmitting }) => (
            <Form className="bg-white dark:bg-gray-800 shadow-md rounded px-8 pt-6 pb-8 mb-4">
              <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
                {t(initialExercise ? "Edit Exercise" : "Add New Exercise")}
              </h2>

              {/* Basic Information */}
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
                  {t("Exercise Name")}
                </label>
                <Field
                  name="name"
                  type="text"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-white leading-tight focus:outline-none focus:shadow-outline dark:bg-gray-700 dark:border-gray-600"
                  disabled={!isEditable}
                />
                <ErrorMessage name="name" component="div" className="text-red-500 text-xs italic" />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
                  {t("Description")}
                </label>
                <Field
                  as="textarea"
                  name="description"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-white leading-tight focus:outline-none focus:shadow-outline dark:bg-gray-700 dark:border-gray-600"
                  disabled={!isEditable}
                />
                <ErrorMessage name="description" component="div" className="text-red-500 text-xs italic" />
              </div>

              {/* Target Muscle Groups */}
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
                  {t("Target Muscle Groups")}
                </label>
                <div className="flex flex-wrap -mx-1">
                  {muscleGroups.map(group => (
                    <div key={group} className="px-1 mb-2">
                      <button
                        type="button"
                        onClick={() => {
                          const newTarget = values.target.includes(group)
                            ? values.target.filter(t => t !== group)
                            : [...values.target, group];
                          setFieldValue('target', newTarget);
                        }}
                        className={`py-1 px-2 rounded ${
                          values.target.includes(group)
                            ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                            : 'bg-gray-200 text-gray-700'
                        }`}
                        disabled={!isEditable}
                      >
                        {group}
                      </button>
                    </div>
                  ))}
                </div>
                <ErrorMessage name="target" component="div" className="text-red-500 text-xs italic" />
              </div>

              {/* Category Selection */}
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
                  {t("Category")}
                </label>
                <Field
                  as="select"
                  name="category"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-white leading-tight focus:outline-none focus:shadow-outline dark:bg-gray-700 dark:border-gray-600"
                  disabled={!isEditable}
                >
                  <option value="">{t("Select a category")}</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{t(cat)}</option>
                  ))}
                </Field>
                <ErrorMessage name="category" component="div" className="text-red-500 text-xs italic" />
              </div>

              {/* Image URL */}
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
                  {t("Image URL")}
                </label>
                <Field
                  name="imageUrl"
                  type="text"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-white leading-tight focus:outline-none focus:shadow-outline dark:bg-gray-700 dark:border-gray-600"
                  disabled={!isEditable}
                />
                <ErrorMessage name="imageUrl" component="div" className="text-red-500 text-xs italic" />
              </div>

              {/* Recommendations */}
              {(user.isAdmin || values.category === 'Strength' || values.category === 'Cardio') && (
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2 text-gray-700 dark:text-gray-300">
                  {t("Recommendations")}
                </h3>
                {(user.isAdmin ? experienceLevels : [user.experienceLevel]).map(level => (
                  <div key={level} className="mb-4">
                    <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t(level.charAt(0).toUpperCase() + level.slice(1))}
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {values.category === 'Strength' && (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                              {t("Weight (kg)")}
                            </label>
                            <Field
                              name={`recommendations.${level}.weight`}
                              type="number"
                              min="0"
                              className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
                            />
                            <FormErrorMessage name={`recommendations.${level}.weight`} />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                              {t("Reps")}
                            </label>
                            <Field
                              name={`recommendations.${level}.reps`}
                              type="number"
                              min="0"
                              className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
                            />
                            <FormErrorMessage name={`recommendations.${level}.reps`} />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                              {t("Sets")}
                            </label>
                            <Field
                              name={`recommendations.${level}.sets`}
                              type="number"
                              min="0"
                              className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
                            />
                            <FormErrorMessage name={`recommendations.${level}.sets`} />
                          </div>
                        </>
                      )}
                      {values.category === 'Cardio' && (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                              {t("Duration (min)")}
                            </label>
                            <Field
                              name={`recommendations.${level}.duration`}
                              type="number"
                              min="0"
                              className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
                            />
                            <FormErrorMessage name={`recommendations.${level}.duration`} />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                              {t("Distance (km)")}
                            </label>
                            <Field
                              name={`recommendations.${level}.distance`}
                              type="number"
                              min="0"
                              className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
                            />
                            <FormErrorMessage name={`recommendations.${level}.distance`} />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                              {t("Intensity (1-10)")}
                            </label>
                            <Field
                              name={`recommendations.${level}.intensity`}
                              type="number"
                              min="1"
                              max="10"
                              className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
                            />
                            <FormErrorMessage name={`recommendations.${level}.intensity`} />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                              {t("Incline (%)")}
                            </label>
                            <Field
                              name={`recommendations.${level}.incline`}
                              type="number"
                              min="0"
                              className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
                            />
                            <FormErrorMessage name={`recommendations.${level}.incline`} />
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

              {/* Admin Only - Default Exercise Toggle */}
              {user.isAdmin && (
                <div className="mb-4">
                  <label className="flex items-center">
                    <Field
                      type="checkbox"
                      name="isDefault"
                      className="form-checkbox h-5 w-5 text-emerald-500"
                    />
                    <span className="ml-2 text-gray-700 dark:text-gray-300">
                      {t("Set as Default Exercise (Admin Only)")}
                    </span>
                  </label>
                </div>
              )}

              {/* Form Buttons */}
              <div className="flex items-center justify-between mt-6">
                <button
                  type="submit"
                  disabled={!isEditable || isSubmitting}
                  className={`nav-btn ${(!isEditable || isSubmitting) ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {t(isSubmitting 
                    ? 'Saving...' 
                    : (initialExercise ? 'Update Exercise' : 'Add Exercise'))}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsExpanded(false);
                    onCancel?.();
                  }}
                  className="nav-btn"
                >
                  {t("Cancel")}
                </button>
              </div>

              {/* Non-editable Warning */}
              {!isEditable && (
                <p className="mt-4 text-red-500 text-sm">
                  {t("This is a default exercise created by an admin. You don't have permission to edit it.")}
                </p>
              )}

              {/* Form Errors Debug (Optional)
              {process.env.NODE_ENV === 'development' && Object.keys(errors).length > 0 && (
                <div className="mt-4 p-4 bg-red-100 dark:bg-red-900 rounded">
                  <pre className="text-xs">
                    {JSON.stringify(errors, null, 2)}
                  </pre>
                </div>
              )} */}
            </Form>
          )}
        </Formik>
      )}
    </div>
  );
}

export default AddExerciseForm;