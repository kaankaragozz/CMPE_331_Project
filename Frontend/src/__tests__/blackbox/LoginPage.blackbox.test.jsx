// Black box tests for LoginPage
// Tests focus on user interactions and outcomes without knowing internal implementation

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import LoginPage from '../../pages/Auth/LoginPage.jsx';

// Mock fetch globally
global.fetch = vi.fn();

// Mock window.location
delete window.location;
window.location = { href: '' };

describe('LoginPage - Black Box Tests', () => {
  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    localStorage.clear();
    localStorage.getItem.mockReturnValue(null);
    window.location.href = '';
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const renderLoginPage = () => {
    const { container } = render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );
    return { container };
  };

  describe('Initial Render (Black Box View)', () => {
    it('should display login form with all required fields', () => {
      const { container } = renderLoginPage();

      // Test: User should see the form title
      expect(screen.getByText('Flight Roster Management System')).toBeInTheDocument();

      // Test: User should see username input field (label doesn't have htmlFor, so we use role)
      expect(screen.getByText(/username|email/i)).toBeInTheDocument();
      const textInputs = screen.getAllByRole('textbox');
      const usernameInput = textInputs[0];
      expect(usernameInput).toBeInTheDocument();
      expect(usernameInput).toHaveAttribute('type', 'text');

      // Test: User should see password input field
      expect(screen.getByText(/password/i)).toBeInTheDocument();
      const passwordInput = container.querySelector('input[type="password"]');
      expect(passwordInput).toBeInTheDocument();
      expect(passwordInput).toHaveAttribute('type', 'password');

      // Test: User should see remember me checkbox
      const rememberCheckbox = screen.getByRole('checkbox');
      expect(rememberCheckbox).toBeInTheDocument();
      expect(rememberCheckbox).toHaveAttribute('type', 'checkbox');

      // Test: User should see submit button
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      expect(submitButton).toBeInTheDocument();
    });

    it('should have empty form fields initially', () => {
      const { container } = renderLoginPage();

      const textInputs = screen.getAllByRole('textbox');
      const usernameInput = textInputs[0];
      const passwordInput = container.querySelector('input[type="password"]');
      const rememberCheckbox = screen.getByRole('checkbox');

      // Test: Form fields should be empty
      expect(usernameInput).toHaveValue('');
      expect(passwordInput).toHaveValue('');
      expect(rememberCheckbox).not.toBeChecked();
    });
  });

  describe('User Input (Black Box Interaction)', () => {
    it('should allow user to type in username field', async () => {
      const user = userEvent.setup();
      renderLoginPage();

      const textInputs = screen.getAllByRole('textbox');
      const usernameInput = textInputs[0];

      // Test: User can type in username
      await user.type(usernameInput, 'testuser');
      expect(usernameInput).toHaveValue('testuser');
    });

    it('should allow user to type in password field', async () => {
      const user = userEvent.setup();
      const { container } = renderLoginPage();

      const passwordInput = container.querySelector('input[type="password"]');

      // Test: User can type in password
      await user.type(passwordInput, 'password123');
      expect(passwordInput).toHaveValue('password123');
    });

    it('should allow user to toggle remember me checkbox', async () => {
      const user = userEvent.setup();
      renderLoginPage();

      const rememberCheckbox = screen.getByRole('checkbox');

      // Test: User can check the checkbox
      await user.click(rememberCheckbox);
      expect(rememberCheckbox).toBeChecked();

      // Test: User can uncheck the checkbox
      await user.click(rememberCheckbox);
      expect(rememberCheckbox).not.toBeChecked();
    });
  });

  describe('Form Submission - Success (Black Box Outcome)', () => {
    it('should submit form with entered credentials', async () => {
      const user = userEvent.setup();
      const { container } = renderLoginPage();

      // Mock successful login response
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          user: {
            id: 1,
            name: 'Test User',
            role: 'Admin',
          },
        }),
      });

      // User enters credentials
      const textInputs = screen.getAllByRole('textbox');
      const usernameInput = textInputs[0];
      const passwordInput = container.querySelector('input[type="password"]');
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(usernameInput, 'testuser');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      // Test: API should be called with correct credentials
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          'http://localhost:3000/api/auth/login',
          expect.objectContaining({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: 'testuser',
              password: 'password123',
            }),
          })
        );
      });
    });

    it('should store user data in localStorage after successful login', async () => {
      const user = userEvent.setup();
      const { container } = renderLoginPage();

      // Mock successful login response
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          user: {
            id: 1,
            name: 'Test User',
            role: 'Admin',
          },
        }),
      });

      const textInputs = screen.getAllByRole('textbox');
      const usernameInput = textInputs[0];
      const passwordInput = container.querySelector('input[type="password"]');
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(usernameInput, 'testuser');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      // Test: User data should be stored in localStorage
      await waitFor(() => {
        expect(localStorage.setItem).toHaveBeenCalledWith('token', '1');
        expect(localStorage.setItem).toHaveBeenCalledWith('userId', '1');
        expect(localStorage.setItem).toHaveBeenCalledWith('userRole', 'Admin');
        expect(localStorage.setItem).toHaveBeenCalledWith('userName', 'Test User');
      });
    });

    it('should redirect Admin user to home page after successful login', async () => {
      const user = userEvent.setup();
      const { container } = renderLoginPage();

      // Mock successful login response for Admin
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          user: {
            id: 1,
            name: 'Test Admin',
            role: 'Admin',
          },
        }),
      });

      const textInputs = screen.getAllByRole('textbox');
      const usernameInput = textInputs[0];
      const passwordInput = container.querySelector('input[type="password"]');
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(usernameInput, 'admin');
      await user.type(passwordInput, 'password');
      await user.click(submitButton);

      // Test: User should be redirected to home page
      await waitFor(() => {
        expect(window.location.href).toBe('/');
      });
    });

    it('should redirect Pilot user to pilot dashboard after successful login', async () => {
      const user = userEvent.setup();
      const { container } = renderLoginPage();

      // Mock successful login response for Pilot
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          user: {
            id: 2,
            name: 'Test Pilot',
            role: 'Pilot',
            pilot_id: 10,
          },
        }),
      });

      const textInputs = screen.getAllByRole('textbox');
      const usernameInput = textInputs[0];
      const passwordInput = container.querySelector('input[type="password"]');
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(usernameInput, 'pilot');
      await user.type(passwordInput, 'password');
      await user.click(submitButton);

      // Test: Pilot should be redirected to pilot dashboard
      await waitFor(() => {
        expect(window.location.href).toBe('/pilot');
        expect(localStorage.setItem).toHaveBeenCalledWith('pilotId', '10');
      });
    });
  });

  describe('Form Submission - Error Handling (Black Box Outcome)', () => {
    it('should display error message when login fails', async () => {
      const user = userEvent.setup();
      const { container } = renderLoginPage();

      // Mock failed login response
      global.fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          message: 'Invalid credentials',
        }),
      });

      const textInputs = screen.getAllByRole('textbox');
      const usernameInput = textInputs[0];
      const passwordInput = container.querySelector('input[type="password"]');
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(usernameInput, 'wronguser');
      await user.type(passwordInput, 'wrongpassword');
      await user.click(submitButton);

      // Test: Error message should be displayed to user
      await waitFor(() => {
        expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
      });

      // Test: User should still be on login page (no redirect)
      expect(window.location.href).toBe('');
    });

    it('should display generic error message when server error occurs', async () => {
      const user = userEvent.setup();
      const { container } = renderLoginPage();

      // Mock network error
      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      const textInputs = screen.getAllByRole('textbox');
      const usernameInput = textInputs[0];
      const passwordInput = container.querySelector('input[type="password"]');
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(usernameInput, 'testuser');
      await user.type(passwordInput, 'password');
      await user.click(submitButton);

      // Test: Generic error message should be displayed
      await waitFor(() => {
        expect(screen.getByText('Server error')).toBeInTheDocument();
      });
    });

    it('should clear previous error message on new submission attempt', async () => {
      const user = userEvent.setup();
      const { container } = renderLoginPage();

      // First failed attempt
      global.fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          message: 'Invalid credentials',
        }),
      });

      const textInputs = screen.getAllByRole('textbox');
      const usernameInput = textInputs[0];
      const passwordInput = container.querySelector('input[type="password"]');
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(usernameInput, 'wronguser');
      await user.type(passwordInput, 'wrongpassword');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
      });

      // Second attempt - successful
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          user: {
            id: 1,
            name: 'Test User',
            role: 'Admin',
          },
        }),
      });

      await user.clear(usernameInput);
      await user.clear(passwordInput);
      await user.type(usernameInput, 'correctuser');
      await user.type(passwordInput, 'correctpassword');
      await user.click(submitButton);

      // Test: Previous error should be cleared
      await waitFor(() => {
        expect(screen.queryByText('Invalid credentials')).not.toBeInTheDocument();
      });
    });
  });
});

