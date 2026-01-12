import { BaseRoom } from './BaseRoom';
import { CollaborationEventRepository } from '../db/repositories';

/**
 * SurgicalRoom - Operating theater simulation
 * Focus on surgical procedures, team coordination, and precision
 */
export class SurgicalRoom extends BaseRoom {
  constructor() {
    super('surgical', 20); // Smaller capacity for surgical teams
  }

  onCreate(options: any) {
    super.onCreate(options);

    this.state.mapName = 'operating_theater';

    // Surgical procedure coordination
    this.onMessage('start_procedure', async (client, message: { procedureId: string; teamMembers: string[] }) => {
      // Log surgical collaboration
      await CollaborationEventRepository.create(
        this.roomType,
        'case_discussion',
        client.auth.id,
        null,
        {
          procedureId: message.procedureId,
          teamMembers: message.teamMembers,
          role: 'surgeon',
        },
        30 // 30 XP for surgical procedures
      );

      // Notify team members
      this.broadcast('procedure_started', {
        procedureId: message.procedureId,
        leadSurgeon: client.auth.id,
        teamMembers: message.teamMembers,
        timestamp: Date.now(),
      });
    });

    this.onMessage('procedure_step', (client, message: { procedureId: string; step: string; status: string }) => {
      // Broadcast procedure progress
      this.broadcast('procedure_update', {
        procedureId: message.procedureId,
        step: message.step,
        status: message.status,
        updatedBy: client.auth.id,
        timestamp: Date.now(),
      });
    });
  }
}
