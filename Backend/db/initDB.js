
//Hakan:Auth
import { initDB_users } from "../db/Auth/initDB_users.js";

//Kaan:  Flight
import { initAirportsTable } from "../db/Flight/initDB_airports.js";
import { initFlightsTable } from "../db/Flight/initDB_flights.js";
import { initVehicleTypesTable } from "../db/Flight/initDB_vehicle_types.js";

//Yusuf: CabinCrew
import { initDB_cabin_crew } from "./CabinCrew/initDB_cabin_crew.js";
import { initDB_dish_recipes } from "./CabinCrew/initDB_dish_recipes.js";
import { initDB_cabin_crew_vehicle_restrictions } from "./CabinCrew/initDB_cabin_crew_vehicle_restrictions.js";
import { initDB_attendant_types } from "./CabinCrew/initDB_attendant_types.js";

/*
//Arif: Passenger
import { initDB_affiliated_seating } from './Passenger/initDB_affiliated_seating.js';
import { initDB_flight_passengers_assignments } from './Passenger/initDB_flight_passengers_assignments.js';
import { initDB_infant_parent_relationship } from './Passenger/initDB_infant_parent_relationship.js';
import { initDB_passengers } from './Passenger/initDB_passengers.js';
import { initDB_seat_type } from './Passenger/initDB_seat_type.js';
*/

// Tunahan: Pilot
import { createPilotsTable } from './Pilot/initDB_pilots.js'; 
import { 
    createLanguagesTable, 
    createPilotLanguagesTable 
} from './Pilot/initDB_pilots_languages.js';

export async function initDB() {
  try {
    // Await each async table creation
    //Hakan:Auth
    await initDB_users();

    //Kaan:Flight
    await initAirportsTable();
    await initFlightsTable();
    await initVehicleTypesTable();

    //Yusuf:CabinCrew
    await initDB_attendant_types();
    await initDB_cabin_crew();
    await initDB_dish_recipes();
    await initDB_cabin_crew_vehicle_restrictions();

    /*
    //Arif:Passenger
    await initDB_affiliated_seating();
    await initDB_flight_passengers_assignments();
    await initDB_infant_parent_relationship();
    await initDB_passengers();
    await initDB_seat_type();

    */ 
   
    // Tunahan: Pilot
    await createPilotsTable();
    await createLanguagesTable();
    await createPilotLanguagesTable();
    
    console.log("DataBase initialized successfully")
  } catch (error) {
    console.log("Error initDB", error);
  }
};