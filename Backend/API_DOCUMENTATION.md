# Flight Information API Documentation

## Overview

Flight Information API provides comprehensive flight management capabilities for a single airline company. The API handles flight details, airport information, vehicle types, and shared flight arrangements.

## Database Schema

### Tables Structure

#### 1. `airports`
Stores airport information:
- `id` (SERIAL PRIMARY KEY)
- `code` (VARCHAR(3) UNIQUE) - Airport code in AAA format
- `name` (VARCHAR(255)) - Airport name
- `city` (VARCHAR(100)) - City name
- `country` (VARCHAR(100)) - Country name

#### 2. `vehicle_types`
Stores aircraft type information:
- `id` (SERIAL PRIMARY KEY)
- `type_name` (VARCHAR(100) UNIQUE) - e.g., "Boeing 737-800"
- `total_seats` (INTEGER) - Total seat capacity
- `seating_plan` (JSONB) - Detailed seating arrangement
- `max_crew` (INTEGER) - Maximum crew members allowed
- `max_passengers` (INTEGER) - Maximum passenger capacity
- `menu_description` (TEXT) - Standard menu information

#### 3. `flights`
Main flight information table:
- `id` (SERIAL PRIMARY KEY)
- `flight_number` (VARCHAR(6) UNIQUE) - AANNNN format
- `flight_date` (TIMESTAMP) - Flight date/time (minute resolution)
- `duration_minutes` (INTEGER) - Flight duration
- `distance_km` (DECIMAL) - Flight distance
- `source_airport_id` (INTEGER) - Reference to airports table
- `destination_airport_id` (INTEGER) - Reference to airports table
- `vehicle_type_id` (INTEGER) - Reference to vehicle_types table
- `is_shared` (BOOLEAN) - Whether flight is shared
- `shared_flight_number` (VARCHAR(6)) - Partner airline flight number
- `shared_airline_name` (VARCHAR(255)) - Partner airline name
- `connecting_flight_info` (JSONB) - Additional connecting flight details

## API Endpoints

### Base URL
```
http://localhost:3000/api/flight
```

### 1. Get All Flights

**Endpoint:** `GET /api/flight`

**Response:**
```json
{
  "success": true,
  "count": 6,
  "data": [
    {
      "id": 1,
      "flight_number": "AA1001",
      "flight_date": "2024-12-15T08:30:00.000Z",
      "duration_minutes": 180,
      "distance_km": "1200.50",
      "is_shared": false,
      "shared_flight_number": null,
      "shared_airline_name": null,
      "connecting_flight_info": null,
      "source": {
        "country": "Turkey",
        "city": "Istanbul",
        "airport_name": "Istanbul Airport",
        "airport_code": "IST"
      },
      "destination": {
        "country": "Germany",
        "city": "Frankfurt",
        "airport_name": "Frankfurt Airport",
        "airport_code": "FRA"
      },
      "vehicle_type": {
        "id": 1,
        "type_name": "Boeing 737-800",
        "total_seats": 189,
        "seating_plan": {
          "economy": {
            "rows": 29,
            "seats_per_row": 6,
            "total": 174
          },
          "business": {
            "rows": 4,
            "seats_per_row": 6,
            "total": 15
          }
        },
        "max_crew": 8,
        "max_passengers": 189,
        "menu_description": "Standard meal service with hot meals, snacks, and beverages"
      }
    }
  ]
}
```

### 2. Get Flight by Number

**Endpoint:** `GET /api/flight/:flight_number`

**Parameters:**
- `flight_number` (path parameter) - Flight number in AANNNN format (e.g., AA1001)

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "flight_number": "AA1001",
    "flight_date": "2024-12-15T08:30:00.000Z",
    "duration_minutes": 180,
    "distance_km": "1200.50",
    ...
  }
}
```

**Error Response (404):**
```json
{
  "success": false,
  "message": "Flight with number AA9999 not found"
}
```

### 3. Create Flight

**Endpoint:** `POST /api/flight`

**Request Body:**
```json
{
  "flight_number": "AA1007",
  "flight_date": "2024-12-20T10:00:00",
  "duration_minutes": 240,
  "distance_km": 1500.75,
  "source_airport_code": "IST",
  "destination_airport_code": "AMS",
  "vehicle_type_id": 1,
  "is_shared": false
}
```

**Shared Flight Example:**
```json
{
  "flight_number": "AA1008",
  "flight_date": "2024-12-20T14:30:00",
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

**Response (201):**
```json
{
  "success": true,
  "message": "Flight created successfully",
  "data": {
    "id": 7,
    "flight_number": "AA1007",
    ...
  }
}
```

### 4. Update Flight

**Endpoint:** `PUT /api/flight/:flight_number`

**Request Body:** (All fields optional)
```json
{
  "duration_minutes": 195,
  "distance_km": 1250.50,
  "vehicle_type_id": 2
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Flight updated successfully",
  "data": {
    "id": 1,
    "flight_number": "AA1001",
    ...
  }
}
```

### 5. Delete Flight

**Endpoint:** `DELETE /api/flight/:flight_number`

**Response (200):**
```json
{
  "success": true,
  "message": "Flight deleted successfully",
  "data": {
    "id": 1,
    "flight_number": "AA1001",
    ...
  }
}
```

## Flight Number Format

Flight numbers must follow the **AANNNN** format:
- **AA**: Two alphabetical letters (airline identifier, same for all flights)
- **NNNN**: Four numeric digits

**Valid Examples:**
- `AA1234`
- `AA0001`
- `AA9999`

**Invalid Examples:**
- `A1234` (only one letter)
- `AA123` (only three digits)
- `123456` (no letters)

## Vehicle Types

The system supports multiple vehicle types. Default seed data includes:

1. **Boeing 737-800**
   - Total Seats: 189
   - Max Crew: 8
   - Max Passengers: 189

2. **Airbus A320**
   - Total Seats: 180
   - Max Crew: 6
   - Max Passengers: 180

3. **Boeing 787 Dreamliner**
   - Total Seats: 242
   - Max Crew: 12
   - Max Passengers: 242

## Shared Flights

Shared flights (code-share flights) include:
- Partner airline's flight number
- Partner airline name
- Optional connecting flight information (JSON)

When `is_shared` is `true`, the following fields are required:
- `shared_flight_number`
- `shared_airline_name`

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Invalid flight number format. Must be in AANNNN format (e.g., AA1234)"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Flight with number AA9999 not found"
}
```

### 409 Conflict
```json
{
  "success": false,
  "message": "Flight number AA1001 already exists"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal Server Error",
  "error": "Error message details"
}
```

## Setup Instructions

1. Install dependencies:
   ```bash
   cd Backend
   npm install
   ```

2. Configure environment variables in `.env`:
   ```env
   PORT=3000
   PGUSER=your_neon_username
   PGPASSWORD=your_neon_password
   PGHOST=your_host.aws.neon.tech
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

## Testing

### Using cURL

**Get all flights:**
```bash
curl http://localhost:3000/api/flight
```

**Get specific flight:**
```bash
curl http://localhost:3000/api/flight/AA1001
```

**Create flight:**
```bash
curl -X POST http://localhost:3000/api/flight \
  -H "Content-Type: application/json" \
  -d '{
    "flight_number": "AA1007",
    "flight_date": "2024-12-20T10:00:00",
    "duration_minutes": 240,
    "distance_km": 1500.75,
    "source_airport_code": "IST",
    "destination_airport_code": "AMS",
    "vehicle_type_id": 1,
    "is_shared": false
  }'
```

**Update flight:**
```bash
curl -X PUT http://localhost:3000/api/flight/AA1001 \
  -H "Content-Type: application/json" \
  -d '{"duration_minutes": 195}'
```

**Delete flight:**
```bash
curl -X DELETE http://localhost:3000/api/flight/AA1001
```

