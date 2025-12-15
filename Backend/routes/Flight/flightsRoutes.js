// routes/Flight/flightsRoutes.js
import express from 'express';
import {
  // core flights
  getAllFlights,
  getFlightByNumber,
  createFlight,
  updateFlight,
  deleteFlight,

  // crew assignment
  getCrewAssignment,
  saveCrewAssignment,

  // passengers for a flight (if you want them under /api/flight)
  getFlightPassengers,
  savePassengerSeats,

  // combined roster (if you implemented these)
  getCrewRosterForFlight,
  saveRosterForFlight,
} from '../../controllers/Flight/flightsController.js';

const router = express.Router();

/* ──────────────────────
   FLIGHTS CRUD
   base path: /api/flight
   ────────────────────── */

router.get('/', getAllFlights);          // GET /api/flight
router.post('/', createFlight);          // POST /api/flight

// use :flight_number consistently, since controller expects that
router.get('/:flight_number', getFlightByNumber);             // GET /api/flight/AA1001
router.put('/:flight_number', updateFlight);                  // PUT /api/flight/AA1001
router.delete('/:flight_number', deleteFlight);               // DELETE /api/flight/AA1001

/* ──────────────────────
   CREW ASSIGNMENT
   used by FlightCrewAssignmentPage
   ────────────────────── */

router.get('/:flight_number/crew', getCrewAssignment);        // GET /api/flight/AA1001/crew
router.post('/:flight_number/crew', saveCrewAssignment);      // POST /api/flight/AA1001/crew

/* ──────────────────────
   PASSENGERS FOR A FLIGHT
   (optional – you already also have /api/passengers/flight/:flight_number)
   ────────────────────── */

router.get('/:flight_number/passengers', getFlightPassengers);             // GET /api/flight/AA1001/passengers
router.post('/:flight_number/passengers/seats', savePassengerSeats);       // POST /api/flight/AA1001/passengers/seats

/* ──────────────────────
   COMBINED ROSTER (for RosterTabularPage)
   ────────────────────── */

// If you already implemented these in flightsController:
router.get('/:flight_number/roster', getCrewRosterForFlight); // GET /api/flight/AA1001/roster
router.post('/:flight_number/roster', saveRosterForFlight);   // POST /api/flight/AA1001/roster

export default router;
