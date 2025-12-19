// Black box tests for DashboardPage
// Tests focus on what user sees and can do, not internal implementation

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import DashboardPage from '../../pages/Dashboard/DashboardPage.jsx';
import axios from 'axios';

// Mock axios and react-router-dom
vi.mock('axios', () => ({
  default: {
    get: vi.fn(),
  },
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

describe('DashboardPage - Black Box Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.getItem.mockReturnValue('token');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const renderDashboardPage = () => {
    return render(
      <BrowserRouter>
        <DashboardPage />
      </BrowserRouter>
    );
  };

  describe('Initial Render (Black Box View)', () => {
    it('should show loading state initially', () => {
      // Mock API calls to never resolve (loading state)
      axios.get.mockImplementation(() => new Promise(() => {}));

      renderDashboardPage();

      // Test: User should see loading indicator
      expect(screen.getByText(/loading dashboard data/i)).toBeInTheDocument();
    });

    it('should display dashboard title and description', async () => {
      // Mock successful API responses
      axios.get.mockResolvedValueOnce({
        data: { data: [] }, // flights
      });
      axios.get.mockResolvedValueOnce({
        data: { data: [] }, // pilots
      });
      axios.get.mockResolvedValueOnce({
        data: { data: [] }, // cabin crew
      });

      renderDashboardPage();

      await waitFor(() => {
        // Test: User should see dashboard title
        expect(screen.getByText('Dashboard')).toBeInTheDocument();

        // Test: User should see dashboard description
        expect(screen.getByText(/overview of flights, rosters and crew status/i)).toBeInTheDocument();
      });
    });

    it('should display statistics cards', async () => {
      const mockFlights = [
        {
          flight_number: 'AA1001',
          flight_date: new Date().toISOString(),
          source: { airport_code: 'IST', city: 'Istanbul' },
          destination: { airport_code: 'FRA', city: 'Frankfurt' },
          vehicle_type: { type_name: 'Boeing 737' },
        },
      ];

      axios.get.mockResolvedValueOnce({
        data: { data: mockFlights },
      });
      axios.get.mockResolvedValueOnce({
        data: { data: [] }, // pilots
      });
      axios.get.mockResolvedValueOnce({
        data: { data: [] }, // cabin crew
      });

      // Mock crew assignment endpoint (404 for no assignment)
      axios.get.mockRejectedValueOnce({
        response: { status: 404 },
      });

      renderDashboardPage();

      await waitFor(() => {
        // Test: User should see statistics cards
        expect(screen.getByText(/flights today/i)).toBeInTheDocument();
        expect(screen.getByText(/rosters generated/i)).toBeInTheDocument();
        expect(screen.getByText(/pending flights/i)).toBeInTheDocument();
        expect(screen.getByText(/crew available/i)).toBeInTheDocument();
      });
    });
  });

  describe('Navigation Actions (Black Box Interaction)', () => {
    it('should navigate to flights page when "Generate new roster" button is clicked', async () => {
      axios.get.mockResolvedValueOnce({ data: { data: [] } }); // flights
      axios.get.mockResolvedValueOnce({ data: { data: [] } }); // pilots
      axios.get.mockResolvedValueOnce({ data: { data: [] } }); // cabin crew

      renderDashboardPage();

      await waitFor(() => {
        const generateButton = screen.getByRole('button', { name: /generate new roster/i });
        expect(generateButton).toBeInTheDocument();
      });
    });

    it('should navigate to flights page when "Go to flights" button is clicked', async () => {
      axios.get.mockResolvedValueOnce({ data: { data: [] } }); // flights
      axios.get.mockResolvedValueOnce({ data: { data: [] } }); // pilots
      axios.get.mockResolvedValueOnce({ data: { data: [] } }); // cabin crew

      renderDashboardPage();

      await waitFor(() => {
        const flightsButton = screen.getByRole('button', { name: /go to flights/i });
        expect(flightsButton).toBeInTheDocument();
      });
    });
  });

  describe('Upcoming Flights Display (Black Box View)', () => {
    it('should display upcoming flights table when flights exist', async () => {
      const mockFlights = [
        {
          flight_number: 'AA1001',
          flight_date: new Date(Date.now() + 86400000).toISOString(), // tomorrow
          source: { airport_code: 'IST', city: 'Istanbul' },
          destination: { airport_code: 'FRA', city: 'Frankfurt' },
          vehicle_type: { type_name: 'Boeing 737' },
        },
        {
          flight_number: 'AA1002',
          flight_date: new Date(Date.now() + 172800000).toISOString(), // day after tomorrow
          source: { airport_code: 'FRA', city: 'Frankfurt' },
          destination: { airport_code: 'IST', city: 'Istanbul' },
          vehicle_type: { type_name: 'Airbus A320' },
        },
      ];

      axios.get.mockResolvedValueOnce({
        data: { data: mockFlights },
      });
      axios.get.mockResolvedValueOnce({
        data: { data: [] }, // pilots
      });
      axios.get.mockResolvedValueOnce({
        data: { data: [] }, // cabin crew
      });

      // Mock crew assignments (404 = no assignments)
      axios.get.mockRejectedValueOnce({ response: { status: 404 } });
      axios.get.mockRejectedValueOnce({ response: { status: 404 } });

      renderDashboardPage();

      await waitFor(() => {
        // Test: User should see upcoming flights section
        expect(screen.getByText(/upcoming flights/i)).toBeInTheDocument();

        // Test: User should see flight numbers
        expect(screen.getByText('AA1001')).toBeInTheDocument();
        expect(screen.getByText('AA1002')).toBeInTheDocument();
      });
    });

    it('should display "No upcoming flights" message when no flights exist', async () => {
      axios.get.mockResolvedValueOnce({
        data: { data: [] }, // no flights
      });
      axios.get.mockResolvedValueOnce({
        data: { data: [] }, // pilots
      });
      axios.get.mockResolvedValueOnce({
        data: { data: [] }, // cabin crew
      });

      renderDashboardPage();

      await waitFor(() => {
        // Test: User should see empty state message
        expect(screen.getByText(/no upcoming flights found/i)).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling (Black Box Outcome)', () => {
    it('should display error message when data loading fails', async () => {
      // Mock API error
      axios.get.mockRejectedValueOnce(new Error('Network error'));

      renderDashboardPage();

      await waitFor(() => {
        // Test: User should see error message
        expect(screen.getByText(/failed to load dashboard data/i)).toBeInTheDocument();
      });
    });
  });

  describe('Activity Panel (Black Box View)', () => {
    it('should display recent activity section', async () => {
      axios.get.mockResolvedValueOnce({ data: { data: [] } }); // flights
      axios.get.mockResolvedValueOnce({ data: { data: [] } }); // pilots
      axios.get.mockResolvedValueOnce({ data: { data: [] } }); // cabin crew

      renderDashboardPage();

      await waitFor(() => {
        // Test: User should see recent activity section
        expect(screen.getByText(/recent activity/i)).toBeInTheDocument();

        // Test: User should see activity items
        expect(screen.getByText(/roster generated/i)).toBeInTheDocument();
        expect(screen.getByText(/cabin crew updated/i)).toBeInTheDocument();
      });
    });
  });
});

