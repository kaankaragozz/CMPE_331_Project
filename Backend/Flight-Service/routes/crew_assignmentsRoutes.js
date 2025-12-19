import express from "express";
import {
  getCrewAssignmentByFlightNumber,
  upsertCrewAssignmentForFlight,
  getFlightsByPilotId,
  getFlightsByCrewId
} from "../controllers/crew_assignmentsController.js";

const router = express.Router();

// ✅ GET /api/flights/by-pilot/:pilot_id 
router.get("/by-pilot/:pilot_id", getFlightsByPilotId);

// GET /api/flights/by-crew/:cabin_crew_id
router.get("/by-crew/:crew_id", getFlightsByCrewId);

// GET /api/flights/:flight_number/crew-assignments
router.get("/:flight_number/crew-assignments", getCrewAssignmentByFlightNumber);

// POST /api/flights/:flight_number/crew-assignments
router.post("/:flight_number/crew-assignments", upsertCrewAssignmentForFlight);

export default router;
