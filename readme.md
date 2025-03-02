# Fitbit Express API

A simple Express API for interacting with the Fitbit API, using OAuth2 authentication.

## Features

- OAuth2 authentication with Fitbit
- JWT-based authentication (supports both session cookies and bearer tokens)
- Auto token refresh
- ES6 syntax with import/export
- Environment variable configuration
- Clean separation of routes, middleware, and utilities

## Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/fitbit-express-api.git
cd fitbit-express-api

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your Fitbit API credentials
```

## Configuration

Edit the `.env` file with your Fitbit API credentials (copy from `.env.example`):

```
# Server configuration
HOST=127.0.0.1
PORT=3000

# Fitbit API credentials (get these from https://dev.fitbit.com/apps)
FITBIT_CLIENT_ID=your_client_id
FITBIT_CLIENT_SECRET=your_client_secret
FITBIT_REDIRECT_URI=http://localhost:3000/auth/callback

# OAuth scopes
FITBIT_SCOPE=activity heartrate location nutrition profile settings sleep social weight

# JWT configuration
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=1d

# Cookie configuration
COOKIE_MAX_AGE=86400000
COOKIE_SECURE=false  # Set to true in production with HTTPS
```

## Running the Server

```bash
# Start the server
npm start

# Development mode with auto-restart
npm run dev
```

## Authentication Methods

This API supports two authentication methods:

### 1. Cookie-based Authentication (for web applications)

1. Direct the user to `/auth/login` to authenticate with Fitbit
2. After successful login, a JWT is stored in an HTTP-only cookie
3. All subsequent requests will automatically include this cookie

### 2. Bearer Token Authentication (for API/mobile clients)

1. Authenticate with Fitbit by requesting `/auth/login?format=json`
2. Extract the token from the JSON response
3. Include the token in all API requests via the `Authorization` header:
   ```
   Authorization: Bearer your_token_here
   ```

You can also pass the token as a query parameter (for testing purposes only):
```
/api/profile?token=your_token_here
```

## API Endpoints

### Authentication

- `GET /auth/login` - Initiate Fitbit OAuth2 login
- `GET /auth/callback` - OAuth2 callback (redirect URI)
- `GET /auth/status` - Check authentication status
- `GET /auth/token` - Get JWT token (for bearer token usage)
- `GET /auth/logout` - Log out and clear authentication

### Data (requires authentication)

- `GET /api/profile` - Get user profile
- `GET /api/activities/date/:date` - Get activity data for a date (YYYY-MM-DD)
- `GET /api/heart/date/:date` - Get heart rate data
- `GET /api/sleep/date/:date` - Get sleep data
- `GET /api/weight/date/:startDate/:endDate` - Get weight logs

### Generic Proxy

- `GET /api/proxy/*` - Generic proxy to any Fitbit API endpoint

## Security Notes

- In production, set `COOKIE_SECURE=true` to only allow cookies over HTTPS
- Use a strong random string for `JWT_SECRET`
- Consider adding CSRF protection for production use

