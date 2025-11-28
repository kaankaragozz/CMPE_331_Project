import { sql } from "../config/db.js";

//CRUD Operations for "deneme" table
export const getAllDeneme = async (req, res) => {
  try {
    const AllDeneme = await sql`
      SELECT * FROM deneme
      ORDER BY created_at DESC
    `;

    console.log("fetched Alldeneme,", AllDeneme);
    res.status(200).json({ success: true, data: AllDeneme });
  }
  catch (error) {
    console.log("Error in getAllDeneme :", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }

};

export const getDeneme = async (req, res) => {
  const { id } = req.params;
  try {
    const Deneme = await sql`
      SELECT * FROM deneme
      WHERE id = ${id}
    `
    console.log("fetched deneme,", Deneme);
    res.status(200).json({ success: true, data: Deneme[0] });
  }
  catch (error) {
    console.log("Error in getDeneme :", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }

};

export const createDeneme = async (req, res) => {
  const { first_name, last_name } = req.body;

  if (!first_name || !last_name) {
    return res.status(400).json({ success: false, message: "first_name and last_name are required" });
  }

  try {
    const newDeneme = await sql`
      INSERT INTO deneme (first_name, last_name)
      VALUES (${first_name}, ${last_name})
      RETURNING *
    `

    console.log("Created new Deneme:", newDeneme[0]);
    res.status(201).json({ success: true, data: newDeneme[0] });

  } catch (error) {
    console.log("Error in createDeneme :", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }

};

export const updateDeneme = async (req, res) => {
  const { id } = req.params;
  const { first_name, last_name } = req.body;

  try {
    const updatedDeneme = await sql`
      UPDATE deneme
      SET first_name = ${first_name}, last_name = ${last_name}
      WHERE id = ${id}
      RETURNING *
    `

    if (updatedDeneme.length === 0) {
      return res.status(404).json({ success: false, message: "Deneme not found" });
    }

    res.status(200).json({ success: true, data: updatedDeneme[0] });
  }
  catch (error) {
    console.log("Error in updateDeneme :", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }

};

export const deleteDeneme = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedDeneme = await sql`
      DELETE FROM deneme 
      WHERE id = ${id}
      RETURNING * 
    `

    if (deletedDeneme.length === 0) {
      return res.status(404).json({ success: false, message: "Deneme not found" });
    }

    res.status(200).json({ success: true, message: "Deneme deleted successfully" });
  }
  catch (error) {
    console.log("Error in deleteDeneme :", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};