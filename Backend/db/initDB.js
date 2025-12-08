
//Hakan:Auth
import { initDB_users } from "../db/Auth/initDB_users.js";

//Kaan:  Flight
import { initAirportsTable } from "../db/Flight/initDB_airports.js";
import { initFlightsTable } from "../db/Flight/initDB_flights.js";
import { initVehicleTypesTable } from "../db/Flight/initDB_vehicle_types.js";

/*

//Yusuf: CabinCrew
import { initDB_cabin_crew } from "../db/CabinCrew/initDB_cabin_crew.js";
import { initDB_dish_recipes } from "../db/CabinCrew/initDB_dish_recipes.js";
import { initDB_cabin_crew_vehicle_restrictions } from "../db/CabinCrew/initDB_cabin_crew_vehicle_restrictions.js";
import { initDB_attendant_types } from "../db/CabinCrew/initDB_attendant_types.js";

//Tunahan: Pilot
import { initDB_pilots } from "../db/Pilot/initDB_pilots.js";
import { initDB_pilots_languages } from "../db/Pilot/initDB_pilots_languages.js";


//Arif: Passenger
import { initDB_passengers } from "../db/Passenger/initDB_passengers.js";
import { initDB_flight_passengers_assignments } from "../db/Passenger/initDB_flight_passengers_assignments.js";
import { initDB_seat_type } from "../db/Passenger/initDB_seat_type.js";
import { initDB_affiliated_seating } from "../db/Passenger/initDB_affiliated_seating.js";
import { initDB_infat_parent_relationship } from "../db/Passenger/initDB_infant_parent_relationship.js";
*/





export async function initDB() {
  try {
    // Await each async table creation
    //Hakan:Auth
    await initDB_users();

    //Kaan:Flight
    await initAirportsTable();
    await initFlightsTable();
    await initVehicleTypesTable();

    /*

    //Yusuf:CabinCrew
    await initDB_attendant_types();
    await initDB_cabin_crew_vehicle_restrictions();
    await initDB_cabin_crew();
    await initDB_dish_recipes();

    //Tunahan:Pilot
    await initDB_pilots();
    await initDB_pilots_languages();

    //Arif:Passenger
    await initDB_passengers();
    await initDB_flight_passengers_assignments();
    await initDB_seat_type();
    await initDB_affiliated_seating();
    await initDB_infat_parent_relationship();
    */


    console.log("DataBase initialized successfully")
  } catch (error) {
    console.log("Error initDB", error);
  }
};