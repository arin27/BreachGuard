# BreachGuard

BreachGuard AI System is a cybersecurity-focused web application that allows users to register, authenticate securely, and check whether an email address appears in known breach records. The platform is built using Node.js, Express.js, MongoDB Atlas, and JWT authentication.

> This project is a prototype created for educational and portfolio purposes and currently uses a simulated breach dataset.
---

## Features

- User Registration and Login
- JWT-based Authentication
- Password Hashing with bcrypt
- MongoDB Atlas Integration
- Breach Search Functionality
- Simulated Breach Database
- Cloud Deployment using Render
---

## Tech Stack

### Backend
- Node.js
- Express.js

### Database
- MongoDB Atlas
- Mongoose

### Authentication
- JWT (JSON Web Tokens)
- bcryptjs

### Deployment
- Render

### Frontend
- HTML
- CSS
- JavaScript

## Installation

Clone the repository:

```
git clone https://github.com/arin27/Breach_AI_System.git
cd Breach_AI_System
```

Install dependencies:

```bash
npm install
```

Create a `.env` file:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

Run the application:

```bash
node server.js
```
---

## How It Works

1. Users create an account and log in securely.
2. Passwords are hashed before being stored.
3. JWT tokens are used for authentication.
4. Users can search email addresses for breach records.
5. The application checks the query against a stored breach dataset.
6. Matching breach information is displayed.
---

## Current Limitations

### Simulated Breach Data

This project currently relies on a local breach dataset and does not connect to:

- Real-world breach intelligence feeds
- Have I Been Pwned API
- Dark web monitoring services
- Commercial threat intelligence platforms
---

### AI Assistant

 he AI Assistant feature is currently incomplete and non-functional.

Although an AI-based assistant was planned as part of the project, it has not been fully implemented and should be considered a placeholder feature.
--- 

## Future Improvements

- Real breach intelligence integration
- Functional AI security assistant
- Password security analysis
- Email breach notifications
- Security dashboard enhancements
- Admin panel
- Threat intelligence integration
---
# Live Demo

https://breachguard-22s9.onrender.com
---

## Disclaimer

This project was developed for educational and portfolio purposes. Breach data used within the application is simulated and should not be considered real-world breach intelligence.
