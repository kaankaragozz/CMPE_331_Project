import { sql } from '../config/db.js';

// Assign a recipe to a flight using flight_crew_assignments table
export async function assignRecipeToFlight(req, res) {
  const { flight_number } = req.params;
  const { crew_id, recipe_id } = req.body;

  try {
    // 1. Get flight_id from flight_number
    const flightRes = await sql`
      SELECT id FROM flights WHERE flight_number = ${flight_number}
    `;
    if (flightRes.length === 0) {
      return res.status(404).json({ success: false, message: "Flight not found." });
    }
    const flightId = flightRes[0].id;

    // 2. Check if the chef is assigned to this flight
    const flightCrew = await sql`
      SELECT cabin_crew_ids FROM flight_crew_assignments WHERE flight_id = ${flightId}
    `;
    if (flightCrew.length === 0) {
      return res.status(400).json({ success: false, message: "No crew assigned to this flight." });
    }

    const cabinCrewIds = flightCrew[0].cabin_crew_ids || [];
    if (!cabinCrewIds.includes(crew_id)) {
      return res.status(400).json({ success: false, message: "Chef not assigned to this flight." });
    }

    // 3. Check if the chef owns the recipe
    const chefRecipe = await sql`
      SELECT * FROM dish_recipes
      WHERE id = ${recipe_id} AND chef_id = ${crew_id}
    `;
    if (chefRecipe.length === 0) {
      return res.status(400).json({ success: false, message: "Chef does not own this recipe." });
    }

    // 4. Check if a recipe is already assigned for this flight & chef
    const existing = await sql`
      SELECT * FROM flight_recipe
      WHERE flight_id = ${flightId} AND crew_id = ${crew_id}
    `;

    let result;
    if (existing.length > 0) {
      // Update existing assignment
      result = await sql`
        UPDATE flight_recipe
        SET recipe_id = ${recipe_id}
        WHERE flight_id = ${flightId} AND crew_id = ${crew_id}
        RETURNING *
      `;
    } else {
      // Insert new assignment
      result = await sql`
        INSERT INTO flight_recipe (flight_id, crew_id, recipe_id)
        VALUES (${flightId}, ${crew_id}, ${recipe_id})
        RETURNING *
      `;
    }

    res.json({ success: true, data: result[0] });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error." });
  }
}

// Get all recipes assigned to a flight
export async function getAssignedRecipes(req, res) {
  const { flight_number } = req.params;

  try {
    // 1. Get flight_id from flight_number
    const flightRes = await sql`
      SELECT id FROM flights WHERE flight_number = ${flight_number}
    `;
    if (flightRes.length === 0) {
      return res.status(404).json({ success: false, message: "Flight not found." });
    }
    const flightId = flightRes[0].id;

    // 2. Fetch all assigned recipes for this flight
    const assigned = await sql`
      SELECT fr.id, fr.flight_id, fr.crew_id, fr.recipe_id, dr.recipe_name, dr.description
      FROM flight_recipe fr
      JOIN dish_recipes dr ON fr.recipe_id = dr.id
      WHERE fr.flight_id = ${flightId}
    `;

    res.json({ success: true, data: assigned });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error." });
  }
}
