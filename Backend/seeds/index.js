import { execSync } from "child_process";

console.log("🌱 Seeding database...");

try {
  //Kaan:Flight
  execSync("node seeds/vehicle_types.js", { stdio: "inherit" });

  //Arif:Passenger
  execSync("node seeds/seat_type.js", { stdio: "inherit" });



  // add more as needed...

  console.log("✅ All seeds completed successfully!");
} catch (error) {
  console.error("❌ Seeding failed:", error);
  process.exit(1);
}