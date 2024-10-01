// src/components/UserProfile.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useGymContext } from '../context/GymContext';
import { useTheme } from '../context/ThemeContext';
import { FiEdit2, FiSave, FiX, FiLock } from 'react-icons/fi';

function UserProfile() {
  const { user, updateUser, changePassword, updateExperienceLevel } = useAuth();
  const { workoutHistory, showToast } = useGymContext();
  const { darkMode } = useTheme();

  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('beginner');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

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
      showToast('success', 'Success', 'Profile updated successfully');
    } catch (error) {
      showToast('error', 'Error', 'Failed to update profile');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      showToast('error', 'Error', 'New passwords do not match');
      return;
    }
    try {
      await changePassword(currentPassword, newPassword);
      setIsChangingPassword(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      showToast('success', 'Success', 'Password changed successfully');
    } catch (error) {
      showToast('error', 'Error', 'Failed to change password');
    }
  };

  const handleExperienceLevelChange = async (e) => {
    const newLevel = e.target.value;
    try {
      await updateExperienceLevel(newLevel);
      setExperienceLevel(newLevel);
      showToast('success', 'Success', 'Experience level updated successfully');
    } catch (error) {
      console.error('Failed to update experience level:', error);
      showToast('error', 'Error', `Failed to update experience level: ${error.message}`);
    }
  };

  const totalWorkouts = workoutHistory.length;
  const totalDuration = workoutHistory.reduce((sum, workout) => {
    return sum + (new Date(workout.endTime) - new Date(workout.startTime));
  }, 0);
  const averageDuration = totalWorkouts > 0 ? totalDuration / totalWorkouts / (1000 * 60) : 0;

  return (
    <>
      <h1 data-aos="fade-up" className="header text-3xl font-bold mb-6 text-center">
        User <span className='headerSpan'>Profile</span>
      </h1>
      <div className={`container mx-auto mt-8 p-4 ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}>
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Profile Information</h2>
          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="username" className="block mb-1">Username</label>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={`w-full p-2 rounded ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-800'}`}
                />
              </div>
              <div>
                <label htmlFor="email" className="block mb-1">Email</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full p-2 rounded ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-800'}`}
                />
              </div>
              <div>
                <label htmlFor="experienceLevel" className="block mb-1">Experience Level</label>
                <select
                  id="experienceLevel"
                  value={experienceLevel}
                  onChange={handleExperienceLevelChange}
                  className={`w-full p-2 rounded ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-800'}`}
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              <div className="flex space-x-2">
                <button type="submit" className="flex items-center bg-emerald-500 text-white hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700 hover:shadow-md font-bold py-1 px-3 rounded">
                  <FiSave className="mr-2" /> Save
                </button>
                <button type="button" onClick={() => setIsEditing(false)} className="flex items-center bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
                  <FiX className="mr-2" /> Cancel
                </button>
              </div>
            </form>
          ) : (
            <div>
              <p><strong>Username:</strong> {user?.username}</p>
              <p><strong>Email:</strong> {user?.email}</p>
              <p><strong>Experience Level:</strong> {experienceLevel.charAt(0).toUpperCase() + experienceLevel.slice(1)}</p>
              <button onClick={() => setIsEditing(true)} className="flex items-center mt-4 bg-emerald-500 text-white hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700 hover:shadow-md font-bold py-1 px-3 rounded">
                <FiEdit2 className="mr-2" /> Edit Profile
              </button>
            </div>
          )}
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Change Password</h2>
          {isChangingPassword ? (
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label htmlFor="currentPassword" className="block mb-1">Current Password</label>
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
                <label htmlFor="newPassword" className="block mb-1">New Password</label>
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
                <label htmlFor="confirmNewPassword" className="block mb-1">Confirm New Password</label>
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
                  <FiSave className="mr-2" /> Change Password
                </button>
                <button type="button" onClick={() => setIsChangingPassword(false)} className="flex items-center bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
                  <FiX className="mr-2" /> Cancel
                </button>
              </div>
            </form>
          ) : (
            <button onClick={() => setIsChangingPassword(true)} className="flex items-center bg-emerald-500 text-white hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700 hover:shadow-md font-bold py-1 px-3 rounded">
              <FiLock className="mr-2" /> Change Password
            </button>
          )}
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-4">Workout Statistics</h2>
          <p><strong>Total Workouts:</strong> {totalWorkouts}</p>
          <p><strong>Average Workout Duration:</strong> {averageDuration.toFixed(1)} minutes</p>
        </div>
      </div>
    </>
  );
}

export default UserProfile;