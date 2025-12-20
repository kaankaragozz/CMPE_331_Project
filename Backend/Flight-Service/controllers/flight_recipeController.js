import { sql } from '../config/db.js';

// Assign a recipe to a flight using flight_crew_assignments table
export async function assignRecipeToFlight(req, res) {
  const { flight_number } = req.params; // e.g., AA1001
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

    // 4. Assign recipe to flight
    const insert = await sql`
      INSERT INTO flight_recipe (flight_id, crew_id, recipe_id)
      VALUES (${flightId}, ${crew_id}, ${recipe_id})
      RETURNING *
    `;

    res.json({ success: true, data: insert[0] });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error." });
  }
}
