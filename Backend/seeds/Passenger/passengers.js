import { sql } from "../../config/db.js";

const SAMPLE_PASSENGERS = [
  { flight_id: 101, name: "Alice Johnson", age: 28, gender: "F", nationality: "Turkish", seat_type: "Economy" },
  { flight_id: 102, name: "Bob Smith", age: 34, gender: "M", nationality: "German", seat_type: "Business" },
  { flight_id: 103, name: "Carla Gomez", age: 22, gender: "F", nationality: "Spanish", seat_type: "Economy" },
  { flight_id: 101, name: "David Lee", age: 45, gender: "M", nationality: "Korean", seat_type: "First Class" },
  { flight_id: 104, name: "Emma Brown", age: 31, gender: "F", nationality: "British", seat_type: "Business" },
  { flight_id: 105, name: "Frank Wilson", age: 39, gender: "M", nationality: "American", seat_type: "Economy" },
  { flight_id: 102, name: "Grace Chen", age: 27, gender: "F", nationality: "Chinese", seat_type: "Economy" },
  { flight_id: 103, name: "Henry Davis", age: 50, gender: "M", nationality: "Canadian", seat_type: "First Class" },
  { flight_id: 104, name: "Isabella Rossi", age: 24, gender: "F", nationality: "Italian", seat_type: "Business" },
  { flight_id: 105, name: "Jack Thompson", age: 36, gender: "M", nationality: "Australian", seat_type: "Economy" },

  { flight_id: 101, name: "Karen Taylor", age: 29, gender: "F", nationality: "Dutch", seat_type: "Economy" },
  { flight_id: 102, name: "Liam Martinez", age: 41, gender: "M", nationality: "Mexican", seat_type: "Business" },
  { flight_id: 103, name: "Mia Patel", age: 26, gender: "F", nationality: "Indian", seat_type: "Economy" },
  { flight_id: 104, name: "Noah Anderson", age: 38, gender: "M", nationality: "Swedish", seat_type: "First Class" },
  { flight_id: 105, name: "Olivia Clark", age: 32, gender: "F", nationality: "Canadian", seat_type: "Business" },
  { flight_id: 101, name: "Peter Walker", age: 44, gender: "M", nationality: "Irish", seat_type: "Economy" },
  { flight_id: 102, name: "Quinn Lewis", age: 23, gender: "F", nationality: "New Zealander", seat_type: "Economy" },
  { flight_id: 103, name: "Ryan Hall", age: 37, gender: "M", nationality: "British", seat_type: "Business" },
  { flight_id: 104, name: "Sophia Allen", age: 30, gender: "F", nationality: "French", seat_type: "Economy" },
  { flight_id: 105, name: "Thomas Young", age: 48, gender: "M", nationality: "German", seat_type: "First Class" },
  { flight_id: 101, name: "Uma Scott", age: 25, gender: "F", nationality: "Japanese", seat_type: "Economy" },
  { flight_id: 102, name: "Victor King", age: 33, gender: "M", nationality: "American", seat_type: "Business" },
  { flight_id: 103, name: "Wendy Adams", age: 27, gender: "F", nationality: "Canadian", seat_type: "Economy" },
  { flight_id: 104, name: "Xander Baker", age: 40, gender: "M", nationality: "Australian", seat_type: "First Class" },
  { flight_id: 105, name: "Yara Rivera", age: 29, gender: "F", nationality: "Brazilian", seat_type: "Business" },
  { flight_id: 101, name: "Zachary White", age: 35, gender: "M", nationality: "Irish", seat_type: "Economy" },
  { flight_id: 102, name: "Abby Green", age: 31, gender: "F", nationality: "Swedish", seat_type: "Economy" },
  { flight_id: 103, name: "Brandon Carter", age: 42, gender: "M", nationality: "British", seat_type: "Business" },
  { flight_id: 104, name: "Clara Moore", age: 28, gender: "F", nationality: "Italian", seat_type: "Economy" },
  { flight_id: 105, name: "Daniel Perez", age: 46, gender: "M", nationality: "Spanish", seat_type: "First Class" },

];

async function seedDatabase() {
  try {
    // first, clear existing data
    await sql`TRUNCATE TABLE passengers RESTART IDENTITY`;

    // insert all passengers
    for (const passengers of SAMPLE_PASSENGERS) {
      await sql`
        INSERT INTO passengers (flight_id, name, age, gender, nationality, seat_type)
        VALUES (${passengers.flight_id}, ${passengers.name}, ${passengers.age}, ${passengers.gender}, ${passengers.nationality}, ${passengers.seat_type})
      `;
    }

    console.log("Passengers Database seeded successfully");
    process.exit(0); // success code
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1); // failure code
  }
}

seedDatabase();