import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import App from '../App';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { GymProvider } from '../context/GymContext';
import { ThemeProvider } from '../context/ThemeContext';

describe('App component', () => {
  it('renders without crashing', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <GymProvider>
            <ThemeProvider>
              <App />
            </ThemeProvider>
          </GymProvider>
        </AuthProvider>
      </BrowserRouter>
    );
    // This test passes if the component renders without throwing an error
  });
});