import axios from 'axios';
import { AuthProvider, useAuth } from './src/context/AuthContext.jsx';
import { render, act, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

jest.useFakeTimers();

function TestComponent() {
    const { user, logout } = useAuth();
    return (
      <div>
        {user ? <p>Logged in as {user.username}</p> : <p>Not logged in</p>}
        <button onClick={logout}>Logout</button>
      </div>
    );
  }

  describe('AuthContext activity and inactivity tests', () => {
    let mockAxios;
    
    beforeEach(() => {
      mockAxios = jest.spyOn(axios, 'post').mockResolvedValue({ 
        data: { 
          accessToken: 'new_access_token',
          refreshToken: 'new_refresh_token',
          user: { id: '1', username: 'testuser' }
        } 
      });
      localStorage.clear();
    });
  
    afterEach(() => {
      jest.clearAllMocks();
    });
  
    it('should refresh token on user activity', async () => {
      const { getByText } = render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
  
      // Simulate login
      await act(async () => {
        AuthProvider.login('testuser', 'password');
      });
  
      expect(getByText('Logged in as testuser')).toBeInTheDocument();
  
      // Fast-forward time to just before token refresh
      jest.advanceTimersByTime(14 * 60 * 1000); // 14 minutes
  
      // Simulate user activity
      fireEvent.click(document);
  
      // Check if token refresh was triggered
      expect(mockAxios).toHaveBeenCalledWith('/api/auth/refresh-token', expect.any(Object));
    });
  
    it('should logout user on inactivity', async () => {
      const { getByText } = render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
  
      // Simulate login
      await act(async () => {
        AuthProvider.login('testuser', 'password');
      });
  
      expect(getByText('Logged in as testuser')).toBeInTheDocument();
  
      // Fast-forward time past inactivity timeout
      jest.advanceTimersByTime(31 * 60 * 1000); // 31 minutes
  
      // Check if user is logged out
      expect(getByText('Not logged in')).toBeInTheDocument();
    });
  });