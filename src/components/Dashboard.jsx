// src/components/Dashboard.jsx

import React, { useState, useEffect } from 'react';
import { useGymContext } from '../context/GymContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

function Dashboard() {
  const { workoutHistory } = useGymContext();
  const [totalWorkouts, setTotalWorkouts] = useState(0);
  const [averageWorkoutDuration, setAverageWorkoutDuration] = useState(0);
  const [workoutFrequencyData, setWorkoutFrequencyData] = useState([]);
  const [exerciseFrequencyData, setExerciseFrequencyData] = useState([]);
  const [workoutTypeData, setWorkoutTypeData] = useState([]);

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

      // Calculate workout types
    const typeCount = {};
    workoutHistory.forEach(workout => {
      const type = workout.plan ? workout.plan.type : 'other';
      typeCount[type] = (typeCount[type] || 0) + 1;
    });
    const typeData = Object.entries(typeCount).map(([name, value]) => ({ name, value }));
    setWorkoutTypeData(typeData);

  }, [workoutHistory]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div className="p-4 bg-background">
      <h2 className="text-3xl font-heading font-bold mb-6 text-primary">Workout Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-2 text-text">Total Workouts</h3>
          <p className="text-4xl font-bold text-primary">{totalWorkouts}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-2 text-text">Average Workout Duration</h3>
          <p className="text-4xl font-bold text-primary">{averageWorkoutDuration.toFixed(1)} minutes</p>
        </div>
      </div>
      <div className="mb-8">
        <h3 className="text-2xl font-semibold mb-4 text-text">Workout Frequency</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={workoutFrequencyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis allowDecimals={false} domain={[0, 'dataMax + 1']} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="count" stroke="#8884d8" activeDot={{ r: 8 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-2xl font-semibold mb-4 text-text">Top 10 Exercises</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={exerciseFrequencyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div>
          <h3 className="text-2xl font-semibold mb-4 text-text">Workout Types</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={workoutTypeData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {workoutTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;