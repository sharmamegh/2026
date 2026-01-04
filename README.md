# Tiny Tools - MERN Stack

A collection of small, powerful utilities built with React, Node.js, and Express.

## Features

### 🕐 Hourglass Timer

- Real-time countdown timer with animated visualization
- Falling sand animation that represents progress
- Preset durations (1, 5, 10, 30 minutes) and custom input
- Save/load timer presets (in-memory storage per session)
- Fully responsive design
- Keyboard accessible controls

## Tech Stack

- **Frontend**: React 19 + Vite
- **Backend**: Express.js + Node.js
- **Database**: MongoDB + Mongoose (optional)
- **Styling**: CSS3 with animations

## Quick Start

### Prerequisites

- Node.js v16+

### Installation

1. **Frontend dependencies:**

   ```bash
   npm install
   ```

2. **Backend dependencies:**

   ```bash
   cd backend
   npm install
   cd ..
   ```

3. **Configure backend** - Create `backend/.env`:
   ```env
   PORT=5000
   NODE_ENV=development
   ```

### Running

**Terminal 1 - Backend:**

```bash
cd backend
npm run dev
```

Runs on `http://localhost:5000`

**Terminal 2 - Frontend:**

```bash
npm run dev
```

Runs on `http://localhost:5173`

## API Endpoints

All endpoints: `http://localhost:5000/api/timers`

| Method | Endpoint | Purpose            |
| ------ | -------- | ------------------ |
| GET    | `/`      | Get all timers     |
| GET    | `/:id`   | Get specific timer |
| POST   | `/`      | Create timer       |
| PUT    | `/:id`   | Update timer       |
| DELETE | `/:id`   | Delete timer       |

## Project Structure

```
tiny-tools/
├── backend/
│   ├── server.js
│   ├── config/db.js
│   ├── models/Timer.js
│   ├── controllers/timerController.js
│   ├── routes/timerRoutes.js
│   ├── package.json
│   └── .env.example
├── src/
│   ├── components/
│   │   ├── HourglassTimer.jsx
│   │   └── HourglassTimer.css
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── vite.config.js
└── package.json
```

## Storage

Timer presets are currently stored in-memory on the server. Data persists during the session but is lost when the server restarts.

**Future**: Database persistence with MongoDB will be optional.

**Timer Object Structure:**

- `id` - Unique identifier
- `name` - Timer name
- `duration` - Duration in seconds
- `createdAt` - Creation timestamp
- `updatedAt` - Last update timestamp

## Troubleshooting

- **Port in use**: Change `PORT` in `backend/.env`
- **Timer presets not saved after restart**: Timer data is stored in-memory and will be reset when the server restarts. This is the current design.

## License

MIT
