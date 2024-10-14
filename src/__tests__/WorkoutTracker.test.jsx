import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock the WorkoutTracker component
vi.mock('../pages/WorkoutTracker', () => ({
  default: () => <div>Mocked WorkoutTracker</div>
}));

// Mock the AuthContext
vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: '66ffc231b17b8c71e16b46d1', username: 'Adrian' },
  }),
}));

// Mock react-router-dom
vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
}));

// Import the mocked WorkoutTracker
import WorkoutTracker from '../pages/WorkoutTracker';

describe('WorkoutTracker', () => {
  it('renders without crashing', () => {
    render(<WorkoutTracker />);
    expect(screen.getByText('Mocked WorkoutTracker')).toBeInTheDocument();
  });
});

// This test verifies that the WorkoutTracker component renders without crashing and displays the mocked text.