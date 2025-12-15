import { sql } from '../../config/db.js';

/* ===============================================================
   1. PASSENGER & ASSIGNMENT CORE OPERATIONS
   =============================================================== */

// GET: Retrieve all passengers (General Admin View)
export const getAllPassengers = async (req, res) => {
  try {
    const passengers = await sql`SELECT * FROM passengers ORDER BY passenger_id DESC`;
    res.status(200).json({ success: true, data: passengers });
  } catch (error) {
    console.error('Error fetching all passengers:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// GET: Retrieve a single passenger by ID
export const getPassengerById = async (req, res) => {
  const { id } = req.params;
  try {
    const passenger = await sql`SELECT * FROM passengers WHERE passenger_id = ${id}`;
    if (passenger.length === 0) {
      return res.status(404).json({ success: false, message: 'Passenger not found' });
    }
    res.status(200).json({ success: true, data: passenger[0] });
  } catch (error) {
    console.error('Error fetching passenger:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// POST: Create a new passenger
export const createPassenger = async (req, res) => {
  const { name, age, gender, nationality } = req.body;

  // Basic Validation
  if (!name || !age) {
    return res.status(400).json({ success: false, message: 'Name and Age are required fields.' });
  }

  try {
    const newPassenger = await sql`
      INSERT INTO passengers (name, age, gender, nationality)
      VALUES (${name}, ${age}, ${gender}, ${nationality})
      RETURNING passenger_id, name, age, gender, nationality
    `;

    res.status(201).json({ 
      success: true, 
      message: 'Passenger created successfully (not assigned to flight yet)', 
      data: newPassenger[0] 
    });

  } catch (error) {
    console.error('Error creating passenger:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// PUT: Update Passenger Details (Name, Age, etc.)
export const updatePassenger = async (req, res) => {
  const { id } = req.params;
  const { name, age, gender, nationality } = req.body;

  try {
    const updated = await sql`
      UPDATE passengers 
      SET name = ${name}, age = ${age}, gender = ${gender}, nationality = ${nationality}
      WHERE passenger_id = ${id}
      RETURNING *
    `;

    if (updated.length === 0) {
      return res.status(404).json({ success: false, message: 'Passenger not found' });
    }

    res.status(200).json({ success: true, message: 'Passenger updated', data: updated[0] });
  } catch (error) {
    console.error('Error updating passenger:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// DELETE: Delete Passenger (Cascade will remove assignments and links)
export const deletePassenger = async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = await sql`DELETE FROM passengers WHERE passenger_id = ${id} RETURNING passenger_id`;
    
    if (deleted.length === 0) {
      return res.status(404).json({ success: false, message: 'Passenger not found' });
    }

    res.status(200).json({ success: true, message: 'Passenger deleted successfully' });
  } catch (error) {
    console.error('Error deleting passenger:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// GET: Retrieve all passengers for a specific flight
export const getPassengersByFlight = async (req, res) => {
  const { flight_number } = req.params;
  try {
    const passengers = await sql`
      SELECT 
        p.passenger_id,
        p.name,
        p.age,
        p.gender,
        p.nationality,
        fpa.seat_number,
        st.type_name as seat_class,
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

// POST: Add a new passenger and assign to flight
export const addPassengerToFlight = async (req, res) => {
  const { name, age, gender, nationality, flight_number, seat_type_id, is_infant } = req.body;
  try {
    const newPassenger = await sql`
      INSERT INTO passengers (name, age, gender, nationality)
      VALUES (${name}, ${age}, ${gender}, ${nationality})
      RETURNING passenger_id
    `;
    const passengerId = newPassenger[0].passenger_id;

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

// DELETE: Remove passenger from a specific flight (Assignment Only)
export const removePassengerFromFlight = async (req, res) => {
  const { flight_number, passenger_id } = req.params;
  try {
    const deleted = await sql`
      DELETE FROM flight_passenger_assignments 
      WHERE flight_number = ${flight_number} AND passenger_id = ${passenger_id}
      RETURNING id
    `;
    if (deleted.length === 0) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }
    res.status(200).json({ success: true, message: 'Passenger removed from flight' });
  } catch (error) {
    console.error('Error removing passenger from flight:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

/* ===============================================================
   2. SEAT ASSIGNMENT LOGIC (AUTO & MANUAL)
   =============================================================== */

// Helper for seat letters
const getSeatLetter = (index) => String.fromCharCode(65 + index);

// PUT: Auto Assign Seats
export const autoAssignSeats = async (req, res) => {
  const { flight_number } = req.params;
  try {
    const flightInfo = await sql`
      SELECT v.seating_plan FROM flights f
      JOIN vehicle_types v ON f.vehicle_type_id = v.id
      WHERE f.flight_number = ${flight_number}
    `;

    if (flightInfo.length === 0) {
      return res.status(404).json({ success: false, message: 'Flight not found.' });
    }

    const seatingPlanConfig = flightInfo[0].seating_plan;
    const generatedSeats = [];
    let currentRow = 1;

    // Generate Business Seats
    if (seatingPlanConfig.business) {
      const { rows, seats_per_row } = seatingPlanConfig.business;
      for (let r = 1; r <= rows; r++) {
        for (let c = 0; c < seats_per_row; c++) {
          generatedSeats.push({ seat: `${currentRow}${getSeatLetter(c)}`, class: 'Business' });
        }
        currentRow++;
      }
    }

    // Generate Economy Seats
    if (seatingPlanConfig.economy) {
      const { rows, seats_per_row } = seatingPlanConfig.economy;
      for (let r = 1; r <= rows; r++) {
        for (let c = 0; c < seats_per_row; c++) {
          generatedSeats.push({ seat: `${currentRow}${getSeatLetter(c)}`, class: 'Economy' });
        }
        currentRow++;
      }
    }

    const occupiedSeatsResult = await sql`
      SELECT seat_number FROM flight_passenger_assignments 
      WHERE flight_number = ${flight_number} AND seat_number IS NOT NULL
    `;
    const occupiedSeats = new Set(occupiedSeatsResult.map(r => r.seat_number));

    const unseatedPassengers = await sql`
      SELECT passenger_id, seat_type_id FROM flight_passenger_assignments
      WHERE flight_number = ${flight_number} AND seat_number IS NULL
    `;

    if (unseatedPassengers.length === 0) {
      return res.status(200).json({ success: true, message: 'All passengers already have seats.' });
    }

    const seatTypes = await sql`SELECT seat_type_id, type_name FROM seat_type`;
    const typeMap = {}; 
    seatTypes.forEach(t => {
        if(t.type_name.toLowerCase().includes('business')) typeMap[t.seat_type_id] = 'Business';
        else if(t.type_name.toLowerCase().includes('economy')) typeMap[t.seat_type_id] = 'Economy';
    });

    let assignedCount = 0;
    for (const passenger of unseatedPassengers) {
      const passengerClassPreference = typeMap[passenger.seat_type_id];
      const seatFound = generatedSeats.find(seatObj => {
        const isOccupied = occupiedSeats.has(seatObj.seat);
        const classMatches = passengerClassPreference ? seatObj.class === passengerClassPreference : false;
        return !isOccupied && classMatches;
      });

      if (seatFound) {
        await sql`
          UPDATE flight_passenger_assignments
          SET seat_number = ${seatFound.seat}
          WHERE passenger_id = ${passenger.passenger_id} AND flight_number = ${flight_number}
        `;
        occupiedSeats.add(seatFound.seat);
        assignedCount++;
      }
    }

    res.status(200).json({ success: true, message: `Successfully assigned seats to ${assignedCount} passengers.` });

  } catch (error) {
    console.error('Error in auto assign:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// PUT: Manual Seat Assignment
export const assignSeatManually = async (req, res) => {
  const { flight_number } = req.params;
  const { passenger_id, seat_number } = req.body;

  if (!passenger_id || !seat_number) {
    return res.status(400).json({ success: false, message: 'Passenger ID and Seat Number required.' });
  }

  try {
    const seatCheck = await sql`
      SELECT passenger_id FROM flight_passenger_assignments
      WHERE flight_number = ${flight_number} AND seat_number = ${seat_number} AND passenger_id != ${passenger_id}
    `;

    if (seatCheck.length > 0) {
      return res.status(409).json({ success: false, message: `Seat ${seat_number} is already occupied.` });
    }

    const result = await sql`
      UPDATE flight_passenger_assignments
      SET seat_number = ${seat_number}
      WHERE flight_number = ${flight_number} AND passenger_id = ${passenger_id}
      RETURNING seat_number
    `;

    if (result.length === 0) {
      return res.status(404).json({ success: false, message: 'Passenger not found on flight.' });
    }

    res.status(200).json({ success: true, message: `Seat assigned successfully.` });
  } catch (error) {
    console.error('Error manual assign:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

/* ===============================================================
   3. AFFILIATED SEATING (FAMILY) CRUD
   =============================================================== */

// GET: All affiliations for a flight
export const getAffiliatedPassengers = async (req, res) => {
  const { flight_number } = req.params;
  try {
    const affiliations = await sql`
      SELECT a.id, p1.name as main_passenger, p2.name as affiliated_passenger
      FROM affiliated_seating a
      JOIN passengers p1 ON a.main_passenger_id = p1.passenger_id
      JOIN passengers p2 ON a.affiliated_passenger_id = p2.passenger_id
      WHERE a.flight_number = ${flight_number}
    `;
    res.status(200).json({ success: true, data: affiliations });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// POST: Create Affiliation (Link two passengers)
export const addAffiliation = async (req, res) => {
  const { main_passenger_id, affiliated_passenger_id, flight_number } = req.body;
  try {
    const result = await sql`
      INSERT INTO affiliated_seating (main_passenger_id, affiliated_passenger_id, flight_number)
      VALUES (${main_passenger_id}, ${affiliated_passenger_id}, ${flight_number})
      RETURNING id
    `;
    res.status(201).json({ success: true, message: 'Affiliation created', id: result[0].id });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error });
  }
};

// DELETE: Remove Affiliation
export const deleteAffiliation = async (req, res) => {
  const { id } = req.params;
  try {
    await sql`DELETE FROM affiliated_seating WHERE id = ${id}`;
    res.status(200).json({ success: true, message: 'Affiliation deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

/* ===============================================================
   4. INFANT PARENT RELATIONSHIP CRUD
   =============================================================== */

// GET: All infant relationships for a flight
export const getInfantRelationships = async (req, res) => {
  const { flight_number } = req.params;
  try {
    const relations = await sql`
      SELECT r.id, p1.name as infant, p2.name as parent
      FROM infant_parent_relationship r
      JOIN passengers p1 ON r.infant_passenger_id = p1.passenger_id
      JOIN passengers p2 ON r.parent_passenger_id = p2.passenger_id
      WHERE r.flight_number = ${flight_number}
    `;
    res.status(200).json({ success: true, data: relations });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// POST: Link Infant to Parent
export const addInfantRelationship = async (req, res) => {
  const { infant_passenger_id, parent_passenger_id, flight_number } = req.body;
  try {
    const result = await sql`
      INSERT INTO infant_parent_relationship (infant_passenger_id, parent_passenger_id, flight_number)
      VALUES (${infant_passenger_id}, ${parent_passenger_id}, ${flight_number})
      RETURNING id
    `;
    res.status(201).json({ success: true, message: 'Infant linked to parent', id: result[0].id });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// DELETE: Unlink Infant
export const deleteInfantRelationship = async (req, res) => {
  const { id } = req.params;
  try {
    await sql`DELETE FROM infant_parent_relationship WHERE id = ${id}`;
    res.status(200).json({ success: true, message: 'Relationship deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
