/**
 * API Service for Flight Management System
 * Handles all HTTP requests to the backend
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/**
 * Fetch all flights from the backend
 * @returns {Promise<Array>} Array of flights
 */
export const getAllFlights = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/flight`);
    if (!response.ok) {
      throw new Error(`Failed to fetch flights: ${response.statusText}`);
    }
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching flights:', error);
    throw error;
  }
};

/**
 * Fetch a specific flight by flight number
 * @param {string} flightNumber - Flight number in AANNNN format (e.g., AA1001)
 * @returns {Promise<Object>} Flight object
 */
export const getFlightByNumber = async (flightNumber) => {
  try {
    const response = await fetch(`${API_BASE_URL}/flight/${flightNumber}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch flight ${flightNumber}: ${response.statusText}`);
    }
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error(`Error fetching flight ${flightNumber}:`, error);
    throw error;
  }
};

/**
 * Create a new flight
 * @param {Object} flightData - Flight data
 * @returns {Promise<Object>} Created flight object
 */
export const createFlight = async (flightData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/flight`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(flightData),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Failed to create flight: ${response.statusText}`);
    }
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error creating flight:', error);
    throw error;
  }
};

/**
 * Update a flight
 * @param {string} flightNumber - Flight number in AANNNN format
 * @param {Object} updateData - Updated flight data
 * @returns {Promise<Object>} Updated flight object
 */
export const updateFlight = async (flightNumber, updateData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/flight/${flightNumber}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Failed to update flight: ${response.statusText}`);
    }
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error updating flight:', error);
    throw error;
  }
};

/**
 * Delete a flight
 * @param {string} flightNumber - Flight number in AANNNN format
 * @returns {Promise<Object>} Deleted flight object
 */
export const deleteFlight = async (flightNumber) => {
  try {
    const response = await fetch(`${API_BASE_URL}/flight/${flightNumber}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Failed to delete flight: ${response.statusText}`);
    }
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error deleting flight:', error);
    throw error;
  }
};

/**
 * Check API health status
 * @returns {Promise<Object>} Health status
 */
export const checkHealth = async () => {
  try {
    const response = await fetch(`http://localhost:3000/health`);
    if (!response.ok) {
      throw new Error(`API health check failed: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error checking API health:', error);
    throw error;
  }
};
