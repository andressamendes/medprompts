import { BaseRoom } from './BaseRoom';

/**
 * ICURoom - Intensive Care Unit simulation
 * Focus on critical care, monitoring, and high-stakes decisions
 */
export class ICURoom extends BaseRoom {
  constructor() {
    super('icu', 30); // Smaller capacity for focused critical care
  }

  onCreate(options: any) {
    super.onCreate(options);

    this.state.mapName = 'intensive_care_unit';

    // ICU-specific critical events
    this.onMessage('critical_alert', (client, message: { patientId: string; alertType: string }) => {
      // Broadcast critical alert to all ICU staff
      this.broadcast('critical_alert', {
        patientId: message.patientId,
        alertType: message.alertType,
        alertedBy: client.auth.id,
        timestamp: Date.now(),
      });
    });
  }
}
