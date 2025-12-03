# Pilot Information API

Microservice (D3) for the Flight Roster System - Pilot Information API using PERN stack (PostgreSQL, Express, Node.js, Sequelize).

## Setup

1. Install dependencies:
```bash
npm install
```

2. The `.env` file is already configured with the NeonDB connection string.

3. Seed the database:
```bash
npm run seed
```

## Running the Server

Development mode (with nodemon):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server will run on port 3000 by default (or the port specified in the PORT environment variable).

## API Endpoints

### GET /api/pilots
List all pilots.

**Response:**
```json
{
  "success": true,
  "count": 10,
  "data": [...]
}
```

### GET /api/pilots/filter
Filter pilots by `vehicle_restriction` and/or `seniority_level`.

**Query Parameters:**
- `vehicle_restriction` (optional): e.g., 'Boeing 737', 'Airbus A320'
- `seniority_level` (optional): 'Senior', 'Junior', or 'Trainee'

**Example:**
```
GET /api/pilots/filter?vehicle_restriction=Boeing 737&seniority_level=Senior
```

**Response:**
```json
{
  "success": true,
  "count": 2,
  "filters": {
    "vehicle_restriction": "Boeing 737",
    "seniority_level": "Senior"
  },
  "data": [...]
}
```

### POST /api/pilots
Create a new pilot.

**Request Body:**
```json
{
  "name": "John Doe",
  "age": 35,
  "gender": "Male",
  "nationality": "American",
  "vehicle_restriction": "Boeing 737",
  "allowed_range": 4500,
  "seniority_level": "Junior"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Pilot created successfully",
  "data": {...}
}
```

## Pilot Model

- `id`: Primary Key (Integer, Auto-increment)
- `name`: String
- `age`: Integer
- `gender`: String
- `nationality`: String
- `vehicle_restriction`: String (e.g., 'Boeing 737', 'Airbus A320')
- `allowed_range`: Integer (Max flight range in km)
- `seniority_level`: ENUM ('Senior', 'Junior', 'Trainee')




