// src/components/WorkoutCalendar.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';
import { useGymContext } from '../context/GymContext';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext';
import { useTheme } from '../context/ThemeContext';
import WorkoutPlanModal from './WorkoutPlanModal';
import './WorkoutCalendar.css';

const localizer = momentLocalizer(moment);
const DnDCalendar = withDragAndDrop(Calendar);

const workoutColors = {
  strength: '#4CAF50',
  cardio: '#2196F3',
  flexibility: '#FF9800',
  default: '#9C27B0',
  completed: '#607D8B'
};

function WorkoutCalendar() {
  const { workoutHistory, workoutPlans, updateWorkoutPlan } = useGymContext();
  const [events, setEvents] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const navigate = useNavigate();
  const { addNotification } = useNotification();
  const { darkMode } = useTheme();

  const getEventColor = useCallback((event) => {
    if (event.resource === 'history' || event.resource === 'completed') {
      return workoutColors.completed;
    }
    const plan = workoutPlans.find(p => p._id === event.id);
    return plan && plan.type ? workoutColors[plan.type] : workoutColors.default;
  }, [workoutPlans]);

  useEffect(() => {
    const historyEvents = workoutHistory.map(workout => ({
      id: workout._id,
      title: `${workout.planName} (Completed)`,
      start: new Date(workout.startTime),
      end: new Date(workout.endTime),
      allDay: false,
      resource: 'history'
    }));

    const planEvents = workoutPlans
      .filter(plan => plan.scheduledDate)
      .map(plan => ({
        id: plan._id,
        title: plan.name,
        start: new Date(plan.scheduledDate),
        end: new Date(new Date(plan.scheduledDate).setHours(new Date(plan.scheduledDate).getHours() + 1)),
        allDay: false,
        resource: plan.completed ? 'completed' : 'scheduled'
      }));

    setEvents([...historyEvents, ...planEvents]);
  }, [workoutHistory, workoutPlans]);

  const handleSelectEvent = (event) => {
    if (event.resource === 'history') {
      navigate(`/workout-summary/${event.id}`);
    } else {
      const plan = workoutPlans.find(p => p._id === event.id);
      setSelectedPlan(plan);
    }
  };

  const handleSelectSlot = ({ start }) => {
    const planName = prompt('Enter workout plan name:');
    if (planName) {
      const workoutType = prompt('Enter workout type (strength, cardio, flexibility):');
      const newPlan = {
        name: planName,
        exercises: [],
        scheduledDate: start,
        type: workoutType
      };
      updateWorkoutPlan(null, newPlan);
    }
  };

  const moveEvent = useCallback(
    ({ event, start, end }) => {
      if (event.resource === 'history' || event.resource === 'completed') {
        addNotification('Cannot reschedule completed workouts', 'error');
        return;
      }

      const updatedPlan = workoutPlans.find(plan => plan._id === event.id);
      if (updatedPlan) {
        updatedPlan.scheduledDate = start;
        updateWorkoutPlan(event.id, updatedPlan);
        addNotification('Workout rescheduled successfully', 'success');
      }
    },
    [workoutPlans, updateWorkoutPlan, addNotification]
  );

  const resizeEvent = useCallback(
    ({ event, start, end }) => {
      if (event.resource === 'history' || event.resource === 'completed') {
        addNotification('Cannot modify completed workouts', 'error');
        return;
      }

      const updatedPlan = workoutPlans.find(plan => plan._id === event.id);
      if (updatedPlan) {
        updatedPlan.scheduledDate = start;
        updateWorkoutPlan(event.id, updatedPlan);
        addNotification('Workout duration updated successfully', 'success');
      }
    },
    [workoutPlans, updateWorkoutPlan, addNotification]
  );

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
    <div className={`h-screen p-4 ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
      <h2 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Workout Calendar</h2>
      <div className={`${darkMode ? 'bg-gray-700' : 'bg-white'} rounded-lg shadow-lg p-4`} style={{ height: 'calc(100% - 80px)' }}>
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
      {selectedPlan && (
        <WorkoutPlanModal
          plan={selectedPlan}
          onClose={() => setSelectedPlan(null)}
        />
      )}
    </div>
  );
}

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

export default WorkoutCalendar;