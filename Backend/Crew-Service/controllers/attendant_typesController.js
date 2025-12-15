import { sql } from "../config/db.js";

//CRUD Operations for "attendant_types" table
export const getAllAttendantTypes = async (req, res) => {
  try {
    const allAttendantTypes = await sql`
      SELECT * FROM attendant_types ORDER BY id ASC
    `;

    if (allAttendantTypes.length === 0) {
      return res.status(404).json({ success: false, message: "No attendant types found" });
    }

    res.status(200).json({ success: true, data: allAttendantTypes });
  } catch (error) {
    console.error("Error in getAllAttendantTypes:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const getAttendantType = async (req, res) => {
  const { id } = req.params;
  try {
    const attendantType = await sql`
      SELECT * FROM attendant_types WHERE id = ${id}
    `;

    if (attendantType.length === 0) {
      return res.status(404).json({ success: false, message: "Attendant type not found" });
    }

    res.status(200).json({ success: true, data: attendantType[0] });
  } catch (error) {
    console.error("Error in getAttendantType:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const createAttendantType = async (req, res) => {
  const { type_name, min_count, max_count } = req.body;
  try {
    const newAttendantType = await sql`
      INSERT INTO attendant_types (type_name, min_count, max_count)
      VALUES (${type_name}, ${min_count}, ${max_count})
      RETURNING *
    `;

    res.status(201).json({ success: true, data: newAttendantType[0] });
  } catch (error) {
    console.error("Error in createAttendantType:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const updateAttendantType = async (req, res) => {
  const { id } = req.params;
  const { type_name, min_count, max_count } = req.body;
  try {
    const updatedAttendantType = await sql`
      UPDATE attendant_types
      SET type_name = ${type_name}, min_count = ${min_count}, max_count = ${max_count}
      WHERE id = ${id}
      RETURNING *
    `;

    if (updatedAttendantType.length === 0) {
      return res.status(404).json({ success: false, message: "Attendant type not found" });
    }

    res.status(200).json({ success: true, data: updatedAttendantType[0] });
  } catch (error) {
    console.error("Error in updateAttendantType:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const deleteAttendantType = async (req, res) => {
  const { id } = req.params;
  try {
    await sql`DELETE FROM attendant_types WHERE id = ${id}`;
    res.status(200).json({ success: true, message: "Attendant type deleted successfully" });
  } catch (error) {
    console.error("Error in deleteAttendantType:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

