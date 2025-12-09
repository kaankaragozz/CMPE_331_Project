import { sql } from "../../config/db.js";

//CRUD Operations for "cabin_crew_vehicle_restrictions" table
export const getAllCabinCrewVehicleRestrictions = async (req, res) => {
  try {
    const allRestrictions = await sql`
      SELECT ccvr.id, ccvr.created_at,
             cc.first_name AS crew_first_name, cc.last_name AS crew_last_name,
             vt.type_name AS vehicle_type
      FROM cabin_crew_vehicle_restrictions ccvr
      JOIN cabin_crew cc ON ccvr.cabin_crew_id = cc.id
      JOIN vehicle_types vt ON ccvr.vehicle_type_id = vt.id
      ORDER BY ccvr.created_at DESC
    `;
    
    if (allRestrictions.length === 0) {
      return res.status(404).json({ success: false, message: "No vehicle restrictions found" });
    }

    res.status(200).json({ success: true, data: allRestrictions });
  } catch (error) {
    console.error("Error in getAllCabinCrewVehicleRestrictions:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const getCabinCrewVehicleRestriction = async (req, res) => {
  const { id } = req.params;
  try {
    const restriction = await sql`
      SELECT ccvr.id, ccvr.created_at,
             cc.first_name AS crew_first_name, cc.last_name AS crew_last_name,
             vt.type_name AS vehicle_type
      FROM cabin_crew_vehicle_restrictions ccvr
      JOIN cabin_crew cc ON ccvr.cabin_crew_id = cc.id
      JOIN vehicle_types vt ON ccvr.vehicle_type_id = vt.id
      WHERE ccvr.id = ${id}
    `;

    if (restriction.length === 0) {
      return res.status(404).json({ success: false, message: "Vehicle restriction not found" });
    }

    res.status(200).json({ success: true, data: restriction[0] });
  } catch (error) {
    console.error("Error in getCabinCrewVehicleRestriction:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const createCabinCrewVehicleRestriction = async (req, res) => {
  const { cabin_crew_id, vehicle_type_id } = req.body;
  try {
    const newRestriction = await sql`
      INSERT INTO cabin_crew_vehicle_restrictions (cabin_crew_id, vehicle_type_id)
      VALUES (${cabin_crew_id}, ${vehicle_type_id})
      RETURNING *
    `;

    res.status(201).json({ success: true, data: newRestriction[0] });
  } catch (error) {
    console.error("Error in createCabinCrewVehicleRestriction:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const updateCabinCrewVehicleRestriction = async (req, res) => {
  const { id } = req.params;
  const { cabin_crew_id, vehicle_type_id } = req.body;
  try {
    const updatedRestriction = await sql`
      UPDATE cabin_crew_vehicle_restrictions
      SET cabin_crew_id = ${cabin_crew_id}, vehicle_type_id = ${vehicle_type_id}
      WHERE id = ${id}
      RETURNING *
    `;

    if (updatedRestriction.length === 0) {
      return res.status(404).json({ success: false, message: "Vehicle restriction not found" });
    }

    res.status(200).json({ success: true, data: updatedRestriction[0] });
  } catch (error) {
    console.error("Error in updateCabinCrewVehicleRestriction:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const deleteCabinCrewVehicleRestriction = async (req, res) => {
  const { id } = req.params;
  try {
    await sql`DELETE FROM cabin_crew_vehicle_restrictions WHERE id = ${id}`;
    res.status(200).json({ success: true, message: "Vehicle restriction deleted successfully" });
  } catch (error) {
    console.error("Error in deleteCabinCrewVehicleRestriction:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

