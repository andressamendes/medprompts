import { BaseRoom } from './BaseRoom';

/**
 * WardRoom - General ward simulation
 * Focus on patient care, rounds, and team coordination
 */
export class WardRoom extends BaseRoom {
  constructor() {
    super('ward', 50);
  }

  onCreate(options: any) {
    super.onCreate(options);

    this.state.mapName = 'general_ward';

    // Ward-specific interactions (patient rounds, care plans, etc.)
    this.onMessage('start_rounds', (client, message: { patientIds: string[] }) => {
      this.broadcast('rounds_started', {
        leaderId: client.auth.id,
        patientIds: message.patientIds,
        timestamp: Date.now(),
      }, { except: client });
    });
  }
}
