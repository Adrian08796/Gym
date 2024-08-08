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
import WorkoutPlanModal from './WorkoutPlanModal';

const localizer = momentLocalizer(moment);
const DnDCalendar = withDragAndDrop(Calendar);

const workoutColors = {
  strength: '#FF6B6B',
  cardio: '#4ECDC4',
  flexibility: '#45B7D1',
  default: '#FFA07A',
  completed: '#A9A9A9'
};

function WorkoutCalendar() {
  const { workoutHistory, workoutPlans, updateWorkoutPlan } = useGymContext();
  const [events, setEvents] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const navigate = useNavigate();
  const { addNotification } = useNotification();

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
        opacity: event.resource === 'history' || event.resource === 'completed' ? 0.7 : 1,
        cursor: event.resource === 'history' || event.resource === 'completed' ? 'not-allowed' : 'pointer'
      }
    };
  }, [getEventColor]);

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
        draggableAccessor={(event) => event.resource !== 'history' && event.resource !== 'completed'}
      />
      {selectedPlan && (
        <WorkoutPlanModal
          plan={selectedPlan}
          onClose={() => setSelectedPlan(null)}
        />
      )}
    </div>
  );
}

export default WorkoutCalendar;