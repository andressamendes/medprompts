import { BaseRoom } from './BaseRoom';

/**
 * LobbyRoom - The main social hub where players spawn
 * Players can chat, see announcements, and navigate to other rooms
 */
export class LobbyRoom extends BaseRoom {
  constructor() {
    super('lobby', 100); // Allow more players in lobby
  }

  onCreate(options: any) {
    super.onCreate(options);

    // Lobby-specific initialization
    this.state.mapName = 'lobby_hospital';

    // Handle lobby-specific messages
    this.onMessage('request_room_info', (client) => {
      client.send('room_info', {
        activeRooms: {
          emergency: 0, // TODO: Implement room counting
          ward: 0,
          icu: 0,
          surgical: 0,
        },
      });
    });
  }
}
