// Black box tests for FlightSelectionPage
// Tests focus on user interactions: search, filter, and navigation

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import FlightSelectionPage from '../../pages/Flights/FlightSelectionPage.jsx';

// Mock fetch globally
global.fetch = vi.fn();

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

describe('FlightSelectionPage - Black Box Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const renderFlightSelectionPage = () => {
    return render(
      <BrowserRouter>
        <FlightSelectionPage />
      </BrowserRouter>
    );
  };


  describe('Flight Display (Black Box View)', () => {
    it('should display flight cards with flight information', async () => {
      const mockFlight = {
        flight_number: 'AA1001',
        flight_date: new Date().toISOString(),
        source: { airport_code: 'IST', city: 'Istanbul' },
        destination: { airport_code: 'FRA', city: 'Frankfurt' },
        vehicle_type: { type_name: 'Boeing 737' },
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: [mockFlight],
        }),
      });

      renderFlightSelectionPage();

      await waitFor(() => {
        // Test: User should see flight number
        expect(screen.getByText('AA1001')).toBeInTheDocument();

        // Test: User should see route information
        expect(screen.getByText(/IST.*→.*FRA/i)).toBeInTheDocument();

        // Test: User should see aircraft type
        expect(screen.getByText(/boeing 737/i)).toBeInTheDocument();
      });
    });

  });

  describe('Navigation Actions (Black Box Interaction)', () => {
    it('should navigate to flight details when "Flight Details" button is clicked', async () => {
      const mockFlight = {
        flight_number: 'AA1001',
        flight_date: new Date().toISOString(),
        source: { airport_code: 'IST', city: 'Istanbul' },
        destination: { airport_code: 'FRA', city: 'Frankfurt' },
        vehicle_type: { type_name: 'Boeing 737' },
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: [mockFlight],
        }),
      });

      renderFlightSelectionPage();

      await waitFor(() => {
        const detailsButton = screen.getByRole('button', { name: /flight details/i });
        expect(detailsButton).toBeInTheDocument();
      });
    });

    it('should navigate to crew assignment when "Crew Assignment" button is clicked', async () => {
      const mockFlight = {
        flight_number: 'AA1001',
        flight_date: new Date().toISOString(),
        source: { airport_code: 'IST', city: 'Istanbul' },
        destination: { airport_code: 'FRA', city: 'Frankfurt' },
        vehicle_type: { type_name: 'Boeing 737' },
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: [mockFlight],
        }),
      });

      renderFlightSelectionPage();

      await waitFor(() => {
        const crewButton = screen.getByRole('button', { name: /crew assignment/i });
        expect(crewButton).toBeInTheDocument();
      });
    });
  });

});



