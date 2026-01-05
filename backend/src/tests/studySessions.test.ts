import request from 'supertest';
import app from '../app';
import { createTestUser } from './helpers';

describe('Study Sessions Endpoints', () => {
  let accessToken: string;
  let userId:  string;

  beforeAll(async () => {
    const testUser = await createTestUser();
    accessToken = testUser.accessToken;
    userId = testUser. userId;
  });

  describe('POST /api/v1/study-sessions', () => {
    it('deve criar uma nova sessão de estudo', async () => {
      const res = await request(app)
        .post('/api/v1/study-sessions')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          topic: 'Anatomia Cardíaca',
          durationMinutes: 60,
          notes: 'Estudei sobre o coração',
          promptsUsed: [],
        });

      expect(res.status).toBe(201);
      expect(res.body. success).toBe(true);
      expect(res.body.session).toHaveProperty('id');
      expect(res.body. session.topic).toBe('Anatomia Cardíaca');
      expect(res.body.session. status).toBe('pending');
    });

    it('deve falhar com duração inválida', async () => {
      const res = await request(app)
        .post('/api/v1/study-sessions')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          topic: 'Teste',
          durationMinutes:  0,
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/study-sessions', () => {
    beforeAll(async () => {
      // Criar sessão de teste
      await request(app)
        .post('/api/v1/study-sessions')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          topic: 'Sessão 1',
          durationMinutes: 30,
        });
    });

    it('deve listar todas as sessões do usuário', async () => {
      const res = await request(app)
        .get('/api/v1/study-sessions')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.sessions)).toBe(true);
    });
  });

  describe('GET /api/v1/study-sessions/statistics', () => {
    it('deve retornar estatísticas de estudo', async () => {
      const res = await request(app)
        .get('/api/v1/study-sessions/statistics')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body. statistics).toHaveProperty('totalSessions');
      expect(res.body.statistics).toHaveProperty('totalMinutes');
    });
  });
});