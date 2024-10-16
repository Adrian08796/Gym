import React, { useState, useEffect } from 'react';
import { useGymContext } from '../context/GymContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { FiActivity, FiClock, FiBarChart, FiPieChart } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';

function Dashboard() {
  const { workoutHistory } = useGymContext();
  const [totalWorkouts, setTotalWorkouts] = useState(0);
  const [averageWorkoutDuration, setAverageWorkoutDuration] = useState(0);
  const [workoutFrequencyData, setWorkoutFrequencyData] = useState([]);
  const [exerciseFrequencyData, setExerciseFrequencyData] = useState([]);
  const [workoutTypeData, setWorkoutTypeData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    if (workoutHistory.length > 0) {
      setIsLoading(false);
      setTotalWorkouts(workoutHistory.length);

      const totalDuration = workoutHistory.reduce((sum, workout) => {
        const duration = new Date(workout.endTime) - new Date(workout.startTime);
        return sum + duration;
      }, 0);
      setAverageWorkoutDuration(totalDuration / workoutHistory.length / (1000 * 60));

      const frequencyMap = {};
      const exerciseMap = {};
      const typeCount = {};

      workoutHistory.forEach(workout => {
        const date = new Date(workout.startTime).toLocaleDateString();
        frequencyMap[date] = (frequencyMap[date] || 0) + 1;

        workout.exercises.forEach(exercise => {
          const exerciseName = exercise.exercise ? exercise.exercise.name : 'Unknown';
          exerciseMap[exerciseName] = (exerciseMap[exerciseName] || 0) + 1;
        });

        const type = workout.plan ? workout.plan.type : 'other';
        typeCount[type] = (typeCount[type] || 0) + 1;
      });

      setWorkoutFrequencyData(Object.entries(frequencyMap).map(([date, count]) => ({ date, count })));
      setExerciseFrequencyData(Object.entries(exerciseMap)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10));
      setWorkoutTypeData(Object.entries(typeCount).map(([name, value]) => ({ name, value })));
    } else {
      setIsLoading(false);
    }
  }, [workoutHistory]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  const StatCard = ({ icon, title, value, color }) => (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 transition-all duration-300 hover:shadow-xl`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className={`p-3 rounded-full ${color} text-white mr-4`}>
            {icon}
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
            <p className="text-2xl font-semibold text-gray-700 dark:text-gray-200">{value}</p>
          </div>
        </div>
      </div>
    </div>
  );

  const ChartCard = ({ title, children }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 transition-all duration-300 hover:shadow-xl">
      <h3 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-200">{title}</h3>
      {children}
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (workoutHistory.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <FiActivity className="text-6xl text-gray-400 mb-4" />
        <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200 mb-2">{t("No Workout Data Yet")}</h2>
        <p className="text-gray-500 dark:text-gray-400">{t("Start logging your workouts to see your progress!")}</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-100 dark:bg-gray-900 min-h-screen">
      <h2 data-aos="fade-up" className="header text-center text-3xl font-bold mb-8 text-gray-800 dark:text-white">{t("Workout")} <span className='headerSpan'>{t("Dashboard")}</span></h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <StatCard 
          icon={<FiActivity className="h-6 w-6" />}
          title={t("Total Workouts")}
          value={totalWorkouts}
          color="bg-#111827"
        />
        <StatCard 
          icon={<FiClock className="h-6 w-6" />}
          title={t("Average Workout Duration")}
          value={`${averageWorkoutDuration.toFixed(1)} ${t("minutes")}`}
          color="bg-#111827"
        />
      </div>

      {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <ChartCard title="Workout Frequency">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={workoutFrequencyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="count" stroke="#8884d8" activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Top 10 Exercises">
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
        </ChartCard>
      </div> */}

      {/* <ChartCard title="Workout Types">
        <div className="flex justify-center">
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
      </ChartCard> */}
    </div>
  );
}

export default Dashboard;