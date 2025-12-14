import express from 'express';
import {
  // Core Passenger
  getAllPassengers,
  getPassengerById,
  createPassenger,
  updatePassenger,
  deletePassenger,
  
  // Flight Assignments
  getPassengersByFlight,
  addPassengerToFlight,
  removePassengerFromFlight,
  autoAssignSeats,
  assignSeatManually,

  // Affiliations
  getAffiliatedPassengers,
  addAffiliation,
  deleteAffiliation,

  // Infants
  getInfantRelationships,
  addInfantRelationship,
  deleteInfantRelationship,

} from '../../controllers/Passenger/passengersController.js';

const router = express.Router();

// ---- Core passengers ----
router.get('/', getAllPassengers);
router.post('/', createPassenger);

// ---- FLIGHT-RELATED ROUTES (put BEFORE '/:id') ----
router.get('/flight/:flight_number', getPassengersByFlight);
router.post('/flight-assignment', addPassengerToFlight);
router.delete('/flight/:flight_number/:passenger_id', removePassengerFromFlight);

// seat assignment
router.post('/flight/:flight_number/assign-seats', autoAssignSeats);
router.put('/flight/:flight_number/manual-assign', assignSeatManually);

// affiliations
router.get('/flight/:flight_number/affiliations', getAffiliatedPassengers);
router.post('/affiliations', addAffiliation);
router.delete('/affiliations/:id', deleteAffiliation);

// infant relationships
router.get('/flight/:flight_number/infants', getInfantRelationships);
router.post('/infants', addInfantRelationship);
router.delete('/infants/:id', deleteInfantRelationship);

// ---- Generic passenger-by-id routes (AFTER all /flight/... ) ----
router.get('/:id', getPassengerById);
router.put('/:id', updatePassenger);
router.delete('/:id', deletePassenger);

export default router;
