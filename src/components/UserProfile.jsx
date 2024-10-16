// src/components/UserProfile.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useGymContext } from '../context/GymContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { FiEdit2, FiSave, FiX, FiLock, FiTrash2 } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';

function UserProfile() {
  const { t } = useTranslation();
  const { user, updateUser, changePassword, updateExperienceLevel, deleteAccount } = useAuth();
  const { workoutHistory, showToast, confirm } = useGymContext();
  const { darkMode } = useTheme();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('beginner');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isConfirmingCancel, setIsConfirmingCancel] = useState(false);

  useEffect(() => {
    if (user) {
      setUsername(user.username);
      setEmail(user.email);
      setExperienceLevel(user.experienceLevel || 'beginner');
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateUser({ username, email, experienceLevel });
      setIsEditing(false);
      showToast('success', 'Success', t("Profile updated successfully"));
    } catch (error) {
      showToast('error', 'Error', t("Failed to update profile"));
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      showToast('error', 'Error', t("New passwords do not match"));
      return;
    }
    try {
      await changePassword(currentPassword, newPassword);
      setIsChangingPassword(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      showToast('success', 'Success', t("Password changed successfully"));
    } catch (error) {
      showToast('error', 'Error', t("Failed to change password"));
    }
  };

  const handleExperienceLevelChange = async (e) => {
    const newLevel = e.target.value;
    try {
      await updateExperienceLevel(newLevel);
      setExperienceLevel(newLevel);
      showToast('success', 'Success', t("Experience level updated successfully"));
    } catch (error) {
      console.error('Failed to update experience level:', error);
      showToast('error', 'Error', `Failed to update experience level: ${error.message}`);
    }
  };

  const handleDeleteAccount = () => {
    if (isConfirmingCancel) return;
    setIsConfirmingCancel(true);
    confirm({
      message: 'Are you sure you want to delete your account? This action cannot be undone.',
      header: 'Delete Account',
      icon: 'pi pi-exclamation-triangle',
      acceptClassName: 'custom-nav-btn custom-nav-btn-danger',
      rejectClassName: 'custom-nav-btn',
      acceptLabel: 'Yes, Delete',
      rejectLabel: 'No, Continue',
      className: 'custom-confirm-dialog',
      style: { width: '350px' },
      contentClassName: 'confirm-content',
      headerClassName: 'confirm-header',
      defaultFocus: 'reject',
      closable: false,
      accept: async () => {
        try {
          await deleteAccount();
          showToast('success', 'Success', t("Your account has been deleted successfully"));
          navigate('/');
        } catch (error) {
          showToast('error', 'Error', `Failed to delete account: ${error.message}`);
        }
      },
      reject: () => {
        setIsConfirmingCancel(false);
      }
    });
  };

  const totalWorkouts = workoutHistory.length;
  const totalDuration = workoutHistory.reduce((sum, workout) => {
    return sum + (new Date(workout.endTime) - new Date(workout.startTime));
  }, 0);
  const averageDuration = totalWorkouts > 0 ? totalDuration / totalWorkouts / (1000 * 60) : 0;

  return (
    <>
      <h1 data-aos="fade-up" className="header text-3xl text-gray-800 dark:text-white font-bold mb-6 text-center">
      {t("User")} <span className='headerSpan'>{t("Profile")}</span>
      </h1>
      <div className={`container mx-auto mt-8 p-4 ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}>
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">{t("Profile Information")}</h2>
          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="username" className="block mb-1">{t("Username")}</label>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={`w-full p-2 rounded ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-800'}`}
                />
              </div>
              <div>
                <label htmlFor="email" className="block mb-1">{t("Email")}</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full p-2 rounded ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-800'}`}
                />
              </div>
              <div>
                <label htmlFor="experienceLevel" className="block mb-1">{t("Experience Level")}</label>
                <select
                  id="experienceLevel"
                  value={experienceLevel}
                  onChange={handleExperienceLevelChange}
                  className={`w-full p-2 rounded ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-800'}`}
                >
                  <option value="beginner">{t("Beginner")}</option>
                  <option value="intermediate">{t("Intermediate")}</option>
                  <option value="advanced">{t("Advanced")}</option>
                </select>
              </div>
              <div className="flex space-x-2">
                <button type="submit" className="flex items-center bg-emerald-500 text-white hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700 hover:shadow-md font-bold py-1 px-3 rounded">
                  <FiSave className="mr-2" /> {t("Save")}
                </button>
                <button type="button" onClick={() => setIsEditing(false)} className="flex items-center bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
                  <FiX className="mr-2" /> {t("Cancel")}
                </button>
              </div>
            </form>
          ) : (
            <div>
              <p><strong>{t("Username")}:</strong> {user?.username}</p>
              <p><strong>{t("Email")}:</strong> {user?.email}</p>
              <p><strong>{t("Experience Level")}:</strong> {t(experienceLevel.charAt(0).toUpperCase() + experienceLevel.slice(1))}</p>
              <button onClick={() => setIsEditing(true)} className="flex items-center mt-4 bg-emerald-500 text-white hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700 hover:shadow-md font-bold py-1 px-3 rounded">
                <FiEdit2 className="mr-2" /> {t("Edit Profile")}
              </button>
            </div>
          )}
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">{t("Change Password")}</h2>
          {isChangingPassword ? (
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label htmlFor="currentPassword" className="block mb-1">{t("Current Password")}</label>
                <input
                  type="password"
                  id="currentPassword"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className={`w-full p-2 rounded ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-800'}`}
                  required
                />
              </div>
              <div>
                <label htmlFor="newPassword" className="block mb-1">{t("New Password")}</label>
                <input
                  type="password"
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={`w-full p-2 rounded ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-800'}`}
                  required
                />
              </div>
              <div>
                <label htmlFor="confirmNewPassword" className="block mb-1">{t("Confirm New Password")}</label>
                <input
                  type="password"
                  id="confirmNewPassword"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  className={`w-full p-2 rounded ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-800'}`}
                  required
                />
              </div>
              <div className="flex space-x-2">
                <button type="submit" className="flex items-center bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
                  <FiSave className="mr-2" /> {t("Change Password")}
                </button>
                <button type="button" onClick={() => setIsChangingPassword(false)} className="flex items-center bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
                  <FiX className="mr-2" /> {t("Cancel")}
                </button>
              </div>
            </form>
          ) : (
            <button onClick={() => setIsChangingPassword(true)} className="flex items-center bg-emerald-500 text-white hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700 hover:shadow-md font-bold py-1 px-3 rounded">
              <FiLock className="mr-2" /> {t("Change Password")}
            </button>
          )}
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-4">{t("Workout Statistics")}</h2>
          <p><strong>{t("Total Workouts")}:</strong> {totalWorkouts}</p>
          <p><strong>{t("Average Workout Duration:")}</strong> {averageDuration.toFixed(1)} {t("minutes")}</p>
        </div>
        <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">{t("Danger Zone")}</h2>
        <button
          onClick={handleDeleteAccount}
          className="flex items-center bg-red-500 text-white hover:bg-red-600 font-bold py-2 px-4 rounded"
        >
          <FiTrash2 className="mr-2" /> {t("Delete Account")}
        </button>
        <p className="mt-2 text-sm text-gray-500">
          {t("Deleting your account will permanently remove all your data, including workouts, plans, and exercises.")}
        </p>
      </div>
     </div>
    </>
  );
}

export default UserProfile;