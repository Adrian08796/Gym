// src/pages/WorkoutPlans.jsx

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';
import { useGymContext } from '../context/GymContext';
import { useNotification } from '../context/NotificationContext';
import { useTheme } from '../context/ThemeContext';
import WorkoutPlanForm from '../components/WorkoutPlanForm';
import WorkoutPlanCard from '../components/WorkoutPlanCard';
import WorkoutPlanModal from '../components/WorkoutPlanModal';

const localizer = momentLocalizer(moment);
const DnDCalendar = withDragAndDrop(Calendar);

const workoutColors = {
  strength: '#4CAF50',
  cardio: '#2196F3',
  flexibility: '#FF9800',
  default: '#9C27B0',
  completed: '#607D8B'
};

function WorkoutPlans() {
  const { 
    workoutPlans, 
    workoutHistory, 
    deleteWorkoutPlan, 
    addWorkoutPlan, 
    updateWorkoutPlan, 
    fetchWorkoutPlans
  } = useGymContext();
  const [showForm, setShowForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [ongoingWorkout, setOngoingWorkout] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedPlan, setSelectedPlan] = useState(null);
  const navigate = useNavigate();
  const { addNotification } = useNotification();
  const { darkMode } = useTheme();

  useEffect(() => {
    const storedPlan = localStorage.getItem('currentPlan');
    if (storedPlan) {
      setOngoingWorkout(JSON.parse(storedPlan));
    }
  }, []);

  const handleStartWorkout = (plan) => {
    localStorage.setItem('currentPlan', JSON.stringify(plan));
    navigate('/tracker');
  };

  const handleResumeWorkout = () => {
    navigate('/tracker');
  };

  const handleAddWorkoutPlan = async (plan) => {
    try {
      await addWorkoutPlan(plan);
      handleCancelForm();
      await fetchWorkoutPlans();
      addNotification('Workout plan added successfully', 'success');
    } catch (error) {
      console.error('Error adding workout plan:', error);
      addNotification('Failed to add workout plan', 'error');
    }
  };

  const handleEditWorkoutPlan = async (plan) => {
    try {
      await updateWorkoutPlan(plan._id, plan);
      handleCancelForm();
      await fetchWorkoutPlans();
      addNotification('Workout plan updated successfully', 'success');
    } catch (error) {
      console.error('Error updating workout plan:', error);
      addNotification('Failed to update workout plan', 'error');
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingPlan(null);
  };

  const handleEdit = (plan) => {
    setEditingPlan(plan);
    setShowForm(true);
  };

  const handleDelete = async (planId) => {
    try {
      await deleteWorkoutPlan(planId);
      addNotification('Workout plan deleted successfully', 'success');
      fetchWorkoutPlans(); // Refresh the workout plans after deleting
    } catch (error) {
      console.error('Error deleting workout plan:', error);
      addNotification('Failed to delete workout plan', 'error');
    }
  };

  const filteredPlans = workoutPlans.filter(plan => 
    plan.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (filterType === 'all' || plan.type === filterType)
  );

  // Calendar-related functions
  const getEventColor = useCallback((event) => {
    if (event.resource === 'history' || event.resource === 'completed') {
      return workoutColors.completed;
    }
    const plan = filteredPlans.find(p => p._id === event.id);
    return plan && plan.type ? workoutColors[plan.type] : workoutColors.default;
  }, [filteredPlans]);

  const events = useMemo(() => {
    const historyEvents = workoutHistory.map(workout => ({
      id: workout._id,
      title: `${workout.planName} (Completed)`,
      start: new Date(workout.startTime),
      end: new Date(workout.endTime),
      allDay: false,
      resource: 'history'
    }));

    const planEvents = filteredPlans
      .filter(plan => plan.scheduledDate)
      .map(plan => ({
        id: plan._id,
        title: plan.name,
        start: new Date(plan.scheduledDate),
        end: new Date(new Date(plan.scheduledDate).setHours(new Date(plan.scheduledDate).getHours() + 1)),
        allDay: false,
        resource: plan.completed ? 'completed' : 'scheduled'
      }));

    return [...historyEvents, ...planEvents];
  }, [workoutHistory, filteredPlans]);

  const handleSelectEvent = useCallback((event) => {
    if (event.resource === 'history') {
      navigate(`/workout-summary/${event.id}`);
    } else {
      const plan = filteredPlans.find(p => p._id === event.id);
      setSelectedPlan(plan);
    }
  }, [filteredPlans, navigate]);

  const handleSelectSlot = useCallback(({ start }) => {
    const planName = prompt('Enter workout plan name:');
    if (planName) {
      const workoutType = prompt('Enter workout type (strength, cardio, flexibility):');
      const newPlan = {
        name: planName,
        exercises: [],
        scheduledDate: start,
        type: workoutType
      };
      addWorkoutPlan(newPlan);
    }
  }, [addWorkoutPlan]);

  const moveEvent = useCallback(({ event, start, end }) => {
    if (event.resource === 'history' || event.resource === 'completed') {
      addNotification('Cannot reschedule completed workouts', 'error');
      return;
    }

    const updatedPlan = filteredPlans.find(plan => plan._id === event.id);
    if (updatedPlan) {
      updatedPlan.scheduledDate = start;
      updateWorkoutPlan(updatedPlan._id, updatedPlan);
      addNotification('Workout rescheduled successfully', 'success');
    }
  }, [filteredPlans, updateWorkoutPlan, addNotification]);

  const resizeEvent = useCallback(({ event, start, end }) => {
    if (event.resource === 'history' || event.resource === 'completed') {
      addNotification('Cannot modify completed workouts', 'error');
      return;
    }

    const updatedPlan = filteredPlans.find(plan => plan._id === event.id);
    if (updatedPlan) {
      updatedPlan.scheduledDate = start;
      updateWorkoutPlan(updatedPlan._id, updatedPlan);
      addNotification('Workout duration updated successfully', 'success');
    }
  }, [filteredPlans, updateWorkoutPlan, addNotification]);

  const eventPropGetter = useCallback((event) => {
    const backgroundColor = getEventColor(event);
    return {
      style: {
        backgroundColor,
        borderRadius: '5px',
        opacity: event.resource === 'history' || event.resource === 'completed' ? 0.7 : 1,
        color: '#fff',
        border: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '14px',
        fontWeight: '500',
        cursor: event.resource === 'history' || event.resource === 'completed' ? 'not-allowed' : 'pointer'
      }
    };
  }, [getEventColor]);

  return (
    <div className={`p-4 ${darkMode ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-900'}`}>
      <h1 className="text-3xl font-bold mb-4">Workout Plans</h1>
      
      {ongoingWorkout && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4" role="alert">
          <p className="font-bold">Ongoing Workout</p>
          <p>You have an unfinished workout: {ongoingWorkout.name}</p>
          <button
            onClick={handleResumeWorkout}
            className="mt-2 bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded"
          >
            Resume Workout
          </button>
        </div>
      )}

      <div className="mb-4 flex flex-wrap items-center justify-between">
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingPlan(null);
          }}
          className="bg-emerald-500 text-white hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700 hover:shadow-md font-bold py-1 px-3 rounded"
        >
          {showForm ? 'Hide Form' : 'Create New Plan'}
        </button>
        
        <div className="flex items-center space-x-2">
          <input
            type="text"
            placeholder="Search plans..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border rounded py-1 px-2 text-gray-700"
          />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="border rounded py-1 px-2 text-gray-700"
          >
            <option value="all">All Types</option>
            <option value="strength">Strength</option>
            <option value="cardio">Cardio</option>
            <option value="flexibility">Flexibility</option>
            <option value="other">Other</option>
          </select>
          <button
            onClick={() => setViewMode(viewMode === 'grid' ? 'calendar' : 'grid')}
            className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-1 px-2 rounded"
          >
            {viewMode === 'grid' ? 'Calendar View' : 'Grid View'}
          </button>
        </div>
      </div>

      {showForm && (
        <WorkoutPlanForm
          onSubmit={editingPlan ? handleEditWorkoutPlan : handleAddWorkoutPlan}
          initialPlan={editingPlan}
          onCancel={handleCancelForm}
        />
      )}

      {viewMode === 'grid' ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredPlans.map((plan) => (
            <WorkoutPlanCard
              key={plan._id}
              plan={plan}
              onStart={handleStartWorkout}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <div className="h-[600px]">
          <DnDCalendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: '100%' }}
            onSelectSlot={handleSelectSlot}
            onSelectEvent={handleSelectEvent}
            onEventDrop={moveEvent}
            onEventResize={resizeEvent}
            selectable
            resizable
            eventPropGetter={eventPropGetter}
            draggableAccessor={(event) => event.resource !== 'history' && event.resource !== 'completed'}
            views={['month', 'week', 'day']}
            defaultView="month"
            formats={{
              monthHeaderFormat: (date, culture, localizer) =>
                localizer.format(date, 'MMMM YYYY', culture),
              dayHeaderFormat: (date, culture, localizer) =>
                localizer.format(date, 'dddd, MMMM D', culture),
            }}
            components={{
              toolbar: CustomToolbar,
            }}
          />
        </div>
      )}
      {selectedPlan && (
        <WorkoutPlanModal
          plan={selectedPlan}
          onClose={() => setSelectedPlan(null)}
          onEdit={handleEdit}
          onStart={handleStartWorkout}
        />
      )}
    </div>
  );
}

// Custom toolbar component for the calendar
const CustomToolbar = (toolbar) => {
  const goToBack = () => {
    toolbar.date.setMonth(toolbar.date.getMonth() - 1);
    toolbar.onNavigate('prev');
  };

  const goToNext = () => {
    toolbar.date.setMonth(toolbar.date.getMonth() + 1);
    toolbar.onNavigate('next');
  };

  const goToCurrent = () => {
    const now = new Date();
    toolbar.date.setMonth(now.getMonth());
    toolbar.date.setYear(now.getFullYear());
    toolbar.onNavigate('current');
  };

  const label = () => {
    const date = moment(toolbar.date);
    return (
      <span className="text-lg font-semibold">{date.format('MMMM YYYY')}</span>
    );
  };

  return (
    <div className="flex justify-between items-center mb-4">
      <div>
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2"
          onClick={goToBack}
        >
          &lt;
        </button>
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={goToNext}
        >
          &gt;
        </button>
      </div>
      <div>{label()}</div>
      <button
        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
        onClick={goToCurrent}
      >
        Today
      </button>
    </div>
  );
};

export default WorkoutPlans;