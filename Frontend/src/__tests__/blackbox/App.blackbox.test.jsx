// Black box tests for App component
// Tests focus on routing behavior and authentication-based navigation

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '../../App.jsx';

describe('App - Black Box Tests (Routing)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    localStorage.getItem.mockReturnValue(null);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Authentication-Based Routing (Black Box Behavior)', () => {
    it('should redirect unauthenticated user to login page', () => {
      localStorage.getItem.mockReturnValue(null);

      render(
        <MemoryRouter initialEntries={['/']}>
          <App />
        </MemoryRouter>
      );

      // Test: Unauthenticated user should see login page
      expect(screen.getByText(/flight roster management system/i)).toBeInTheDocument();
    });


    it('should redirect authenticated user away from login page', () => {
      localStorage.getItem.mockImplementation((key) => {
        if (key === 'token') return 'valid-token';
        if (key === 'userRole') return 'Admin';
        return null;
      });

      render(
        <MemoryRouter initialEntries={['/login']}>
          <App />
        </MemoryRouter>
      );

      // Test: Authenticated user should not see login form
      expect(screen.queryByText(/sign in/i)).not.toBeInTheDocument();
    });

    it('should allow unauthenticated user to access login page', () => {
      localStorage.getItem.mockReturnValue(null);

      render(
        <MemoryRouter initialEntries={['/login']}>
          <App />
        </MemoryRouter>
      );

      // Test: Login page should be accessible
      expect(screen.getByText(/flight roster management system/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });
  });

  describe('Route Protection (Black Box Behavior)', () => {
    it('should protect flights route from unauthenticated users', () => {
      localStorage.getItem.mockReturnValue(null);

      render(
        <MemoryRouter initialEntries={['/flights']}>
          <App />
        </MemoryRouter>
      );

      // Test: Unauthenticated user should be redirected to login
      expect(screen.getByText(/flight roster management system/i)).toBeInTheDocument();
    });

    it('should allow authenticated user to access flights route', () => {
      localStorage.getItem.mockImplementation((key) => {
        if (key === 'token') return 'valid-token';
        if (key === 'userRole') return 'Admin';
        return null;
      });

      render(
        <MemoryRouter initialEntries={['/flights']}>
          <App />
        </MemoryRouter>
      );

      // Test: Authenticated user should access flights page
      // Since it loads data, we check for page title or loading state
      const flightsContent = screen.queryByText(/flight selection/i) || 
                            screen.queryByText(/loading/i);
      expect(flightsContent).toBeTruthy();
    });
  });

  describe('Role-Based Routing (Black Box Behavior)', () => {



    it('should route Passenger user to passenger page', () => {
      localStorage.getItem.mockImplementation((key) => {
        if (key === 'token') return 'valid-token';
        if (key === 'userRole') return 'Passenger';
        return null;
      });

      render(
        <MemoryRouter initialEntries={['/passenger']}>
          <App />
        </MemoryRouter>
      );

      // Test: Passenger page should be accessible
      const passengerContent = screen.queryByText(/seat/i) || 
                              screen.queryByText(/loading/i);
      expect(passengerContent).toBeTruthy();
    });
  });

  describe('Invalid Route Handling (Black Box Behavior)', () => {
    it('should redirect unauthenticated user to login for any invalid route', () => {
      localStorage.getItem.mockReturnValue(null);

      render(
        <MemoryRouter initialEntries={['/invalid-route']}>
          <App />
        </MemoryRouter>
      );

      // Test: Should redirect to login
      expect(screen.getByText(/flight roster management system/i)).toBeInTheDocument();
    });
  });
});

