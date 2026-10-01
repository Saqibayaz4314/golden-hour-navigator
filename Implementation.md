# Implementation Plan: The Golden Hour Navigator
This document outlines the step-by-step implementation phases for building the unified web platform using the MERN stack (MongoDB Atlas, Express.js, React.js, Node.js). 

## Phase 1: Project Initialization & Setup
**Goal:** Scaffold the frontend and backend environments and establish the database connection.
1. **Root Setup:** Initialize a Git repository and a `package.json` for managing concurrent scripts (e.g., using `concurrently`).
2. **Backend Setup:**
   - Initialize a Node.js project in a `/backend` directory.
   - Install dependencies: `express`, `mongoose`, `cors`, `dotenv`.
   - Setup basic Express server in `server.js`.
   - Establish the MongoDB Atlas connection using the provided connection string.
3. **Frontend Setup:**
   - Initialize a React project in a `/frontend` directory using Vite or Create React App.
   - Install dependencies: `axios`, `react-router-dom`.
   - Clear boilerplate code and set up basic folder structure (`/components`, `/pages`, `/context`).

## Phase 2: Database Schemas & Models (Mongoose)
**Goal:** Define the data structure for Hospitals, Doctors, and Search Logs.
1. **Hospital Model:**
   - Create schema with fields: name, resources (beds, medicines array).
   - Implement **GeoJSON** Point schema for the `location` field.
   - Add a `2dsphere` index to the `location` field to enable `$geoNear` spatial queries.
2. **Doctor Model:**
   - Create schema with fields: name, specialty, and an array of `hospital_affiliations` containing schedules.
3. **Incident/Search Model:**
   - Create schema to log searches (driver ID, condition searched, matched hospital, timestamp) for analytics.

## Phase 3: Backend API Development
**Goal:** Build the RESTful API endpoints for the frontend to consume.
1. **Hospital Routes:**
   - `GET /api/hospitals/search`: Implement geospatial query logic (`$geoNear`) combined with filtering (matching patient condition with required medicines/beds).
   - `PUT /api/hospitals/:id/resources`: Endpoint for hospitals to update bed counts and medicines.
2. **Doctor Routes:**
   - `GET /api/doctors`: Fetch doctor availability across hospitals.
   - `PUT /api/doctors/:id/schedule`: Update doctor presence.
3. **Error Handling & Middleware:**
   - Add basic error handling middleware and validation.

## Phase 4: Frontend Development - Core UI & State
**Goal:** Build the visual interfaces for the Driver and the Hospital Admin.
1. **Routing Setup:** Configure `react-router-dom` with routes: `/` (Driver Dashboard), `/hospital/dashboard` (Admin View).
2. **Driver View (Mobile First):**
   - **Emergency Search UI:** Large, fat-finger-friendly buttons or a simple dropdown to select the patient's condition (e.g., Trauma, Cardiac).
   - **Browser Geolocation API:** Request the driver's current latitude and longitude.
   - **Results UI:** Display the nearest matched hospitals with distance, ETA, and confirmed resources.
3. **Hospital Admin View (Desktop/Tablet):**
   - **Resource Dashboard:** A dashboard with toggles and counters to quickly update bed availability and doctor presence.

## Phase 5: Integration & Logic
**Goal:** Connect the React frontend to the Express backend.
1. **API Integration:** Use `axios` to wire up the Driver Search UI to the `GET /api/hospitals/search` endpoint, passing in the driver's GPS coordinates.
2. **State Management:** Wire up the Hospital Admin dashboard to send `PUT` requests, updating the database in real-time.
3. **Map Integration (Optional but recommended):** Add a lightweight map component (e.g., `react-leaflet`) to visually show the driver where the hospital is.

## Phase 6: PWA Conversion & Rural Optimization
**Goal:** Ensure the app works in low-bandwidth rural areas and handles poor connectivity.
1. **PWA Configuration:** 
   - Add a `manifest.json` so the web app can be installed on home screens.
   - Configure a Service Worker (using Workbox or vanilla JS) to cache the React app shell (HTML, CSS, JS).
2. **Offline Data Handling:**
   - Cache recent search results or the list of nearby hospitals in the browser's `localStorage` or `IndexedDB`. If the internet drops completely, show the cached list with a "You are offline" warning flag.
