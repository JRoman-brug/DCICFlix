# DCICFlix Microservices

This repository contains several small microservices for the DCICFlix project. The file below lists each microservice, an author field (auto-detected where possible), and a place to document known endpoints/routes.

If your services are implemented in code, re-run the route discovery step (or ask me to scan again) after adding server files (e.g., `app.py`, `main.py`, `server.js`, `routes.js`, `package.json`, `pyproject.toml`).

--

## Authors

- [Franco Piumatti](https://github.com/Piuma04)
- [Josefina Bacci](https://github.com/JosefinaBacci)
- [Brugnoni Juan Román](https://github.com/JRoman-brug)

## Services

For each service below, please fill in the Author and Endpoints sections if they are missing or incomplete. If you prefer, I can re-scan the repo to populate these automatically once the service code is present.

### Movies

- Author: (not found)
- Description: Movie information service.
- Endpoints (examples / placeholders):
  - GET /movies — List movies
  - GET /movies/:id — Get movie details
  - POST /movies — Create a new movie

### Opinions

- Author: (not found)
- Description: Stores user opinions /reviews about movies.
- Endpoints (examples / placeholders):
  - GET /opinions — List opinions
  - POST /opinions — Submit an opinion
  - GET /opinions/:id — Get opinion details

### RandomMovies

- Author: (not found)
- Description: Returns a random movie or selection.
- Endpoints (examples / placeholders):
  - GET /random-movie — Get a single random movie
  - GET /random-movies — Get a random list of movies

### Ranking

- Author: (not found)
- Description: Ranking service for movies (scores, leaderboards).
- Endpoints (examples / placeholders):
  - GET /rankings — Get rankings
  - POST /rankings — Submit/update a ranking

### Recommender

- Author: (not found)
- Description: Recommendation engine / collaborative filtering interfaces.
- Endpoints (examples / placeholders):
  - GET /recommendations — Get recommendations for a user
  - POST /recommendations — Generate recommendations with input

### API-Gateway

- Author: [Brugnoni Juan Román](https://github.com/JRoman-brug)
- Description: Verify JWT
- base url: api-gateway:3002

### Users manage

- Author: [Brugnoni Juan Román](https://github.com/JRoman-brug)
- Description: User CRUD
- base url: `users:3000`

Endpoints

- GET `user/:id`

  - Description: Retrieve a user by their id.
  - Response: `200 OK` with user JSON, or `404 Not Found` if the user doesn't exist.

- GET `user/by-email/:email`

  - Description: Retrieve a user by their email address.
  - Response: `200 OK` with user JSON, or `404 Not Found` if not found.

- POST `user/`
  - Description: Create a new user. Requires a JSON request body.
  - Content-Type: `application/json`
  - Request body schema:
    - `email` (string, required)
    - `password` (string, required)
  - Example request body:

```json
{
  "email": "alice@example.com",
  "password": "S3cureP@ssw0rd"
}
```

- Responses:

  - `201 Created` with created user JSON (excluding password).
  - `400 Bad Request` if required fields missing or invalid.

- PATCH `user/:id`
  - Description: Partially update an existing user. Requires a JSON request body with the fields to change.
  - Content-Type: `application/json`
  - Request body: a partial object containing one or more updatable fields (only present fields will be changed).
    - Common updatable fields: `email`, `password`

```json
{
  "password": "newPassword123"
}
```

- Responses:

  - `200 OK` with updated user JSON.
  - `400 Bad Request` for invalid input.
  - `404 Not Found` if the user id does not exist.

- DELETE `user/:id`
  - Description: Delete a user by id.
  - Responses:
    - `204 No Content` on successful deletion.
    - `404 Not Found` if the user doesn't exist.

### Authentication

- Author: [Brugnoni Juan Román](https://github.com/JRoman-brug)
- Description: Authentication service endpoints for login, registration and token refresh.
- Base url: `auth:3001`

- POST `auth/login`
  - Description: Authenticate a user and receive a JWT.
  - Request: Content-Type `application/json` with body:

```json
{
  "email": "alice@example.com",
  "password": "S3cureP@ssw0rd"
}
```

- Response: `200 OK` JSON containing the user's `id`, `email` and a JWT token under the `token` field. Example:

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "email": "alice@example.com",
  "token": "<JWT_STRING>",
  "message": "login sucessfully"
}
```

- POST `auth/register`
  - Description: Create a new user and receive a JWT.
  - Request: Content-Type `application/json` with body:

```json
{
  "email": "alice@example.com",
  "password": "S3cureP@ssw0rd"
}
```

- Response: `201 Created` JSON containing the created user's `id`, `email` and a JWT token under the `token` field. Example:

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "email": "alice@example.com",
  "token": "<JWT_STRING>",
  "message": "login sucessfully"
}
```

- POST `auth/refresh`
  - Description: Refresh an existing JWT by sending the current token; returns a new access token.
  - Request: Content-Type `application/json` with body:

```json
{
  "token": "<OLD_JWT>"
}
```

- Response: `200 OK` JSON containing the new token. Note: the current implementation returns the new token under the key `accessToke` (exact string as returned by the service). Example:

```json
{
  "accessToke": "<NEW_JWT_STRING>"
}
```

## How to update this README automatically

1. Add your service implementation files into the matching folder (e.g., `Movies/` → `app.py`, `server.js`, or `routes.py`).
2. Ask me to "scan for endpoints" and I will search the repo for route definitions and update this README with discovered HTTP methods and paths.

If you want, I can also add a small script to attempt automatic extraction of endpoints from common frameworks (Express, Flask, FastAPI, Spring Boot). Tell me which language/framework you use and I will scaffold the scanner and run it.

--

Generated: 2025-11-10
