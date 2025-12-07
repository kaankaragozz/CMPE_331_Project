//Kaan:  Flight
import { initDB_airports } from "./initDB_airports.js";
import { initDB_flights } from "./initDB_flights.js";
import { initDB_vehicle_types } from "./initDB_vehicle_types.js";

//Yusuf: CabinCrew
import { initDB_cabin_crew } from "./initDB_cabin_crew.js";
import { initDB_dish_recipes } from "./initDB_dish_recipes.js";
import { initDB_cabin_crew_vehicle_restrictions } from "./initDB_cabin_crew_vehicle_restrictions.js";
import { initDB_attendant_types } from "./initDB_attendant_types.js";

//Tunahan: Pilot
import { initDB_pilots } from "./initDB_pilots.js";
//import { initDB_pilots_languages } from "./initDB_pilots_languages.js";

//Arif: Passenger



export async function initDB() {
  try {
    // Await each async table creation
    //Kaan:Flight
    await initDB_airports();
    await initDB_flights();
    await initDB_vehicle_types();

    //Yusuf:CabinCrew
    await initDB_attendant_types();
    await initDB_cabin_crew_vehicle_restrictions();
    await initDB_cabin_crew();
    await initDB_dish_recipes();

    //Tunahan:Pilot
    await initDB_pilots();
    //await  initDB_pilots_languages();

    //Arif:Passenger

    console.log("DataBase initialized successfully")
  } catch (error) {
    console.log("Error initDB", error);
  }
};