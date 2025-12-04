import { sql } from '../config/db.js';

// GET: Retrieve all passengers for a specific flight
export const getPassengersByFlight = async (req, res) => {
  const { flight_number } = req.params;

  try {
    // Joins passengers with their assignments and seat types
    const passengers = await sql`
      SELECT 
        p.passenger_id,
        p.name,
        p.age,
        p.gender,
        p.nationality,
        fpa.seat_number,
        st.type_name as seat_class, -- Changed alias to clarify it's class (Business/Economy)
        fpa.is_infant
      FROM flight_passenger_assignments fpa
      JOIN passengers p ON fpa.passenger_id = p.passenger_id
      LEFT JOIN seat_type st ON fpa.seat_type_id = st.seat_type_id
      WHERE fpa.flight_number = ${flight_number}
    `;

    res.status(200).json({ success: true, data: passengers });
  } catch (error) {
    console.error('Error fetching passengers:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// POST: Add a new passenger and assign them to a flight (initially without a seat)
export const addPassengerToFlight = async (req, res) => {
  const { 
    name, age, gender, nationality, 
    flight_number, seat_type_id, is_infant 
  } = req.body;

  try {
    // 1. Insert into passengers table
    const newPassenger = await sql`
      INSERT INTO passengers (name, age, gender, nationality)
      VALUES (${name}, ${age}, ${gender}, ${nationality})
      RETURNING passenger_id
    `;
    const passengerId = newPassenger[0].passenger_id;

    // 2. Assign to flight (seat_number is NULL initially)
    await sql`
      INSERT INTO flight_passenger_assignments 
      (passenger_id, flight_number, seat_type_id, is_infant)
      VALUES 
      (${passengerId}, ${flight_number}, ${seat_type_id || null}, ${is_infant || false})
    `;

    res.status(201).json({ success: true, message: 'Passenger added to flight', passengerId });
  } catch (error) {
    console.error('Error adding passenger:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// PUT: Automatic Seat Assignment
export const autoAssignSeats = async (req, res) => {
  const { flight_number } = req.params;

  try {
    // 1. Fetch the seating plan for the flight's specific vehicle type
    const flightInfo = await sql`
      SELECT v.seating_plan
      FROM flights f
      JOIN vehicle_types v ON f.vehicle_type_id = v.id
      WHERE f.flight_number = ${flight_number}
    `;

    if (flightInfo.length === 0) {
      return res.status(404).json({ success: false, message: 'Flight or Vehicle Type not found.' });
    }

    const seatingPlan = flightInfo[0].seating_plan;

    if (!seatingPlan || !Array.isArray(seatingPlan)) {
        return res.status(500).json({ success: false, message: 'Invalid seating plan format in database.' });
    }

    // 2. Get all currently occupied seats for this flight
    const occupiedSeatsResult = await sql`
      SELECT seat_number FROM flight_passenger_assignments 
      WHERE flight_number = ${flight_number} AND seat_number IS NOT NULL
    `;
    const occupiedSeats = new Set(occupiedSeatsResult.map(r => r.seat_number));

    // 3. Get all passengers who do NOT have a seat yet
    const unseatedPassengers = await sql`
      SELECT passenger_id, seat_type_id FROM flight_passenger_assignments
      WHERE flight_number = ${flight_number} AND seat_number IS NULL
    `;

    if (unseatedPassengers.length === 0) {
      return res.status(200).json({ success: true, message: 'All passengers already have seats.' });
    }

    // 4. Create a map of Seat Type IDs to Names
    const seatTypes = await sql`SELECT seat_type_id, type_name FROM seat_type`;
    const typeMap = {}; 
    seatTypes.forEach(t => typeMap[t.seat_type_id] = t.type_name);

    let assignedCount = 0;
    
    // 5. Loop through unseated passengers and find a matching seat
    for (const passenger of unseatedPassengers) {
      
      const passengerClassPreference = typeMap[passenger.seat_type_id];

      // Find a seat in the plan that:
      // a) Is NOT in the occupied set
      // b) Matches the passenger's class preference (if they have one)
      const seatFound = seatingPlan.find(seatObj => {
        const isOccupied = occupiedSeats.has(seatObj.seat);
        const classMatches = passengerClassPreference ? seatObj.class === passengerClassPreference : true;
        return !isOccupied && classMatches;
      });

      if (seatFound) {
        // Assign the seat in the database
        await sql`
          UPDATE flight_passenger_assignments
          SET seat_number = ${seatFound.seat}
          WHERE passenger_id = ${passenger.passenger_id} AND flight_number = ${flight_number}
        `;

        // Mark as occupied for the next iteration within this loop
        occupiedSeats.add(seatFound.seat);
        assignedCount++;
      }
    }

    if (assignedCount === 0 && unseatedPassengers.length > 0) {
         return res.status(409).json({ 
            success: false, 
            message: 'Could not assign seats. Plane might be full or no seats match class preference.' 
        });
    }

    res.status(200).json({ 
      success: true, 
      message: `Successfully assigned seats to ${assignedCount} passengers.` 
    });

  } catch (error) {
    console.error('Error in auto seat assignment:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// GET: Get affiliated passengers (Families/Groups)
export const getAffiliatedPassengers = async (req, res) => {
  const { flight_number } = req.params;
  try {
    const affiliations = await sql`
      SELECT 
        p1.name as main_passenger,
        p2.name as affiliated_passenger
      FROM affiliated_seating a
      JOIN passengers p1 ON a.main_passenger_id = p1.passenger_id
      JOIN passengers p2 ON a.affiliated_passenger_id = p2.passenger_id
      WHERE a.flight_number = ${flight_number}
    `;
    res.status(200).json({ success: true, data: affiliations });
  } catch (error) {
    console.error('Error fetching affiliations:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// PUT: Manual Seat Assignment
export const assignSeatManually = async (req, res) => {
  const { flight_number } = req.params;
  const { passenger_id, seat_number } = req.body;

  // Validate inputs
  if (!passenger_id || !seat_number) {
    return res.status(400).json({ success: false, message: 'Passenger ID and Seat Number are required.' });
  }

  try {
    // 1. Check if the target seat is already occupied by SOMEONE
    const seatCheck = await sql`
      SELECT passenger_id FROM flight_passenger_assignments
      WHERE flight_number = ${flight_number} 
      AND seat_number = ${seat_number}
      AND passenger_id != ${passenger_id}
    `;

    if (seatCheck.length > 0) {
      return res.status(409).json({ 
        success: false, 
        message: `Seat ${seat_number} is already occupied by another passenger.` 
      });
    }

    // 2. Update the passenger's seat assignment
    const result = await sql`
      UPDATE flight_passenger_assignments
      SET seat_number = ${seat_number}
      WHERE flight_number = ${flight_number} AND passenger_id = ${passenger_id}
      RETURNING seat_number
    `;

    if (result.length === 0) {
      return res.status(404).json({ success: false, message: 'Passenger not found on this flight.' });
    }

    res.status(200).json({ 
      success: true, 
      message: `Seat ${seat_number} manually assigned to passenger ${passenger_id}.` 
    });

  } catch (error) {
    console.error('Error in manual seat assignment:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};