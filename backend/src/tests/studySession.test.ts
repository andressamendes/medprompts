import request from 'supertest';
import express from 'express';
import studySessionRoutes from '../routes/studySessionRoutes';

// ===========================================
// MOCK DO MIDDLEWARE DE AUTENTICAÇÃO
// ===========================================
jest.mock('../middleware/auth.middleware', () => ({
  authenticateToken: (req: any, res: any, next: any) => {
    // Simula usuário autenticado
    req.userId = '550e8400-e29b-41d4-a716-446655440000';
    next();
  },
}));

// ===========================================
// CONFIGURAÇÃO DO APP DE TESTE
// ===========================================
const app = express();
app.use(express.json());
app.use('/api/v1/study-sessions', studySessionRoutes);

// ===========================================
// TESTES DAS ROTAS DE STUDY SESSIONS
// ===========================================

describe('Study Sessions API', () => {
  describe('POST /api/v1/study-sessions', () => {
    it('deve criar uma nova sessão de estudo com sucesso', async () => {
      const newSession = {
        topic: 'Anatomia Cardíaca',
        durationMinutes: 60,
        notes: 'Estudei sobre as câmaras do coração',
        promptsUsed: ['prompt-1', 'prompt-2'],
      };

      const response = await request(app)
        .post('/api/v1/study-sessions')
        .send(newSession)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.topic).toBe(newSession.topic);
      expect(response.body.data.durationMinutes).toBe(newSession.durationMinutes);
      expect(response.body.data.status).toBe('pending');
      expect(response.body.data.reviewCount).toBe(0);
    });

    it('deve retornar erro 400 se o tópico estiver ausente', async () => {
      const invalidSession = {
        durationMinutes: 60,
      };

      const response = await request(app)
        .post('/api/v1/study-sessions')
        .send(invalidSession)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('obrigatório');
    });

    it('deve retornar erro 400 se a duração for inválida', async () => {
      const invalidSession = {
        topic: 'Teste',
        durationMinutes: 0,
      };

      const response = await request(app)
        .post('/api/v1/study-sessions')
        .send(invalidSession)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('deve retornar erro 400 se o tópico for muito curto', async () => {
      const invalidSession = {
        topic: 'AB',
        durationMinutes: 30,
      };

      const response = await request(app)
        .post('/api/v1/study-sessions')
        .send(invalidSession)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/study-sessions', () => {
    it('deve retornar lista de sessões do usuário', async () => {
      const response = await request(app)
        .get('/api/v1/study-sessions')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body).toHaveProperty('pagination');
    });

    it('deve filtrar sessões por status', async () => {
      const response = await request(app)
        .get('/api/v1/study-sessions?status=pending')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('deve paginar resultados corretamente', async () => {
      const response = await request(app)
        .get('/api/v1/study-sessions?page=1&limit=5')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(5);
    });
  });

  describe('GET /api/v1/study-sessions/:id', () => {
    it('deve retornar uma sessão específica por ID', async () => {
      const sessionId = '123e4567-e89b-12d3-a456-426614174000';

      const response = await request(app)
        .get(`/api/v1/study-sessions/${sessionId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.id).toBe(sessionId);
    });

    it('deve retornar erro 404 se a sessão não existir', async () => {
      const nonExistentId = '999e9999-e99b-99d9-a999-999999999999';

      const response = await request(app)
        .get(`/api/v1/study-sessions/${nonExistentId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('não encontrada');
    });

    it('deve retornar erro 400 se o ID for inválido', async () => {
      const response = await request(app)
        .get('/api/v1/study-sessions/invalid-id')
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PATCH /api/v1/study-sessions/:id', () => {
    it('deve atualizar uma sessão existente', async () => {
      const sessionId = '123e4567-e89b-12d3-a456-426614174000';
      const updateData = {
        notes: 'Notas atualizadas',
        status: 'completed',
      };

      const response = await request(app)
        .patch(`/api/v1/study-sessions/${sessionId}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.notes).toBe(updateData.notes);
      expect(response.body.data.status).toBe(updateData.status);
    });

    it('deve retornar erro 404 ao tentar atualizar sessão inexistente', async () => {
      const nonExistentId = '999e9999-e99b-99d9-a999-999999999999';

      const response = await request(app)
        .patch(`/api/v1/study-sessions/${nonExistentId}`)
        .send({ notes: 'Teste' })
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('deve retornar erro 400 ao enviar dados inválidos', async () => {
      const sessionId = '123e4567-e89b-12d3-a456-426614174000';
      const invalidData = {
        status: 'invalid-status',
      };

      const response = await request(app)
        .patch(`/api/v1/study-sessions/${sessionId}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/v1/study-sessions/:id', () => {
    it('deve excluir uma sessão existente', async () => {
      const sessionId = '123e4567-e89b-12d3-a456-426614174000';

      const response = await request(app)
        .delete(`/api/v1/study-sessions/${sessionId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('excluída');
    });

    it('deve retornar erro 404 ao tentar excluir sessão inexistente', async () => {
      const nonExistentId = '999e9999-e99b-99d9-a999-999999999999';

      const response = await request(app)
        .delete(`/api/v1/study-sessions/${nonExistentId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/study-sessions/due', () => {
    it('deve retornar sessões para revisão', async () => {
      const response = await request(app)
        .get('/api/v1/study-sessions/due')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('deve filtrar por data limite', async () => {
      const dueDate = new Date().toISOString();

      const response = await request(app)
        .get(`/api/v1/study-sessions/due?until=${dueDate}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('POST /api/v1/study-sessions/:id/complete', () => {
    it('deve marcar sessão como completa e agendar próxima revisão', async () => {
      const sessionId = '123e4567-e89b-12d3-a456-426614174000';

      const response = await request(app)
        .post(`/api/v1/study-sessions/${sessionId}/complete`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('completed');
      expect(response.body.data.reviewCount).toBeGreaterThan(0);
      expect(response.body.data.nextReviewDate).toBeDefined();
    });
  });
});
