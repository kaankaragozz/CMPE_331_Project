import { execSync } from "child_process";

console.log("🌱 Seeding database...");

export async function seedDB() {
  try {
    //Hakan: Auth
    execSync("node ./seeds/Auth/users.js", { stdio: "inherit" });

    //Kaan:Flight
    execSync("node seeds/Flight/airports.js", { stdio: "inherit" });
    execSync("node seeds/Flight/vehicle_types.js", { stdio: "inherit" });
    execSync("node seeds/Flight/flights.js", { stdio: "inherit" });

    //Yusuf:CabinCrew
    execSync("node seeds/CabinCrew/attendant_types.js", { stdio: "inherit" });
    execSync("node seeds/CabinCrew/cabin_crew.js", { stdio: "inherit" });
    execSync("node seeds/CabinCrew/dish_recipes.js", { stdio: "inherit" });
    execSync("node seeds/CabinCrew/cabin_crew_vehicle_restrictions.js", { stdio: "inherit" });

    // Tunahan: Pilot
    execSync("node seeds/Pilot/pilots_languages.js", { stdio: "inherit" });
    execSync("node seeds/Pilot/pilots.js", { stdio: "inherit" });

    //Arif:Passenger
    execSync("node seeds/Passenger/seat_type.js", { stdio: "inherit" });
    execSync("node seeds/Passenger/passengers.js", { stdio: "inherit" });
    execSync("node seeds/Passenger/flight_passengers_assignments.js", { stdio: "inherit" });
    execSync("node seeds/Passenger/affiliated_seating.js", { stdio: "inherit" });
    execSync("node seeds/Passenger/infant_parent_relationship.js", { stdio: "inherit" });



    // add more as needed...

    console.log("✅ All seeds completed successfully!");
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
}

