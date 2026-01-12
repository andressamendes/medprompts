import { BaseRoom } from './BaseRoom';
import { CollaborationEventRepository } from '../db/repositories';

/**
 * EmergencyRoom - Emergency department simulation
 * Focus on triage, quick decision-making, and collaboration
 */
export class EmergencyRoom extends BaseRoom {
  constructor() {
    super('emergency', 50);
  }

  onCreate(options: any) {
    super.onCreate(options);

    this.state.mapName = 'emergency_department';

    // Emergency room specific interactions
    this.onMessage('case_discussion', async (client, message: { caseId: string; participants: string[] }) => {
      // Log case discussion collaboration event
      await CollaborationEventRepository.create(
        this.roomType,
        'case_discussion',
        client.auth.id,
        null,
        {
          caseId: message.caseId,
          participants: message.participants,
        },
        20 // 20 XP for case discussions
      );

      // Notify participants
      message.participants.forEach((participantId) => {
        const participantClient = Array.from(this.clients).find(
          (c) => c.auth.id === participantId
        );

        if (participantClient) {
          participantClient.send('case_discussion_invite', {
            from: client.auth.id,
            caseId: message.caseId,
          });
        }
      });
    });
  }
}
