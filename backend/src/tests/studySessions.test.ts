import request from 'supertest';
import app from '../app';

describe('Study Sessions Endpoints', () => {
  let accessToken:  string;
  let userId: string;

  beforeEach(async () => {
    // Criar usuário
    const registerRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Study Test',
        email: 'study@example.com',
        password: 'senha123',
      });

    accessToken = registerRes.body.data.accessToken;
    userId = registerRes.body.data.user.id;
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
      expect(res.body.session. topic).toBe('Anatomia Cardíaca');
      expect(res.body.session. durationMinutes).toBe(60);
      expect(res.body.session.status).toBe('pending');
      expect(res.body.session).toHaveProperty('nextReviewDate');
    });

    it('deve falhar com duração inválida', async () => {
      const res = await request(app)
        .post('/api/v1/study-sessions')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          topic: 'Teste',
          durationMinutes:  0, // Inválido
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('deve falhar sem tópico', async () => {
      const res = await request(app)
        .post('/api/v1/study-sessions')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          durationMinutes: 60,
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/study-sessions', () => {
    beforeEach(async () => {
      // Criar algumas sessões de teste
      await request(app)
        .post('/api/v1/study-sessions')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          topic: 'Sessão 1',
          durationMinutes: 30,
        });

      await request(app)
        .post('/api/v1/study-sessions')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          topic: 'Sessão 2',
          durationMinutes: 45,
        });
    });

    it('deve listar todas as sessões do usuário', async () => {
      const res = await request(app)
        .get('/api/v1/study-sessions')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.sessions).toHaveLength(2);
    });

    it('deve buscar sessões por texto', async () => {
      const res = await request(app)
        .get('/api/v1/study-sessions?search=Sessão 1')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.sessions).toHaveLength(1);
      expect(res.body. sessions[0].topic).toContain('Sessão 1');
    });

    it('deve filtrar por status', async () => {
      const res = await request(app)
        .get('/api/v1/study-sessions?status=pending')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.sessions).toHaveLength(2);
      expect(res.body.sessions[0].status).toBe('pending');
    });
  });

  describe('GET /api/v1/study-sessions/statistics', () => {
    beforeEach(async () => {
      // Criar sessões para estatísticas
      await request(app)
        .post('/api/v1/study-sessions')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          topic: 'Anatomia',
          durationMinutes: 60,
        });

      await request(app)
        .post('/api/v1/study-sessions')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          topic: 'Fisiologia',
          durationMinutes: 45,
        });
    });

    it('deve retornar estatísticas de estudo', async () => {
      const res = await request(app)
        .get('/api/v1/study-sessions/statistics')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.statistics).toHaveProperty('totalSessions');
      expect(res.body.statistics).toHaveProperty('totalMinutes');
      expect(res.body.statistics).toHaveProperty('averageMinutesPerSession');
      expect(res.body.statistics. totalSessions).toBe(2);
      expect(res.body.statistics.totalMinutes).toBe(105);
    });

    it('deve filtrar estatísticas por período', async () => {
      const res = await request(app)
        .get('/api/v1/study-sessions/statistics?period=week')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('POST /api/v1/study-sessions/:sessionId/complete', () => {
    let sessionId: string;

    beforeEach(async () => {
      const res = await request(app)
        .post('/api/v1/study-sessions')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          topic: 'Sessão para Completar',
          durationMinutes: 60,
        });

      sessionId = res.body.session.id;
    });

    it('deve marcar sessão como completada', async () => {
      const res = await request(app)
        .post(`/api/v1/study-sessions/${sessionId}/complete`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          quality: 5,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.session.status).toBe('completed');
      expect(res.body.session. reviewCount).toBeGreaterThan(0);
    });

    it('deve falhar com qualidade inválida', async () => {
      const res = await request(app)
        .post(`/api/v1/study-sessions/${sessionId}/complete`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          quality: 10, // Fora do range 1-5
        });

      expect(res.status).toBe(400);
      expect(res.body. success).toBe(false);
    });
  });

  describe('DELETE /api/v1/study-sessions/:sessionId', () => {
    let sessionId: string;

    beforeEach(async () => {
      const res = await request(app)
        .post('/api/v1/study-sessions')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          topic: 'Sessão para Deletar',
          durationMinutes: 30,
        });

      sessionId = res.body.session.id;
    });

    it('deve deletar uma sessão', async () => {
      const res = await request(app)
        .delete(`/api/v1/study-sessions/${sessionId}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // Verificar que foi deletada
      const getRes = await request(app)
        .get(`/api/v1/study-sessions/${sessionId}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(getRes.status).toBe(404);
    });
  });
});