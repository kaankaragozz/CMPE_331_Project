import { execSync } from "child_process";

console.log("🌱 Seeding database...");

try {
  //Kaan:Flight
  execSync("node seeds/airports.js", { stdio: "inherit" });
  execSync("node seeds/vehicle_types.js", { stdio: "inherit" });
  //Yusuf:CabinCrew
  execSync("node seeds/attendant_types.js", { stdio: "inherit" });
  execSync("node seeds/cabin_crew_vehicle_restrictions.js", { stdio: "inherit" });
  execSync("node seeds/dish_recipes.js", { stdio: "inherit" });
  //Tunahan:Pilot
  execSync("node seeds/pilots.js", { stdio: "inherit" });
  //Arif:Passenger
  execSync("node seeds/passengers.js", { stdio: "inherit" });


  // add more as needed...

  console.log("✅ All seeds completed successfully!");
} catch (error) {
  console.error("❌ Seeding failed:", error);
  process.exit(1);
}