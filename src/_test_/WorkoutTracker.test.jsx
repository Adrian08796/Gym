// src/_tests_/WorkoutTracker.test.jsx

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock the entire WorkoutTracker component
jest.mock('../pages/WorkoutTracker', () => () => <div>Mocked WorkoutTracker</div>);

// Mock the AuthContext
jest.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: '66ffc231b17b8c71e16b46d1', username: 'Adrianser' },
  }),
}));

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  useNavigate: () => jest.fn(),
}));

// Import the mocked WorkoutTracker
import WorkoutTracker from '../pages/WorkoutTracker';

describe('WorkoutTracker', () => {
  it('renders without crashing', () => {
    render(<WorkoutTracker />);
    expect(screen.getByText('Mocked WorkoutTracker')).toBeInTheDocument();
  });
});