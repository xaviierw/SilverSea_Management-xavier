SilverSea Management System

A condominium facility booking and management system built with Node.js, Express, and a clean MVC-like architecture. SilverSea allows Residents to book facilities and Admins to manage facility information, using a secure login system and a reusable timeslot template engine.

SilverSea is a web-based solution designed to streamline condo facility usage.
It features:

- Resident login & booking

- Admin facility management

- Reusable timeslot templates

- JWT-secured routes

- Clean separation of public/js, utils, models, and index.js

SilverSea uses JWT tokens stored in HttpOnly cookies with:

- authRequired() middleware to protect backend routes

- Role-based access (resident, admin)

- protectHtml() to block direct HTML navigation if not logged in

- No client-side storage of sensitive data

Running the Project

- npm install

- npm install bcryptjs cookie-parser dotenv jsonwebtoken
- Create .env file (e.g. PORT=5050 | APP_SECRET = your_jwt_password_here)

- node index.js
