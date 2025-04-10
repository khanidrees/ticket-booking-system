# Movie Ticket Booking Backend

This project is a backend system for a movie ticket booking application built using Node.js, Express, and MongoDB. It provides APIs for managing movies, showtimes, users, bookings, and payment processing via Stripe.

## Table of Contents

1.  [Features](#features)
2.  [Prerequisites](#prerequisites)
3.  [Local Setup](#local-setup)
    *   [Step 1: Clone the Repository](#step-1-clone-the-repository)
    *   [Step 2: Install Dependencies](#step-2-install-dependencies)
    *   [Step 3: Configure Environment Variables](#step-3-configure-environment-variables)
    *   [Step 4: Set up Stripe Webhooks](#step-4-set-up-stripe-webhooks)
    *   [Step 5: Run the Application](#step-5-run-the-application)
4.  [Basic Operations](#basic-operations)
    *   [Adding Movies (Admin)](#adding-movies-admin)
    *   [Booking Tickets](#booking-tickets)
    *   [Cancelling Bookings](#cancelling-bookings)
5.  [API Endpoints](#api-endpoints)
6.  [Postman Collection](#postman-collection)
7.  [Testing](#testing)
8.  [Security](#security)
9.  [Deployment](#deployment)
10. [Contributing](#contributing)
11. [License](#license)

## Features

*   **Movie Management:** Add movie details (title, description, duration, showtimes).
*   **User Management:** User registration, login.
*   **Ticket Booking:** Book tickets for specific movies and showtimes.
*   **Booking Management:** View and cancel bookings.
*   **Payment Integration:** Secure payment processing using Stripe.
*   **Showtime Validation:** Ensures a minimum break time between showtimes.
*   **Automatic Payment Intent Cancellation:** Cancels unpaid Payment Intents after a set time(10 minutes).
*   **Authentication and Authorization:** Secure API endpoints with JWT and role-based access control.

## Prerequisites

*   [Node.js](https://nodejs.org/) (v16 or higher)
*   [MongoDB](https://www.mongodb.com/) (running locally or a cloud instance)
*   [Stripe Account](https://stripe.com/) (for payment processing and webhooks)
*   [Postman](https://www.postman.com/) (optional, for testing API endpoints)

## Local Setup

Follow these steps to set up the application locally:

### Step 1: Clone the Repository

```bash
git clone https://github.com/khanidrees/ticket-booking-system.git
cd ticket-booking-system
```
### Step 2: Install Dependencies


```bash
npm install
```
### Step 3: Configure Environment Variables
Create a .env file in the root directory of the project and add the following environment variables:

```ini
DB_CONNECT=mongodb://localhost:27017/movie-booking
JWT_PRIVATE_KEY=your-secret-jwt-key
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_stripe_webhook_secret
PORT=433
```

Explanation:

MONGODB_URI: The connection string for your MongoDB database.
JWT_SECRET: A secret key used to sign JSON Web Tokens (JWTs). Important: Use a strong, randomly generated key in production.
STRIPE_SECRET_KEY: Your Stripe secret key. You can find this in your Stripe dashboard.
STRIPE_WEBHOOK_SECRET: Your Stripe webhook signing secret. You'll need to configure this in your Stripe dashboard when setting up webhooks (see next step).
PORT: The port on which the server will run (defaults to 433).
Step 4: Set up Stripe Webhooks
Stripe webhooks are essential for handling asynchronous payment events (e.g., payment success, payment failure, refunds).

Expose your local server: Use a tool like ngrok to expose your local server to the internet. This will give you a public URL that Stripe can use to send webhooks.
```bash
ngrok http 433  # Assuming your app is running on port 433
```
Ngrok will provide a forwarding URL (e.g., https://your-ngrok-url.ngrok.io).
Configure Webhooks in Stripe Dashboard:
Go to your Stripe Dashboard.
Click "Add endpoint".
Enter the ngrok URL followed by /webhook as the endpoint URL (e.g., https://your-ngrok-url.ngrok.io/webhook).
Select the following events to listen to:
payment_intent.succeeded
payment_intent.payment_failed
charge.refunded
Click "Add endpoint".
Retrieve the Signing Secret: After creating the webhook endpoint, Stripe will generate a signing secret. Copy this secret and set it as the STRIPE_WEBHOOK_SECRET environment variable in your .env file. The signing secret is used to verify that webhooks are actually sent by Stripe.
Step 5: Run the Application

```bash
npm start
```
The server will start running on the specified port (default: 433).

### Basic Operations
### Adding Movies (Admin)
Register an Admin User: First, you'll need to register a user and manually append 'admin' roles field in the MongoDB database. (This project assumes a simple role-based access control; a more sophisticated system might involve separate admin registration.)
Obtain a JWT: Log in as the admin user to obtain a JWT (JSON Web Token).
Use the POST /movies endpoint: Send a POST request to the /movies endpoint with the following JSON data in the request body. Important: Include the JWT in the authorization header as a Bearer token (e.g., authorization: <your_jwt>).
```json
{
    "title": "New Movie Title",
    "description": "A great movie",
    "duration": 120,
    "poster_url": "http://example.com/poster.jpg",
    "showtimes": [
        "2025-04-12T10:00:00.000Z",
        "2025-04-12T13:00:00.000Z",
        "2025-04-12T16:00:00.000Z"
    ],
    "total_seats": 50,
    "price": 12.50
}
```
### Booking Tickets
Register a User: Register a regular user account.
Obtain a JWT: Log in as the user to obtain a JWT.
Use the POST /book endpoint: Send a POST request to the /book endpoint with the following JSON data in the request body. Include the JWT in the Authorization header.

```json
{
    "showtimeId": "<showtime_id>",
    "numberOfTickets": 2
}
```
Replace <showtime_id> with the actual ID of the showtime you want to book. The response will include a paymentIntentClientSecret, which you'll need to use on the client-side to complete the payment with Stripe.
### Cancelling Bookings
Obtain a JWT: Log in as the user who made the booking to obtain a JWT.
Use the DELETE /bookings/:id endpoint: Send a DELETE request to the /bookings/:id endpoint, replacing :id with the ID of the booking you want to cancel. Include the JWT in the Authorization header. Cancellation is subject to the cancellation policy (e.g., may not be allowed within 24 hours of the showtime).
### API Endpoints
Here's a list of all the API endpoints:

Movies:

GET /movies: Retrieve a list of movies (with pagination).
POST /movies: Create a new movie (Admin only).

Users:

POST /users/register: Register a new user.
POST /users/login: Login user and return JWT.

Bookings:

POST /bookings: Book tickets for a specific showtime (requires authentication).
GET /bookings: Get user booking history (requires authentication).
DELETE /bookings/:id: Cancel a booking (requires authentication).

### Authentication:

All endpoints marked with "(requires authentication)" require a valid JWT in the Authorization header (e.g., Authorization: Bearer <your_jwt>).
Endpoints marked with "(Admin only)" require the user to have admin privileges 
### Postman Collection
A Postman collection containing all the API endpoints is available here:

Postman Collection Link

https://www.postman.com/avionics-geoscientist-81087338/public/collection/5b6bupg/ticket-booking-system?action=share&creator=18393135&active-environment=18393135-2bb291c9-96e5-4e39-b8a9-924570800e23


### Contributing
Contributions are welcome! Please follow these steps:

Fork the repository.
Create a new branch for your feature or bug fix.
Make your changes and commit them with clear, concise messages.
Submit a pull request.