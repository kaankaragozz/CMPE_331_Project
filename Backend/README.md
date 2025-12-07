# Flight Information API

A RESTful API for managing flight information, including flight details, airports, vehicle types, and shared flight information.

## Features

- **Flight Management**: Full CRUD operations for flights
- **Flight Number Format**: AANNNN format (e.g., AA1234) where first 2 letters represent the airline
- **Flight Information**: Date (minute resolution), duration, and distance
- **Source/Destination**: Country, city, airport name, and 3-letter airport code
- **Vehicle Types**: Multiple aircraft types with seating plans, crew/passenger limits, and menu information
- **Shared Flights**: Support for code-share flights with connecting flight information

## Database Schema

### Tables

1. **flights**: Main flight information table
2. **airports**: Airport information (code, name, city, country)
3. **vehicle_types**: Aircraft types with seating plans and capacity

## API Endpoints

### Flights

- `GET /api/flight` - Get all flights
- `GET /api/flight/:flight_number` - Get flight by flight number
- `POST /api/flight` - Create new flight
- `PUT /api/flight/:flight_number` - Update flight
- `DELETE /api/flight/:flight_number` - Delete flight

### Health Check

- `GET /health` - Check API status

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file in Backend directory:
```env
PORT=3000
PGUSER=your_neon_username
PGPASSWORD=your_neon_password
PGHOST=your_host_here.aws.neon.tech
PGDATABASE=neondb
```

3. Initialize database and seed data:
```bash
npm run seed
```

4. Start the server:
```bash
npm run dev
```

## Flight Number Format

Flight numbers must follow the format: **AANNNN**
- **A**: Two alphabetical letters (airline identifier)
- **N**: Four numeric digits

Example: `AA1234`

## Request/Response Examples

### Get All Flights
```bash
GET /api/flight
```

### Get Flight by Number
```bash
GET /api/flight/AA1001
```

### Create Flight
```bash
POST /api/flight
Content-Type: application/json

{
  "flight_number": "AA1001",
  "flight_date": "2024-12-15T08:30:00",
  "duration_minutes": 180,
  "distance_km": 1200.5,
  "source_airport_code": "IST",
  "destination_airport_code": "FRA",
  "vehicle_type_id": 1,
  "is_shared": false
}
```

### Create Shared Flight
```bash
POST /api/flight
Content-Type: application/json

{
  "flight_number": "AA1004",
  "flight_date": "2024-12-16T16:20:00",
  "duration_minutes": 165,
  "distance_km": 980.3,
  "source_airport_code": "FRA",
  "destination_airport_code": "CDG",
  "vehicle_type_id": 2,
  "is_shared": true,
  "shared_flight_number": "BA2345",
  "shared_airline_name": "British Airways",
  "connecting_flight_info": {
    "connecting_flight_number": "BA2346",
    "connecting_airline": "British Airways",
    "connection_airport": "LHR",
    "layover_minutes": 90
  }
}
```

## Vehicle Types

The system includes at least 3 different vehicle types:
- Boeing 737-800
- Airbus A320
- Boeing 787 Dreamliner

Each vehicle type includes:
- Total seats
- Seating plan (JSON)
- Maximum crew
- Maximum passengers
- Menu description

