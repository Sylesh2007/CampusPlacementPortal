# Campus Placement Management Portal
> **MERN Stack Mini Project**  
> *Inspired by SIH 2025 – Career & Employability Platform*

A modern, full-stack recruitment portal built to streamline on-campus placements, eliminate manual spreadsheets/Google Forms, and provide role-based management for Students, Companies, and Campus Placement Cell Administrators.

---

## 🌟 Key Features & User Roles

### 1. 🎓 Student Role
* **Registration & Secure Login**: Fast registration with automatic student ID generation (`STU...`) and hashed passwords.
* **Placement Drives Directory**: Explore active recruitment drives with real-time search by job role, company name, or venue.
* **Online Job Application**: Apply directly for eligible drives with duplicate-application prevention and deadline enforcement.
* **My Applications Tracker**: Real-time status tracking (`Applied`, `Verified`, `Under Review`, `Shortlisted`, `Selected`, `Rejected`).
* **Selection Status**: Immediate visual feedback, status badges, and celebratory offer banner upon selection.

### 2. 🏢 Company Role
* **Secure Login**: Access company recruitment console.
* **Drive Management**: Create and schedule placement drives specifying job roles, date, venue, last date to apply, and vacancies.
* **Application Review & Eligibility**: Review eligible student applicants against company-specified criteria.
* **Selection Result Updates**: Instantly update candidate statuses (`Shortlisted`, `Selected`, `Rejected`) and toggle confirmed offers.

### 3. 🛡️ Admin Role (Placement Cell)
* **Company Management**: Add visiting partner companies with CTC packages and eligibility requirements.
* **Placement Drive Oversight**: Create, monitor, edit, and delete placement drives across the campus.
* **Application Verification & Publishing**: Verify student applications and publish final recruitment offers.
* **Placement Reports (MongoDB `aggregate()`)**: Comprehensive dashboard analytics featuring status breakdown distributions, drive performance stats, and placement percentages.

---

## 🛠️ Technology Stack (Strictly adhering to PDF Specification)

* **Frontend**: ReactJS (Vite, Tailwind CSS, Lucide React, React Router DOM)
* **Backend**: NodeJS & ExpressJS (RESTful API, JWT Authentication, bcryptjs password hashing)
* **Database**: MongoDB Atlas Cloud (`Users`, `Companies`, `PlacementDrives`, `Applications`)
* **API Testing**: Postman Collection Included (`CampusPlacementPortal.postman_collection.json`)

---

## 📁 Database Schema (MongoDB Atlas)

### Collection 1: `Users`
* `userId`: String (Unique)
* `name`: String
* `email`: String (Unique)
* `password`: String (Hashed with bcryptjs)
* `role`: String (`student` | `company` | `admin`)

### Collection 2: `Companies`
* `companyId`: String (Unique)
* `companyName`: String
* `location`: String
* `website`: String
* `HRName`: String
* `packageOffered`: String
* `eligibilityCriteria`: String

### Collection 3: `PlacementDrives`
* `driveId`: String (Unique)
* `companyId`: String (Ref: Companies)
* `jobRole`: String
* `driveDate`: Date
* `venue`: String
* `lastDateToApply`: Date
* `vacancies`: Number

### Collection 4: `Applications`
* `applicationId`: String (Unique)
* `studentId`: String (Ref: Users)
* `driveId`: String (Ref: PlacementDrives)
* `applicationDate`: Date
* `status`: String (`Applied`, `Verified`, `Under Review`, `Shortlisted`, `Selected`, `Rejected`)
* `selected`: Boolean

---

## 🚀 REST API Endpoints

### Authentication
* `POST /register` — Register a student or company
* `POST /login` — Login and receive JWT bearer token
* `GET /me` — Verify authenticated profile

### Companies
* `GET /companies` — Retrieve all companies (public/authenticated)
* `POST /companies` — Add new company (Admin / Company)
* `PUT /companies/:id` — Update company details (Admin / Company)
* `DELETE /companies/:id` — Delete company (Admin)

### Placement Drives
* `GET /drives` — Retrieve placement drives with optional search query
* `POST /drives` — Create new placement drive (Company / Admin)
* `PUT /drives/:id` — Update placement drive details (Company / Admin)
* `DELETE /drives/:id` — Delete placement drive (Company / Admin)

### Applications & Reports
* `POST /apply` — Submit job application (Student)
* `GET /applications` — Fetch applications (scoped by role)
* `PUT /applications/:id` — Update application status & selection (Company / Admin)
* `DELETE /applications/:id` — Delete application (Admin)
* `GET /reports/placement-stats` — Generate placement reports using MongoDB `aggregate()` (Admin)

---

## 🔑 Pre-seeded Test Accounts

| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@campus.edu` | `adminpassword123` |
| **Student** | `alex@campus.edu` | `studentpassword123` |
| **Company** | `hr@google.com` | `companypassword123` |

*(Note: The Login page includes quick-fill buttons for one-click testing of each account)*

---

## 💻 Running the Application

### 1. Backend Server
```bash
cd backend
npm install
npm run seed     # Seeds initial users, companies, drives, and applications
npm start        # Starts Express server on http://localhost:5000
```

### 2. Frontend Client
```bash
cd frontend
npm install
npm run dev      # Starts Vite dev server on http://localhost:3000
```

### 3. Automated API Integration Tests
```bash
cd backend
node test_api_suite.js   # Executes end-to-end tests across all REST endpoints
```

---

## 📬 Postman Collection
Import the file `CampusPlacementPortal.postman_collection.json` located in the project root directly into Postman to test all endpoints with pre-configured requests, environment variables, and auto-token retention.
