import express from "express";
import {
  getCrewAssignmentByFlightNumber,
  upsertCrewAssignmentForFlight,
} from "../controllers/crew_assignmentsController.js";

const router = express.Router();

// GET /api/flights/:flight_number/crew-assignments
router.get("/:flight_number/crew-assignments", getCrewAssignmentByFlightNumber);

// POST /api/flights/:flight_number/crew-assignments
router.post("/:flight_number/crew-assignments", upsertCrewAssignmentForFlight);

export default router;
