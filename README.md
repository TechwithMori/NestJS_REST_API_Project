# REST API Project

This project is a NestJS-based REST API that communicates with the `https://reqres.in/` service, storing and managing user data and avatars locally using MongoDB. It also emits RabbitMQ events for certain actions.

## Features

- **POST /api/users**: Stores a user entry in the database and emits a dummy email and RabbitMQ event.
- **GET /api/user/{userId}**: Retrieves user data from `https://reqres.in/api/users/{userId}`.
- **GET /api/user/{userId}/avatar**: Fetches and saves a user's avatar locally. Returns the avatar as a base64-encoded string.
- **DELETE /api/user/{userId}/avatar**: Deletes a user's avatar from the local file system and database.

## Prerequisites

- **Node.js**: v14.x or later
- **npm**: v6.x or later
- **MongoDB**: v4.4 or later
- **RabbitMQ**: v3.7 or later
- **TypeScript**: v3.4 or later

## Setup

### 1. Clone the repository

```bash
git clone <repository-url>
cd rest_api_project
```

### 2. Install dependencies
```bash
npm install --save @nestjs/mongoose mongoose @nestjs/microservices amqplib axios
npm install --save-dev @nestjs/testing jest @types/jest ts-jest supertest
```

### 3. Environment Configuration
Ensure you have MongoDB and RabbitMQ running locally. You can configure environment variables as needed in a `.env` file. An example `.env` file might look like this:
```bash
MONGO_URI=mongodb://localhost:27017/rest_api_project
RABBITMQ_URI=amqp://localhost:5672
```

### 4. Build the project
```bash
npm run build
```

### 5. Run the application
```bash
npm start
```

### 6. Running in Development Mode
For development with hot-reloading:
```bash
npm run start:dev
```

### 7. Running Tests
To run the unit and functional tests:
```bash
npm run test
```
For continuous test watching:
```bash
npm run test:watch
```
To check test coverage:
```bash
npm run test:cov
```

### 8. Linting
To lint the project:
```bash
npx eslint .
```

### 9. Postman Collection
You can use Postman to test the API endpoints. Import the provided Postman collection or manually create requests to the following endpoints:
- POST /api/users
- GET /api/user/{userId}
- GET /api/user/{userId}/avatar
- DELETE /api/user/{userId}/avatar