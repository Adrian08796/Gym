// src/components/WorkoutCalendar.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css'; // Import drag and drop styles
import { useGymContext } from '../context/GymContext';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext';

const localizer = momentLocalizer(moment);
const DnDCalendar = withDragAndDrop(Calendar); // Create a Calendar with drag and drop

// Define color scheme for different workout types
const workoutColors = {
  strength: '#FF6B6B',
  cardio: '#4ECDC4',
  flexibility: '#45B7D1',
  default: '#FFA07A'
};

function WorkoutCalendar() {
  const { workoutHistory, workoutPlans, updateWorkoutPlan } = useGymContext();
  const [events, setEvents] = useState([]);
  const navigate = useNavigate();
  const { addNotification } = useNotification();

  const getEventColor = useCallback((event) => {
    if (event.resource === 'history') {
      return workoutColors.default;
    }
    const plan = workoutPlans.find(p => p._id === event.id);
    return plan && plan.type ? workoutColors[plan.type] : workoutColors.default;
  }, [workoutPlans]);

  useEffect(() => {
    const historyEvents = workoutHistory.map(workout => ({
      id: workout._id,
      title: workout.planName || 'Completed Workout',
      start: new Date(workout.startTime),
      end: new Date(workout.endTime),
      allDay: false,
      resource: 'history'
    }));

    const scheduledEvents = workoutPlans
      .filter(plan => plan.scheduledDate)
      .map(plan => ({
        id: plan._id,
        title: plan.name,
        start: new Date(plan.scheduledDate),
        end: new Date(new Date(plan.scheduledDate).setHours(new Date(plan.scheduledDate).getHours() + 1)),
        allDay: false,
        resource: 'scheduled'
      }));

    setEvents([...historyEvents, ...scheduledEvents]);
  }, [workoutHistory, workoutPlans]);

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

  const handleSelectEvent = (event) => {
    if (event.resource === 'history') {
      navigate(`/workout-summary/${event.id}`);
    } else if (event.resource === 'scheduled') {
      navigate(`/plans/${event.id}`);
    }
  };

  const moveEvent = useCallback(
    ({ event, start, end }) => {
      if (event.resource === 'history') {
        addNotification('Cannot reschedule completed workouts', 'error');
        return;
      }

      setEvents(prev => {
        const existing = prev.find(ev => ev.id === event.id) ?? {};
        const filtered = prev.filter(ev => ev.id !== event.id);
        return [...filtered, { ...existing, start, end }];
      });

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
      if (event.resource === 'history') {
        addNotification('Cannot modify completed workouts', 'error');
        return;
      }

      setEvents(prev => {
        const existing = prev.find(ev => ev.id === event.id) ?? {};
        const filtered = prev.filter(ev => ev.id !== event.id);
        return [...filtered, { ...existing, start, end }];
      });

      const updatedPlan = workoutPlans.find(plan => plan._id === event.id);
      if (updatedPlan) {
        updatedPlan.scheduledDate = start;
        // You might want to store the duration separately in your backend
        updateWorkoutPlan(event.id, updatedPlan);
        addNotification('Workout duration updated successfully', 'success');
      }
    },
    [workoutPlans, updateWorkoutPlan, addNotification]
  );

  const eventPropGetter = useCallback(
    (event) => ({
      style: {
        backgroundColor: getEventColor(event)
      }
    }),
    [getEventColor]
  );

  return (
    <div className="h-screen p-4">
      <h2 className="text-2xl font-bold mb-4">Workout Calendar</h2>
      <DnDCalendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 'calc(100% - 80px)' }}
        onSelectSlot={handleSelectSlot}
        onSelectEvent={handleSelectEvent}
        onEventDrop={moveEvent}
        onEventResize={resizeEvent}
        selectable
        resizable
        eventPropGetter={eventPropGetter}
      />
    </div>
  );
}

export default WorkoutCalendar;