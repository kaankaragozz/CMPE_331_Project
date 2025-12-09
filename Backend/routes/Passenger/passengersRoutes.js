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

} from '../controllers/Passenger/passengersController.js';

const router = express.Router();

router.get('/', getAllPassengers);
router.get('/:id', getPassengerById);
router.post('/', createPassenger); 
router.put('/:id', updatePassenger);
router.delete('/:id', deletePassenger);
router.get('/flight/:flight_number', getPassengersByFlight);
router.post('/flight-assignment', addPassengerToFlight); 
router.delete('/flight/:flight_number/:passenger_id', removePassengerFromFlight);
router.post('/flight/:flight_number/assign-seats', autoAssignSeats);
router.put('/flight/:flight_number/manual-assign', assignSeatManually);
router.get('/flight/:flight_number/affiliations', getAffiliatedPassengers);
router.post('/affiliations', addAffiliation);
router.delete('/affiliations/:id', deleteAffiliation);
router.get('/flight/:flight_number/infants', getInfantRelationships);
router.post('/infants', addInfantRelationship);
router.delete('/infants/:id', deleteInfantRelationship);

export default router;