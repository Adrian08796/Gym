// src/components/Dashboard.jsx

import React, { useState, useEffect } from 'react';
import { useGymContext } from '../context/GymContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

function Dashboard() {
  const { workoutHistory } = useGymContext();
  const [totalWorkouts, setTotalWorkouts] = useState(0);
  const [averageWorkoutDuration, setAverageWorkoutDuration] = useState(0);
  const [workoutFrequencyData, setWorkoutFrequencyData] = useState([]);
  const [exerciseFrequencyData, setExerciseFrequencyData] = useState([]);

  useEffect(() => {
    if (workoutHistory.length > 0) {
      // Calculate total workouts
      setTotalWorkouts(workoutHistory.length);

      // Calculate average workout duration
      const totalDuration = workoutHistory.reduce((sum, workout) => {
        const duration = new Date(workout.endTime) - new Date(workout.startTime);
        return sum + duration;
      }, 0);
      setAverageWorkoutDuration(totalDuration / workoutHistory.length / (1000 * 60)); // Convert to minutes

      // Prepare data for workout frequency chart
      const frequencyMap = {};
      workoutHistory.forEach(workout => {
        const date = new Date(workout.startTime).toLocaleDateString();
        frequencyMap[date] = (frequencyMap[date] || 0) + 1;
      });
      const frequencyData = Object.entries(frequencyMap).map(([date, count]) => ({ date, count }));
      setWorkoutFrequencyData(frequencyData);

      // Prepare data for exercise frequency chart
      const exerciseMap = {};
      workoutHistory.forEach(workout => {
        workout.exercises.forEach(exercise => {
          const exerciseName = exercise.exercise ? exercise.exercise.name : 'Unknown';
          exerciseMap[exerciseName] = (exerciseMap[exerciseName] || 0) + 1;
        });
      });
      const exerciseData = Object.entries(exerciseMap)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10); // Top 10 exercises
      setExerciseFrequencyData(exerciseData);
    }
  }, [workoutHistory]);

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Workout Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-lg font-semibold mb-2">Total Workouts</h3>
          <p className="text-3xl font-bold">{totalWorkouts}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-lg font-semibold mb-2">Average Workout Duration</h3>
          <p className="text-3xl font-bold">{averageWorkoutDuration.toFixed(1)} minutes</p>
        </div>
        </div>
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4">Workout Frequency</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={workoutFrequencyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis 
              allowDecimals={false}
              domain={[0, 'dataMax + 1']}
              tickCount={5}
            />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="count" stroke="#8884d8" activeDot={{ r: 8 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div>
        <h3 className="text-xl font-semibold mb-4">Top 10 Exercises</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={exerciseFrequencyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis 
              allowDecimals={false}
              domain={[0, 'dataMax + 1']}
              tickCount={5}
            />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default Dashboard;