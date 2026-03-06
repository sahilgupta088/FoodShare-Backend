# 🍽️ FoodShare — Backend API

A RESTful backend API for **FoodShare**, a platform that connects food donors with receivers to reduce food waste. Built with **Node.js**, **Express**, and **MongoDB**.

---

## ✨ Features

- **Role-Based Authentication** — Separate flows for **donors** and **receivers** with JWT-based auth.
- **Donation Management** — Donors can create food donations with category, quantity, expiry, and geolocation.
- **Claim System** — Receivers can browse available donations and claim them (with atomic updates to handle race conditions).
- **GeoJSON Support** — Donations store location data as GeoJSON `Point` with a `2dsphere` index for geospatial queries.
- **Dashboard Endpoints** — Donors can view their posted donations; receivers can view their claimed items.
- **Secure Passwords** — Passwords are hashed with **bcrypt** before storage.
- **CORS Configured** — Pre-configured for the deployed frontend on Vercel and local development.

---

## 🛠️ Tech Stack

| Layer          | Technology          |
| -------------- | ------------------- |
| Runtime        | Node.js             |
| Framework      | Express 5           |
| Database       | MongoDB (Mongoose 8)|
| Authentication | JWT + bcryptjs      |
| Dev Server     | Nodemon             |
| Environment    | dotenv              |

---

## 📁 Project Structure

```
FoodShare-Backend/
├── config/
│   └── db.js                  # MongoDB connection
├── controllers/
│   ├── UserController.js      # Register & Login logic
│   └── donationController.js  # Donation CRUD & claim logic
├── middleware/
│   └── authMiddleware.js      # JWT protect & role authorize
├── models/
│   ├── User.js                # User schema (name, email, password, role)
│   └── Donation.js            # Donation schema (food, location, status)
├── routes/
│   ├── userRoutes.js          # /api/users routes
│   └── donationRoutes.js      # /api/donations routes
├── .gitignore
├── index.js                   # App entry point
├── package.json
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [MongoDB](https://www.mongodb.com/) (Atlas or local instance)

### Installation

```bash
# Clone the repository
git clone https://github.com/sahilgupta088/FoodShare-Backend.git
cd FoodShare-Backend

# Install dependencies
npm install
```

### Environment Variables

Create a `.env` file in the root directory:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
```

### Run the Server

```bash
# Development (with hot-reload)
npm start

# The API will be available at http://localhost:5000
```

---

## 📡 API Endpoints

### Authentication — `/api/users`

| Method | Endpoint    | Access | Description                        |
| ------ | ----------- | ------ | ---------------------------------- |
| POST   | `/register` | Public | Register a new user (donor/receiver) |
| POST   | `/login`    | Public | Login and receive a JWT token      |

**Register** — `POST /api/users/register`

> Both endpoints return `{ token, name, role }`.

---

### Donations — `/api/donations`

| Method | Endpoint          | Access            | Description                        |
| ------ | ----------------- | ----------------- | ---------------------------------- |
| GET    | `/`               | Public            | Get all available donations        |
| POST   | `/`               | Private (Donor)   | Create a new donation              |
| PUT    | `/:id/claim`      | Private (Receiver)| Claim an available donation        |
| GET    | `/mydonations`    | Private (Donor)   | Get all donations by logged-in donor |
| GET    | `/myclaims`       | Private (Receiver)| Get all claims by logged-in receiver |

**Create Donation** — `POST /api/donations`

```json
{
  "category": "Cooked Meal",
  "foodType": "Rajma Chawal",
  "quantity": "5 servings",
  "bestBefore": "2026-03-07T18:00:00.000Z",
  "location": {
    "type": "Point",
    "coordinates": [77.2090, 28.6139],
    "address": "Connaught Place, New Delhi"
  },
  "image": "https://example.com/food-image.jpg"
}
```

> **Requires** `Authorization: Bearer <token>` header for private routes.

---


## 🔐 Authentication & Authorization

- **JWT tokens** are issued on register/login and expire in **5 days**.
- Protected routes require the `Authorization: Bearer <token>` header.
- The `protect` middleware verifies the token and attaches the user to the request.
- The `authorize` middleware restricts routes by role (`donor` / `receiver`).

---
