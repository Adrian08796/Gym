// src/__tests__/Login.test.jsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Login from '../components/Login';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { GymProvider } from '../context/GymContext';
import { ThemeProvider } from '../context/ThemeContext';

test('renders Login form with username and password inputs', () => {
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