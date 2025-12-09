import { execSync } from "child_process";

console.log("🌱 Seeding database...");

try {
  //Hakan: Auth
  execSync("node -r dotenv/config Backend/seeds/Auth/users.js", { stdio: "inherit" });

  //Kaan:Flight
  execSync("node -r dotenv/config Backend/seeds/Flight/airports.js", { stdio: "inherit" });
  execSync("node -r dotenv/config Backend/seeds/Flight/vehicle_types.js", { stdio: "inherit" });
  execSync("node -r dotenv/config Backend/seeds/Flight/flights.js", { stdio: "inherit" });

  //Yusuf:CabinCrew
  execSync("node -r dotenv/config Backend/seeds/CabinCrew/attendant_types.js", { stdio: "inherit" });
  execSync("node -r dotenv/config Backend/seeds/CabinCrew/cabin_crew.js", { stdio: "inherit" });
  execSync("node -r dotenv/config Backend/seeds/CabinCrew/dish_recipes.js", { stdio: "inherit" });
  execSync("node -r dotenv/config Backend/seeds/CabinCrew/cabin_crew_vehicle_restrictions.js", { stdio: "inherit" });

  //Tunahan:Pilot
  execSync("node -r dotenv/config Backend/seeds/Pilot/languages.js", { stdio: "inherit" });
  execSync("node -r dotenv/config Backend/seeds/Pilot/pilots.js", { stdio: "inherit" });

  //Arif:Passenger
  //execSync("node -r dotenv/config Backend/seeds/Passenger/passengers.js", { stdio: "inherit" });
  //execSync("node -r dotenv/config Backend/seeds/Passenger/flight_passengers_assignments.js", { stdio: "inherit" });
  execSync("node -r dotenv/config Backend/seeds/Passenger/seat_type.js", { stdio: "inherit" });
  //execSync("node -r dotenv/config Backend/seeds/Passenger/affiliated_seating.js", { stdio: "inherit" });
  //execSync("node -r dotenv/config Backend/seeds/Passenger/infant_parent_relationship.js", { stdio: "inherit" });



  // add more as needed...

  console.log("✅ All seeds completed successfully!");
} catch (error) {
  console.error("❌ Seeding failed:", error);
  process.exit(1);
}
