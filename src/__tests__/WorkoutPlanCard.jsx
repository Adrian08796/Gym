// src/__tests__/WorkoutPlanCard.test.jsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import WorkoutPlanCard from '../components/WorkoutPlanCard';
import { GymProvider } from '../context/GymContext';
import { ThemeProvider } from '../context/ThemeContext';
import { AuthProvider } from '../context/AuthContext';

const mockPlan = {
  _id: '1',
  name: 'Test Plan',
  exercises: [],
  type: 'strength',
};

test('renders WorkoutPlanCard with plan name', () => {
  render(
    <AuthProvider>
      <GymProvider>
        <ThemeProvider>
          <WorkoutPlanCard 
            plan={mockPlan}
            onStart={() => {}}
            onEdit={() => {}}
            onDelete={() => {}}
          />
        </ThemeProvider>
      </GymProvider>
    </AuthProvider>
  );

  const planNameElement = screen.getByText('Test Plan');
  expect(planNameElement).toBeInTheDocument();
});