# Chatting Server

A real-time chat backend built with FastAPI, Socket.IO, PostgreSQL, and Redis. PostgreSQL stores users; Redis stores chat history and publishes new messages to connected clients.

## Requirements

- Python 3.14 or later
- [uv](https://docs.astral.sh/uv/)
- PostgreSQL
- Redis

## Setup

Install the locked project dependencies:

```powershell
uv sync
```

Create a `.env` file in the project root:

```dotenv
DATABASE_URL=postgresql+psycopg2://YOUR_USER:your_password@localhost:5432/YOUR_DATABASE

SECRET_KEY=replace-with-a-long-random-secret

REDIS_URL=redis://localhost:6379/0
```

### PostgreSQL Setup

Before starting the server, create a PostgreSQL user and database.

Connect to PostgreSQL as an administrator (for example, the `postgres` user), then run:

```sql
CREATE USER YOUR_USER WITH PASSWORD 'your_password';

CREATE DATABASE YOUR_DATABASE OWNER YOUR_USER;

GRANT ALL PRIVILEGES ON DATABASE YOUR_DATABASE TO YOUR_USER;
```

Replace:

- `YOUR_USER` with the PostgreSQL username you want to use.
- `your_password` with a secure password.
- `YOUR_DATABASE` with the database name used in your `DATABASE_URL`.

For example:

```sql
CREATE USER chatting_user WITH PASSWORD 'strong_password';

CREATE DATABASE chatting OWNER chatting_user;

GRANT ALL PRIVILEGES ON DATABASE chatting TO chatting_user;
```

Then make sure your `.env` matches the database configuration:

```dotenv
DATABASE_URL=postgresql+psycopg2://chatting_user:strong_password@localhost:5432/chatting
```

Make sure PostgreSQL and Redis are running before starting the server.

> **Note:** Alembic migrations run automatically when the server starts, so you do not need to create the application tables manually.

## Run

Start the server with:

```powershell
uv run python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

The HTTP API is available at:

- API: http://localhost:8000
- Interactive API docs: http://localhost:8000/docs

## HTTP API

| Method | Path            | Purpose             |
| ------ | --------------- | ------------------- |
| `GET`  | `/auth/`        | Health check        |
| `POST` | `/auth/sign-up` | Create a user       |
| `POST` | `/auth/sign-in` | Get an access token |

### Sign Up

Sign-up expects:

```json
{
  "username": "john",
  "email": "john@example.com",
  "password": "password",
  "confirm_password": "password"
}
```

### Sign In

Sign-in expects:

```json
{
  "email": "john@example.com",
  "password": "password"
}
```

The response includes an access token that can be used to authenticate a Socket.IO connection.

## Socket.IO

Connect to the server with a Socket.IO client.

Authenticate at connection time using the access token from the sign-in API:

```javascript
const socket = io("http://localhost:8000", {
  auth: {
    token: "<access_token>",
  },
});
```

The `sign-in` event with email and password is also supported.

### Events

| Event                 | Direction        | Payload / Purpose                                |
| --------------------- | ---------------- | ------------------------------------------------ |
| `sign-in`             | Client → Server  | `{ "email": "...", "password": "..." }`          |
| `sign-in-result`      | Server → Client  | Sign-in result and access token                  |
| `message`             | Client → Server  | `{ "text": "Hello" }` to send a chat message     |
| `message`             | Server → Clients | A newly published chat message                   |
| `messages`            | Client → Server  | Request recent message history                   |
| `messages`            | Server → Client  | Latest 50 messages; refreshed after new messages |
| `get-connected-users` | Client → Server  | Request the connected-user list                  |
| `connected-users`     | Server → Clients | Connected authenticated users                    |

## Project Layout

```text
app/
├── main.py                 # FastAPI application and Socket.IO ASGI entry point
├── routers/                # HTTP routes
├── services/               # Socket.IO handlers and Redis integration
├── models/                 # Database models
└── schemas/                # API schemas

alembic/                    # Database migrations
tests/                      # Tests and Socket.IO client scripts
pyproject.toml              # Project dependencies and configuration
uv.lock                     # Locked dependency versions
```
