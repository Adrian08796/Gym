// src/__tests__/Header.test.jsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import Header from '../components/Header';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { ThemeProvider } from '../context/ThemeContext';

test('renders Header component with logo', () => {
  render(
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <Header />
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
  const logoElement = screen.getByText(/Level/i);
  expect(logoElement).toBeInTheDocument();
});