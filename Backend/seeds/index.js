import { execSync } from "child_process";

console.log("🌱 Seeding database...");

try {
  //Hakan: Auth
  execSync("node ./seeds/Auth/users.js", { stdio: "inherit" });

  /* //Kaan:Flight
  execSync("node seeds/airports.js", { stdio: "inherit" });
  execSync("node seeds/vehicle_types.js", { stdio: "inherit" });
  execSync("node seeds/vehicle_types.js", { stdio: "inherit" });

  //Yusuf:CabinCrew
  execSync("node seeds/attendant_types.js", { stdio: "inherit" });
  execSync("node seeds/cabin_crew_vehicle_restrictions.js", { stdio: "inherit" });
  execSync("node seeds/dish_recipes.js", { stdio: "inherit" });
  execSync("node seeds/cabin_crew.js", { stdio: "inherit" });

  //Tunahan:Pilot
  execSync("node seeds/pilots.js", { stdio: "inherit" });
  execSync("node seeds/pilots_languages.js", { stdio: "inherit" });

  //Arif:Passenger
  execSync("node seeds/passengers.js", { stdio: "inherit" });
  execSync("node seeds/flight_passengers_assignments.js", { stdio: "inherit" });
  execSync("node seeds/seat_type.js", { stdio: "inherit" });
  execSync("node seeds/affiliated_seating.js", { stdio: "inherit" });
  execSync("node seeds/infant_parent_relationship.js", { stdio: "inherit" });
 */



  // add more as needed...

  console.log("✅ All seeds completed successfully!");
} catch (error) {
  console.error("❌ Seeding failed:", error);
  process.exit(1);
}