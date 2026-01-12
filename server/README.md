# MedPrompts Colyseus Server

Multiplayer backend server for MedPrompts Virtual Space using Colyseus and Phaser 3.

## Features

- **Real-time Multiplayer**: Colyseus-powered synchronization
- **5 Virtual Rooms**:
  - 🏥 **Lobby**: Main social hub (100 players)
  - 🚑 **Emergency**: ER simulation (50 players)
  - 🏨 **Ward**: General ward (50 players)
  - 💉 **ICU**: Intensive care (30 players)
  - ⚕️ **Surgical**: Operating theater (20 players)
- **Database Integration**: PostgreSQL for session tracking, presence, and analytics
- **JWT Authentication**: Shared authentication with main backend
- **XP & Progression**: Time-based and interaction XP rewards
- **Collaboration Events**: Track player interactions and achievements

## Prerequisites

- Node.js >= 18
- PostgreSQL database (shared with main MedPrompts backend)
- JWT secret (must match main backend)

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and update:

```bash
cp .env.example .env
```

Required environment variables:

```env
# Server
NODE_ENV=development
PORT=2567

# Frontend CORS
FRONTEND_URL=http://localhost:5173

# JWT (MUST MATCH MAIN BACKEND!)
JWT_SECRET=your_jwt_secret_here

# PostgreSQL (SHARED WITH MAIN BACKEND)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=medprompts
DB_USER=postgres
DB_PASSWORD=your_password

# Logging
LOG_LEVEL=info
```

### 3. Run Database Migration

The migration file creates the necessary tables. Run it with:

```bash
psql $DATABASE_URL -f ../backend/src/migrations/006_create_virtual_space_tables.sql
```

Or manually:

```sql
-- Creates tables: room_sessions, user_presence, collaboration_events
-- See: backend/src/migrations/006_create_virtual_space_tables.sql
```

### 4. Build TypeScript

```bash
npm run build
```

### 5. Start Server

**Development (with hot reload):**

```bash
npm run dev
```

**Production:**

```bash
npm start
```

The server will start on `http://localhost:2567`

## Monitoring

In development mode, access the Colyseus monitor at:

```
http://localhost:2567/colyseus
```

This provides real-time insight into:
- Active rooms and player counts
- Room state inspection
- Client connections

## API Endpoints

### Health Check

```
GET /health
```

Returns server status and uptime.

### Colyseus Endpoints

- `ws://localhost:2567` - WebSocket connection
- Room types: `lobby`, `emergency`, `ward`, `icu`, `surgical`

## Client Connection Example

```typescript
import { Client } from 'colyseus.js';

const client = new Client('ws://localhost:2567');

// Join lobby with JWT token
const room = await client.joinOrCreate('lobby', {
  token: userJwtToken,
  x: 400,
  y: 300,
  avatar: 'doctor_01'
});

// Listen for state changes
room.onStateChange((state) => {
  console.log('Players:', state.players.size);
});

// Send messages
room.send('move', { x: 450, y: 350, direction: 'right' });
room.send('chat', { text: 'Hello everyone!' });
room.send('interact', { targetId: 'user123', type: 'greet' });

// Listen for events
room.onMessage('player_joined', (data) => {
  console.log(`${data.name} joined!`);
});
```

## Room Message Types

### Client → Server

- `move` - Update player position
  ```typescript
  { x: number, y: number, direction?: string }
  ```

- `stop` - Stop moving

- `interact` - Trigger interaction
  ```typescript
  { targetId?: string, type: string, data?: any }
  ```

- `status` - Update status
  ```typescript
  { status: 'active' | 'idle' | 'away' }
  ```

- `chat` - Send chat message
  ```typescript
  { text: string }
  ```

### Server → Client

- `player_joined` - New player joined room
- `player_left` - Player left room
- `chat` - Chat message broadcast
- `interaction` - Interaction event

### Room-Specific Messages

**Emergency Room:**
- `case_discussion` - Start case discussion
- `case_discussion_invite` - Invite to discussion

**Ward Room:**
- `start_rounds` - Begin patient rounds
- `rounds_started` - Rounds notification

**ICU Room:**
- `critical_alert` - Critical patient alert

**Surgical Room:**
- `start_procedure` - Begin surgical procedure
- `procedure_step` - Procedure progress update

## Database Schema

### Tables

1. **room_sessions**: Track user sessions with XP and duration
2. **user_presence**: Real-time player positions (hot data)
3. **collaboration_events**: Multiplayer interactions and rewards

### Views

- `daily_room_stats`: Daily analytics per room
- `virtual_space_leaderboard`: Top 100 players by XP

### Functions

- `cleanup_stale_presence()`: Remove inactive presence records
- `get_active_users_in_room(room_type)`: Get active players

## XP Rewards

- **Join room**: 10 XP
- **Time played**: 1 XP per minute
- **Interactions**: 5 XP each
- **Case discussions**: 20 XP
- **Surgical procedures**: 30 XP

## Architecture

```
server/
├── src/
│   ├── index.ts              # Entry point
│   ├── db/
│   │   ├── connection.ts     # PostgreSQL pool
│   │   └── repositories.ts   # Database operations
│   ├── middleware/
│   │   └── auth.ts           # JWT validation
│   ├── rooms/
│   │   ├── BaseRoom.ts       # Base room logic
│   │   ├── LobbyRoom.ts      # Lobby implementation
│   │   ├── EmergencyRoom.ts  # Emergency room
│   │   ├── WardRoom.ts       # Ward room
│   │   ├── ICURoom.ts        # ICU room
│   │   └── SurgicalRoom.ts   # Surgical room
│   ├── schemas/
│   │   ├── PlayerState.ts    # Player state schema
│   │   └── RoomState.ts      # Room state schema
│   └── utils/
│       └── logger.ts         # Winston logger
└── package.json
```

## Troubleshooting

### Connection Refused

- Check that the server is running on the correct port
- Verify CORS settings in `.env` match your frontend URL
- Ensure PostgreSQL is accessible

### Authentication Failed

- Verify JWT_SECRET matches the main backend
- Check token format is `Bearer <token>` or pass directly
- Ensure user exists in database

### Database Errors

- Run the migration file
- Check database credentials in `.env`
- Verify the `users` table exists (required foreign key)

## Production Deployment

### ☁️ Deploy to Render.com (Recommended)

The easiest way to deploy the Colyseus server is using [Render.com](https://render.com).

**Quick Start:**

1. **Push code to GitHub** (already done!)

2. **Create Render account** and connect GitHub repository

3. **Deploy using Blueprint**
   - Click "New +" → "Blueprint"
   - Select `medprompts` repository
   - Render will detect `render.yaml` automatically

4. **Add Environment Variables**
   ```
   FRONTEND_URL=https://andressamendes.github.io
   ```
   (Other vars are auto-configured by render.yaml)

5. **Copy server URL**
   - Will be: `https://medprompts-colyseus.onrender.com`
   - Use WebSocket version: `wss://medprompts-colyseus.onrender.com`

6. **Configure GitHub Actions**
   - Go to GitHub repo → Settings → Secrets → Actions
   - Add secret: `VITE_COLYSEUS_URL` = `wss://medprompts-colyseus.onrender.com`
   - Update `.github/workflows/deploy.yml`:
     ```yaml
     - name: Build
       env:
         VITE_COLYSEUS_URL: ${{ secrets.VITE_COLYSEUS_URL }}
       run: npm run build
     ```

**What Render does automatically:**
- ✅ Installs dependencies
- ✅ Compiles TypeScript
- ✅ Creates PostgreSQL database
- ✅ Generates JWT_SECRET
- ✅ Auto-deploy on push to main
- ✅ Health checks
- ✅ HTTPS + WSS support

**Free Tier Limitations:**
- Server sleeps after 15min inactivity
- First connection takes 30-60s (cold start)
- 750 hours/month free
- PostgreSQL: 90 days free trial

**Troubleshooting:**
- If server is "sleeping", first connection will be slow
- Check logs in Render dashboard
- Verify `DATABASE_URL` is set
- Ensure `FRONTEND_URL` matches your GitHub Pages URL

---

### 🔧 Traditional VPS Deployment

1. Set `NODE_ENV=production`
2. Use a process manager (PM2, systemd)
3. Configure reverse proxy (nginx) for WebSocket support
4. Use connection pooling for PostgreSQL
5. Enable logging to files
6. Set up monitoring (Colyseus monitor disabled in production)

### PM2 Example

```bash
pm2 start dist/index.js --name medprompts-server
pm2 save
pm2 startup
```

### Nginx WebSocket Config

```nginx
location /colyseus {
    proxy_pass http://localhost:2567;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
}
```

## License

Proprietary - MedPrompts Team
