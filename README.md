# Tap Manufacturer Query Application – Backend (Admin Routes)

## Overview
This backend service was part of a **Capstone group project** for a plastic tap manufacturing company.  
The goal was to replace a manual email system with an automated query management system consisting of:
- Android app (customer interface)
- React admin portal (management interface)
- **Node.js + Express + Redis backend (API layer)** ← *my contribution*

---

## My Role
I served as the **Admin Routes Developer & Integration Coordinator**.  
I implemented:
- Secure **admin authentication** (register/login with JWT + bcrypt)  
- **CRUD API endpoints** for tap product management  
- **Role-based access control** (Admin vs SuperAdmin)  
- **Rate limiting** and input validation for security  
- **Firebase integration** for product image storage  
- **System statistics endpoint** for reporting  

I also coordinated with 5 teammates, defining function signatures and integration points for Redis, JWT middleware, Firebase, and rate limiting.  
Some frontend files (React routing, API integration) were a **two‑person effort** where I contributed alongside a teammate.

---

## Tech Stack
- **Node.js + Express.js** – backend framework  
- **Redis** – NoSQL database for users and taps  
- **JWT** – authentication and route protection  
- **Firebase** – image storage  
- **bcryptjs** – password hashing  
- **helmet, express-rate-limit** – security middleware  
- **React + TypeScript** – admin portal frontend (team effort)

---

## Endpoints I Implemented

### Authentication
- `POST /api/admin/register` – Register new admin (default role: user)  
- `POST /api/admin/login` – Login, returns JWT token  

### User Management (SuperAdmin only)
- `GET /api/admin/users` – View all users  
- `PUT /api/admin/update-role` – Update user role  
- `DELETE /api/admin/delete-user/:email` – Delete user  

### Tap Management (Admin + SuperAdmin)
- `GET /api/admin/taps` – View all taps  
- `GET /api/admin/taps/:id` – View single tap  
- `POST /api/admin/taps` – Create new tap (with image upload)  
- `PUT /api/admin/taps/:id` – Update tap (with optional image replacement)  
- `DELETE /api/admin/taps/:id` – Delete tap and associated image  

### System
- `GET /api/admin/stats` – Retrieve system statistics (taps by category, total users)  
- `PUT /api/admin/change-password` – Change password for logged-in user  

---

## Security Features
- JWT authentication on all admin routes  
- Role-based access control (Admin vs SuperAdmin)  
- Rate limiting on critical endpoints  
- Password hashing with bcrypt  
- Input validation and error handling  

---

## Example Usage
```bash
# Register new admin
curl -X POST http://localhost:5000/api/admin/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"securePass123"}'

# Login
curl -X POST http://localhost:5000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"securePass123"}'
```
---

## Notes on Development

- Much of the code was generated with AI assistance, but I guided the design, specified requirements, and tested iteratively.
- I supervised integration with teammates, ensuring consistent response formats and error handling.
- I documented flows, testing strategies, and integration points for Redis, Firebase, and middleware.
- Frontend routing and API integration were partly my work, in collaboration with another teammate.

---

## Key Achievements

- Implemented 8 RESTful API endpoints
- Integrated 4 middleware components (Auth, Role, Rate Limit, Upload)
- Coordinated with 5 teammates as integration hub
- Established standardized response formats and error handling
- Documented technical specifications and testing strategy

---

## Setup

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Environment variables required:
ACCESS_TOKEN_SECRET=your_jwt_secret
REDIS_URL=redis://localhost:6379
FIREBASE_STORAGE_BUCKET=your_bucket
SUPER_ADMIN_EMAIL=your_email
SUPER_ADMIN_PASSWORD=your_password


## Status
Backend implementation complete.
Frontend integration (React + Android app) was handled by teammates, with some files co‑developed.
This repo highlights my backend contributions and partial frontend work.
