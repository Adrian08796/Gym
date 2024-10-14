import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import Login from '../components/Login';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { GymProvider } from '../context/GymContext';
import { ThemeProvider } from '../context/ThemeContext';

describe('Login component', () => {
  it('renders form with username and password inputs', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <GymProvider>
            <ThemeProvider>
              <Login />
            </ThemeProvider>
          </GymProvider>
        </AuthProvider>
      </BrowserRouter>
    );
    
    const usernameInput = screen.getByLabelText(/Username/i);
    const passwordInput = screen.getByLabelText(/Password/i);
    const loginButton = screen.getByRole('button', { name: /Login/i });

    expect(usernameInput).toBeInTheDocument();
    expect(passwordInput).toBeInTheDocument();
    expect(loginButton).toBeInTheDocument();
  });
});