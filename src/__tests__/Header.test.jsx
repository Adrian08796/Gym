import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import Header from '../components/Header';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { ThemeProvider } from '../context/ThemeContext';

describe('Header component', () => {
  // Header component renders with logo 
  it('renders with logo', () => {
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
  // Header component renders with login button
  it('renders with login button', {}, () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <ThemeProvider>
            <Header />
          </ThemeProvider>
        </AuthProvider>
      </BrowserRouter>
    );
    const loginButton = screen.getByRole('link', { name: /Login/i });
    expect(loginButton).toBeInTheDocument();
  });
  // Header component renders with register button
  it('renders with register button', {}, () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <ThemeProvider>
            <Header />
          </ThemeProvider>
        </AuthProvider>
      </BrowserRouter>
    );
    const logoutButton = screen.getByRole('link', { name: /Register/i });
    expect(logoutButton).toBeInTheDocument();
  });
  // Header component renders with register button
  it('renders with themeToggle button', {}, () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <ThemeProvider>
            <Header />
          </ThemeProvider>
        </AuthProvider>
      </BrowserRouter>
    );
    const logoutButton = screen.getByLabelText('themeToggle', { name: /themeToggle/i });
    expect(logoutButton).toBeInTheDocument();
  });
});

// This test checks if the Header component renders and contains the logo text.