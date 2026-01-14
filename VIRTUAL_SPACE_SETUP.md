# Virtual Space Setup Guide

## Current Issue
When visiting `https://andressamendes.github.io/medprompts/virtual-space`, you see:
> "Game server is not responding. Please check if the Colyseus server is running on port 2567."

This happens because:
1. GitHub Pages is served over HTTPS
2. The frontend tries to connect to `ws://localhost:2567`
3. Browsers block WebSocket connections from HTTPS sites to HTTP/localhost

## Solution

### Option 1: Local Development
For local testing, run both servers:

1. **Start the Colyseus server:**
   ```bash
   cd server
   node colyseus-test.js
   ```

2. **Start the frontend:**
   ```bash
   npm run dev
   ```

3. **Access Virtual Space:**
   - Open `http://localhost:5173/medprompts/virtual-space`
   - The server should be at `http://localhost:2567`

**Quick start (Windows):**
```bash
start-virtual-space.bat
```

### Option 2: Production Deployment
For GitHub Pages deployment, you need:

1. **Deploy Colyseus server to a hosting service:**
   - Render, Railway, Colyseus Cloud, or any Node.js hosting
   - The server must support WebSocket (WSS)

2. **Set environment variable:**
   - In your build process, set `VITE_COLYSEUS_URL` to your server URL
   - Example: `wss://your-server.onrender.com`

3. **Update GitHub Actions:**
   - Add `VITE_COLYSEUS_URL` as a secret in GitHub
   - Update `.github/workflows/deploy.yml` to use it

## Testing Current Setup

### Server Status
- Local server: `http://localhost:2567/health`
- Render server: `https://medprompts-colyseus.onrender.com/health` (currently offline)

### Connection Test
```javascript
// Test WebSocket connection
const client = new Colyseus.Client('ws://localhost:2567');
client.joinOrCreate('lobby').then(room => {
  console.log('Connected!', room.sessionId);
  room.leave();
}).catch(err => {
  console.error('Connection failed:', err);
});
```

## Troubleshooting

### Server not starting
1. Check if port 2567 is in use:
   ```bash
   netstat -ano | findstr :2567
   ```

2. Kill existing process:
   ```bash
   taskkill /PID <PID> /F
   ```

3. Check Node.js version:
   ```bash
   node --version
   ```

### Connection issues
1. **CORS errors:** Server CORS is configured for `http://localhost:5173`
2. **WebSocket errors:** Ensure server supports WebSocket protocol
3. **Firewall/antivirus:** May block WebSocket connections

## Next Steps
1. ✅ Local server is now running correctly
2. ❌ Production server needs to be deployed
3. ⚠️ Update build process to use production URL

## Files Modified
- `server/colyseus-test.js` - Fixed health endpoint error
- `start-virtual-space.bat` - Easy startup script for Windows
- `VIRTUAL_SPACE_SETUP.md` - This documentation
