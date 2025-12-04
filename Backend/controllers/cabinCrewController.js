import { sql } from "../config/db.js";

//CRUD Operations for "cabin_crew" table
export const getAllCabinCrew = async (req, res) => {
  try {
    const allCabinCrew = await sql`
      SELECT cc.id, cc.first_name, cc.last_name, cc.age, cc.gender, cc.nationality, cc.known_languages, 
             at.type_name AS attendant_type, 
             ARRAY_AGG(vt.type_name) AS vehicle_restrictions,
             CASE WHEN at.type_name = 'chef' THEN (
               SELECT JSON_AGG(JSON_BUILD_OBJECT('recipe_name', dr.recipe_name, 'description', dr.description))
               FROM dish_recipes dr
               WHERE dr.chef_id = cc.id
             ) ELSE NULL END AS recipes
      FROM cabin_crew cc
      JOIN attendant_types at ON cc.attendant_type_id = at.id
      LEFT JOIN cabin_crew_vehicle_restrictions cvr ON cc.id = cvr.cabin_crew_id
      LEFT JOIN vehicle_types vt ON cvr.vehicle_type_id = vt.id
      GROUP BY cc.id, at.type_name
      ORDER BY cc.created_at DESC
    `;

    if (allCabinCrew.length === 0) {
      return res.status(404).json({ success: false, message: "No cabin crew found" });
    }

    console.log("Fetched all cabin crew:", allCabinCrew);
    res.status(200).json({ success: true, data: allCabinCrew });
  } catch (error) {
    console.log("Error in getAllCabinCrew:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const getCabinCrew = async (req, res) => {
  const { id } = req.params;
  try {
    const cabinCrew = await sql`
      SELECT cc.id, cc.first_name, cc.last_name, cc.age, cc.gender, cc.nationality, cc.known_languages, 
             at.type_name AS attendant_type, 
             ARRAY_AGG(vt.type_name) AS vehicle_restrictions,
             CASE WHEN at.type_name = 'chef' THEN (
               SELECT JSON_AGG(JSON_BUILD_OBJECT('recipe_name', dr.recipe_name, 'description', dr.description))
               FROM dish_recipes dr
               WHERE dr.chef_id = cc.id
             ) ELSE NULL END AS recipes
      FROM cabin_crew cc
      JOIN attendant_types at ON cc.attendant_type_id = at.id
      LEFT JOIN cabin_crew_vehicle_restrictions cvr ON cc.id = cvr.cabin_crew_id
      LEFT JOIN vehicle_types vt ON cvr.vehicle_type_id = vt.id
      WHERE cc.id = ${id}
      GROUP BY cc.id, at.type_name
    `;

    if (cabinCrew.length === 0) {
      return res.status(404).json({ success: false, message: "Cabin crew not found" });
    }

    res.status(200).json({ success: true, data: cabinCrew[0] });
  } catch (error) {
    console.log("Error in getCabinCrew:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const createCabinCrew = async (req, res) => {
  const { first_name, last_name, age, gender, nationality, known_languages, attendant_type_id, vehicle_restrictions, recipes } = req.body;
  try {
    const newCabinCrew = await sql`
      INSERT INTO cabin_crew (first_name, last_name, age, gender, nationality, known_languages, attendant_type_id)
      VALUES (${first_name}, ${last_name}, ${age}, ${gender}, ${nationality}, ${known_languages}, ${attendant_type_id})
      RETURNING *
    `;

    const createdId = newCabinCrew[0].id;

    // Insert vehicle restrictions
    for (let v of vehicle_restrictions) {
      await sql`
        INSERT INTO cabin_crew_vehicle_restrictions (cabin_crew_id, vehicle_type_id)
        VALUES (${createdId}, ${v})
      `;
    }

    // Insert dish recipes if the attendant is a chef
    if (attendant_type_id === 3) { // Assuming 3 is the ID for chefs
      for (let recipe of recipes) {
        await sql`
          INSERT INTO dish_recipes (chef_id, recipe_name, description)
          VALUES (${createdId}, ${recipe.recipe_name}, ${recipe.description})
        `;
      }
    }

    console.log("Created new cabin crew:", newCabinCrew);
    res.status(201).json({ success: true, data: newCabinCrew[0] });
  } catch (error) {
    console.log("Error in createCabinCrew:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const updateCabinCrew = async (req, res) => {
  const { id } = req.params;
  const { first_name, last_name, age, gender, nationality, known_languages, attendant_type_id, vehicle_restrictions, recipes } = req.body;
  try {
    const updatedCabinCrew = await sql`
      UPDATE cabin_crew
      SET first_name = ${first_name}, last_name = ${last_name}, age = ${age}, gender = ${gender}, 
          nationality = ${nationality}, known_languages = ${known_languages}, attendant_type_id = ${attendant_type_id}
      WHERE id = ${id}
      RETURNING *
    `;

    // Delete existing vehicle restrictions
    await sql`
      DELETE FROM cabin_crew_vehicle_restrictions
      WHERE cabin_crew_id = ${id}
    `;

    // Insert updated vehicle restrictions
    for (let v of vehicle_restrictions) {
      await sql`
        INSERT INTO cabin_crew_vehicle_restrictions (cabin_crew_id, vehicle_type_id)
        VALUES (${id}, ${v})
      `;
    }

    // Delete existing dish recipes if the attendant is a chef
    if (attendant_type_id === 3) {
      await sql`
        DELETE FROM dish_recipes
        WHERE chef_id = ${id}
      `;

      // Insert updated dish recipes
      for (let recipe of recipes) {
        await sql`
          INSERT INTO dish_recipes (chef_id, recipe_name, description)
          VALUES (${id}, ${recipe.recipe_name}, ${recipe.description})
        `;
      }
    }

    console.log("Updated cabin crew:", updatedCabinCrew);
    res.status(200).json({ success: true, data: updatedCabinCrew[0] });
  } catch (error) {
    console.log("Error in updateCabinCrew:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const deleteCabinCrew = async (req, res) => {
  const { id } = req.params;
  try {
    await sql`
      DELETE FROM cabin_crew
      WHERE id = ${id}
    `;
    console.log("Deleted cabin crew with ID:", id);
    res.status(200).json({ success: true, message: "Cabin crew deleted successfully" });
  } catch (error) {
    console.log("Error in deleteCabinCrew:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};