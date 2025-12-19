import { sql } from "../config/db.js";
import bcrypt from "bcryptjs";

const SAMPLE_USERS = [
  //---------Admin-------------
  { name: "admin", password: "admin123", role: "Admin" },
  //----------Pilots-----------
  //Senior
  { name: "john1", password: "john123", role: "Pilot", pilot_id: 1 }, // John Smith from pilots table
  { name: "sarah1", password: "sarah123", role: "Pilot", pilot_id: 2 }, // Sarah Johnson from pilots table
  { name: "michael1", password: "michael123", role: "Pilot", pilot_id: 3 }, // Michael Chen from pilots table
  //Junior
  { name: "emily1", password: "emily123", role: "Pilot", pilot_id: 4 }, // Emily Davis from pilots table
  { name: "david1", password: "david123", role: "Pilot", pilot_id: 5 }, // David Wilson from pilots table 
  { name: "lisa1", password: "lisa123", role: "Pilot", pilot_id: 6 }, // Lisa Anderson from pilots table
  { name: "robert1", password: "robert123", role: "Pilot", pilot_id: 7 }, // Robert Brown from pilots table
  //Trainee
  { name: "james1", password: "james123", role: "Pilot", pilot_id: 8 }, // James Taylor from pilots table
  { name: "maria1", password: "maria123", role: "Pilot", pilot_id: 9 }, // Maria Garcia from pilots table
  { name: "thomas1", password: "thomas123", role: "Pilot", pilot_id: 10 }, // Thomas Lee from pilots table
  //Mix Type
  //Senior
  { name: "anna1", password: "anna123", role: "Pilot", pilot_id: 11 }, // Anna Kowalski from pilots table
  //Junior
  { name: "carlos1", password: "carlos123", role: "Pilot", pilot_id: 12 }, // Carlos Rodriguez from pilots table
  { name: "sophie1", password: "sophie123", role: "Pilot", pilot_id: 13 }, // Sophie Martin from pilots table
  //Trainee
  { name: "ahmed1", password: "ahmed23", role: "Pilot", pilot_id: 14 }, // Ahmed Hassan from pilots table
  { name: "yuki1", password: "tanaka123", role: "Pilot", pilot_id: 15 }, // Yuki Tanaka from pilots table


  //---------Cabin_Crew--------------
  //attendant_type: 1 , flight_attendant
  { name: "emma1", password: "emma123", role: "CabinCrew", cabin_crew_id: 1 }, //Emma Johnson from cabin_crew table
  { name: "oliver1", password: "oliver123", role: "CabinCrew", cabin_crew_id: 2 }, //Oliver Smith from cabin_crew table 
  { name: "liam1", password: "liam123", role: "CabinCrew", cabin_crew_id: 4 }, //Liam Brown from cabin_crew table
  { name: "mia1", password: "mia123", role: "CabinCrew", cabin_crew_id: 7 }, //Mia Anderson from cabin_crew table
  { name: "ethan1", password: "ethan123", role: "CabinCrew", cabin_crew_id: 8 }, //Ethan Taylor from cabin_crew table
  //attendant_type: 2 , senior_flight_attendant
  { name: "sophia1", password: "sophia123", role: "CabinCrew", cabin_crew_id: 3 }, //Sophia Garcia from cabin_crew table
  //attendant_type: 3 , chef
  { name: "isabella1", password: "isabella123", role: "CabinCrew", cabin_crew_id: 5 }, //Isabella Martinez from cabin_crew table
  //attendant_type: 4 , purser
  { name: "noah1", password: "noah123", role: "CabinCrew", cabin_crew_id: 6 }, //Noah Wilson from cabin_crew table


  //---------Passenger----------------
  { name: "ahmet1", password: "ahmet123", role: "Passenger", passenger_id: 1 },    // Ahmet Yilmaz
  { name: "ayse1", password: "ayse123", role: "Passenger", passenger_id: 2 },    // Ayse Yilmaz
  { name: "can1", password: "can123", role: "Passenger", passenger_id: 3 },    // Can Yilmaz
  { name: "bebek1", password: "bebek123", role: "Passenger", passenger_id: 4 },    // Bebek Yilmaz

  { name: "johns1", password: "johns123", role: "Passenger", passenger_id: 5 },    // John Smith //exists in pilots
  { name: "sarahs1", password: "sarahs123", role: "Passenger", passenger_id: 6 },    // Sarah Smith //exists in pilots
  { name: "mike1", password: "mike123", role: "Passenger", passenger_id: 7 },    // Mike Smith
  { name: "hans1", password: "hans123", role: "Passenger", passenger_id: 8 },    // Hans Muller
  { name: "elena1", password: "elena123", role: "Passenger", passenger_id: 9 },    // Elena Rossi
  { name: "yukit1", password: "yukit123", role: "Passenger", passenger_id: 10 },    // Yuki Tanaka //exists 
  { name: "pierre1", password: "pierre123", role: "Passenger", passenger_id: 11 },    // Pierre Dubois
  { name: "linda1", password: "linda123", role: "Passenger", passenger_id: 12 },    // Linda Johnson
  { name: "mariag1", password: "mariag123", role: "Passenger", passenger_id: 13 },    // Maria Garcia //exists 
  { name: "lars1", password: "lars123", role: "Passenger", passenger_id: 14 },    // Lars Jensen
  { name: "sophiem1", password: "sophiem123", role: "Passenger", passenger_id: 15 },    // Sophie Martin 
  { name: "ali1", password: "ali23", role: "Passenger", passenger_id: 16 },    // Ali Vural
  { name: "zeynep1", password: "zeynep123", role: "Passenger", passenger_id: 17 },    // Zeynep Demir
  { name: "ibrahim1", password: "ibrahim123", role: "Passenger", passenger_id: 18 },    // Ibrahim Kaya 
  { name: "bruce1", password: "bruce123", role: "Passenger", passenger_id: 19 },    // Bruce Wayne 
  { name: "clark1", password: "clark123", role: "Passenger", passenger_id: 29 },    // Clark Kent
  { name: "diana1", password: "diana123", role: "Passenger", passenger_id: 21 },    // Diana Prince 
  { name: "peter1", password: "peter123", role: "Passenger", passenger_id: 22 },    // Peter Parker


];

export async function seedUsers() {
  try {
    console.log("Tables are ready. Seeding users...");

    await sql`TRUNCATE TABLE users RESTART IDENTITY CASCADE`;

    for (const user of SAMPLE_USERS) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      await sql`
        INSERT INTO users (name, password, role, pilot_id, cabin_crew_id, passenger_id)
        VALUES (${user.name}, ${hashedPassword}, ${user.role}, ${user.pilot_id ?? null}, ${user.cabin_crew_id ?? null}, ${user.passenger_id ?? null})
      `;
      console.log("Seeded user:", user.name);
    }

    console.log("✅ Users table seeded successfully");
  } catch (error) {
    console.error("❌ Error seeding users table:", error);
    throw error;
  }
}
