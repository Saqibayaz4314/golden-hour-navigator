# Technical Requirements Document (TRD)
## The Golden Hour: Emergency Referral Failure Navigator

### 1. System Architecture
The system is built as a unified web platform (Progressive Web App - PWA) designed to interlink hospitals and provide transparent, real-time data to drivers. 

- **Frontend (Web Application)**: React.js (MERN stack). Built to be fully responsive, ensuring it works perfectly on mobile devices (for ambulance drivers) and desktops/tablets (for hospital administrators).
- **Backend (API Server)**: Node.js with Express.js (MERN stack). Handles business logic, user authentication, and data processing.
- **Database**: MongoDB Atlas (Cloud NoSQL Database). Chosen for its flexible schema (to handle diverse hospital resources and medicines) and built-in GeoJSON support for location-based searching (finding the nearest suitable hospital).
- **Hosting / Deployment**: Vercel or Netlify for the React frontend, and Render, Heroku, or AWS for the Node.js backend.

### 2. Core Modules
#### 2.1. Unified Search & Routing Engine
The core of the application where a driver inputs the patient's condition.
- **Geospatial Queries**: Utilizes MongoDB's `$geoNear` to calculate the distance between the driver's current location and interlinked hospitals.
- **Resource Filtering**: Queries the database to filter out hospitals that do not currently have the required doctor availability, beds, or specific medicines.

#### 2.2. Hospital Data Management
- Provides an interface for hospitals to continuously update their resources (Beds, Medicines, Doctor Availability).
- Doctors' schedules across multiple hospitals are tracked to prevent overlapping availability and ensure transparency in the system.

#### 2.3. Rural Area Resilience (Risk Mitigation)
To address the risk of device and internet issues in rural areas:
- **PWA Caching**: The React frontend utilizes Service Workers to cache critical assets and the last known state of nearby hospitals, so the app still loads quickly on weak connections.
- **Low-Bandwidth Mode**: The UI will optimize payload sizes, stripping heavy images and only sending essential JSON text data over the network.

### 3. Data Models (MongoDB Collections)
**Hospitals Collection**
- `_id` (ObjectId)
- `name` (String)
- `location` (GeoJSON Point: `[longitude, latitude]`)
- `resources`:
  - `beds_available` (Number)
  - `critical_medicines` (Array of Strings)
- `last_updated` (Date)

**Doctors Collection**
- `_id` (ObjectId)
- `name` (String)
- `specialty` (String)
- `hospital_affiliations` (Array of Objects containing `hospital_id` and `schedule`)

**Incidents / Search Logs Collection**
- `_id` (ObjectId)
- `driver_id` (ObjectId)
- `patient_condition` (String)
- `matched_hospital_id` (ObjectId)
- `timestamp` (Date)

### 4. API Endpoints (Express.js)
- `GET /api/hospitals/search` -> Query params: `lat`, `lng`, `condition`. Returns matched hospitals using MongoDB geospatial indexing.
- `PUT /api/hospitals/:id/resources` -> Updates bed/medicine counts.
- `POST /api/doctors/schedule` -> Manages doctor availability to prevent multi-hospital manipulation.

### 5. Security & Privacy
- **Authentication**: JWT (JSON Web Tokens) for securing endpoints.
- **Database Security**: MongoDB Atlas network isolation and IP whitelisting.
