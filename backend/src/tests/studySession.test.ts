import request from 'supertest';
import express from 'express';
import studySessionRoutes from '../routes/studySessionRoutes';

// ===========================================
// MOCK DO MIDDLEWARE DE AUTENTICAÇÃO
// ===========================================
jest.mock('../middlewares/auth', () => ({
  authenticate: (req: any, res: any, next: any) => {
    // Simula usuário autenticado
    req.userId = '550e8400-e29b-41d4-a716-446655440000';
    next();
  }
}));

// ===========================================
// CONFIGURAÇÃO DA APLICAÇÃO DE TESTE
// ===========================================
const app = express();
app.use(express.json());
app.use('/api/study-sessions', studySessionRoutes);

// ===========================================
// TESTES DE STUDY SESSIONS
// ===========================================
describe('Study Session Routes', () => {
  describe('POST /api/study-sessions', () => {
    it('deve criar uma nova sessão de estudo com sucesso', async () => {
      const newSession = {
        promptId: '123e4567-e89b-12d3-a456-426614174000',
        startTime: new Date().toISOString(),
        promptShown: 'Qual é o mecanismo de ação do paracetamol?',
        userAnswer: 'O paracetamol atua inibindo a enzima ciclooxigenase (COX) no sistema nervoso central.',
        confidenceLevel: 4,
        tags: ['farmacologia', 'analgésicos']
      };

      const response = await request(app)
        .post('/api/study-sessions')
        .send(newSession)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.promptId).toBe(newSession.promptId);
      expect(response.body.userAnswer).toBe(newSession.userAnswer);
      expect(response.body.confidenceLevel).toBe(4);
      expect(response.body.tags).toEqual(['farmacologia', 'analgésicos']);
      expect(response.body.userId).toBe('550e8400-e29b-41d4-a716-446655440000');
    });

    it('deve retornar erro 400 se dados obrigatórios estiverem faltando', async () => {
      const incompleteSession = {
        promptId: '123e4567-e89b-12d3-a456-426614174000'
        // faltando startTime, promptShown, userAnswer
      };

      const response = await request(app)
        .post('/api/study-sessions')
        .send(incompleteSession)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('required');
    });

    it('deve retornar erro 400 se confidenceLevel estiver fora do intervalo', async () => {
      const invalidSession = {
        promptId: '123e4567-e89b-12d3-a456-426614174000',
        startTime: new Date().toISOString(),
        promptShown: 'Pergunta teste',
        userAnswer: 'Resposta teste',
        confidenceLevel: 6 // deve estar entre 1 e 5
      };

      const response = await request(app)
        .post('/api/study-sessions')
        .send(invalidSession)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('deve retornar erro 400 se promptId não for um UUID válido', async () => {
      const invalidSession = {
        promptId: 'invalid-uuid',
        startTime: new Date().toISOString(),
        promptShown: 'Pergunta teste',
        userAnswer: 'Resposta teste',
        confidenceLevel: 3
      };

      const response = await request(app)
        .post('/api/study-sessions')
        .send(invalidSession)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/study-sessions', () => {
    it('deve retornar uma lista de sessões de estudo do usuário', async () => {
      const response = await request(app)
        .get('/api/study-sessions')
        .expect(200);

      expect(response.body).toHaveProperty('sessions');
      expect(Array.isArray(response.body.sessions)).toBe(true);
      expect(response.body).toHaveProperty('total');
    });

    it('deve aceitar filtros de data', async () => {
      const startDate = new Date('2026-01-01').toISOString();
      const endDate = new Date('2026-01-31').toISOString();

      const response = await request(app)
        .get(`/api/study-sessions?startDate=${startDate}&endDate=${endDate}`)
        .expect(200);

      expect(response.body).toHaveProperty('sessions');
      expect(response.body).toHaveProperty('total');
    });

    it('deve aceitar filtros de tags', async () => {
      const response = await request(app)
        .get('/api/study-sessions?tags=farmacologia,cardiologia')
        .expect(200);

      expect(response.body).toHaveProperty('sessions');
      expect(response.body.sessions.every((s: any) => 
        s.tags.some((tag: string) => ['farmacologia', 'cardiologia'].includes(tag))
      )).toBe(true);
    });
  });

  describe('GET /api/study-sessions/:id', () => {
    it('deve retornar uma sessão específica', async () => {
      const sessionId = '123e4567-e89b-12d3-a456-426614174000';

      const response = await request(app)
        .get(`/api/study-sessions/${sessionId}`)
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body.id).toBe(sessionId);
      expect(response.body).toHaveProperty('promptShown');
      expect(response.body).toHaveProperty('userAnswer');
    });

    it('deve retornar erro 404 se a sessão não existir', async () => {
      const nonExistentId = '999e9999-e99b-99d9-a999-999999999999';

      const response = await request(app)
        .get(`/api/study-sessions/${nonExistentId}`)
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('not found');
    });

    it('deve retornar erro 400 se o ID não for um UUID válido', async () => {
      const response = await request(app)
        .get('/api/study-sessions/invalid-id')
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('PUT /api/study-sessions/:id', () => {
    it('deve atualizar uma sessão existente', async () => {
      const sessionId = '123e4567-e89b-12d3-a456-426614174000';
      const updates = {
        confidenceLevel: 5,
        tags: ['farmacologia', 'analgésicos', 'anti-inflamatórios']
      };

      const response = await request(app)
        .put(`/api/study-sessions/${sessionId}`)
        .send(updates)
        .expect(200);

      expect(response.body.confidenceLevel).toBe(5);
      expect(response.body.tags).toEqual(['farmacologia', 'analgésicos', 'anti-inflamatórios']);
    });

    it('deve retornar erro 404 se a sessão não existir', async () => {
      const nonExistentId = '999e9999-e99b-99d9-a999-999999999999';

      const response = await request(app)
        .put(`/api/study-sessions/${nonExistentId}`)
        .send({ confidenceLevel: 5 })
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });

    it('deve retornar erro 400 se tentar atualizar campos não permitidos', async () => {
      const sessionId = '123e4567-e89b-12d3-a456-426614174000';

      const response = await request(app)
        .put(`/api/study-sessions/${sessionId}`)
        .send({ promptId: 'new-prompt-id' }) // não deve permitir mudança de promptId
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('DELETE /api/study-sessions/:id', () => {
    it('deve deletar uma sessão existente', async () => {
      const sessionId = '123e4567-e89b-12d3-a456-426614174000';

      const response = await request(app)
        .delete(`/api/study-sessions/${sessionId}`)
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('deleted');
    });

    it('deve retornar erro 404 se a sessão não existir', async () => {
      const nonExistentId = '999e9999-e99b-99d9-a999-999999999999';

      const response = await request(app)
        .delete(`/api/study-sessions/${nonExistentId}`)
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/study-sessions/statistics', () => {
    it('deve retornar estatísticas de estudo do usuário', async () => {
      const response = await request(app)
        .get('/api/study-sessions/statistics')
        .expect(200);

      expect(response.body).toHaveProperty('totalSessions');
      expect(response.body).toHaveProperty('averageConfidence');
      expect(response.body).toHaveProperty('studyTimeTotal');
      expect(response.body).toHaveProperty('tagDistribution');
    });

    it('deve aceitar período de tempo nas estatísticas', async () => {
      const startDate = new Date('2026-01-01').toISOString();
      const endDate = new Date('2026-01-31').toISOString();

      const response = await request(app)
        .get(`/api/study-sessions/statistics?startDate=${startDate}&endDate=${endDate}`)
        .expect(200);

      expect(response.body).toHaveProperty('totalSessions');
      expect(response.body).toHaveProperty('period');
    });
  });

  describe('POST /api/study-sessions/batch', () => {
    it('deve criar múltiplas sessões de uma vez', async () => {
      const sessions = [
        {
          promptId: '123e4567-e89b-12d3-a456-426614174001',
          startTime: new Date().toISOString(),
          promptShown: 'Pergunta 1',
          userAnswer: 'Resposta 1',
          confidenceLevel: 3,
          tags: ['tag1']
        },
        {
          promptId: '123e4567-e89b-12d3-a456-426614174002',
          startTime: new Date().toISOString(),
          promptShown: 'Pergunta 2',
          userAnswer: 'Resposta 2',
          confidenceLevel: 4,
          tags: ['tag2']
        }
      ];

      const response = await request(app)
        .post('/api/study-sessions/batch')
        .send({ sessions })
        .expect(201);

      expect(response.body).toHaveProperty('created');
      expect(response.body.created).toBe(2);
      expect(Array.isArray(response.body.sessions)).toBe(true);
      expect(response.body.sessions).toHaveLength(2);
    });

    it('deve retornar erro 400 se o array de sessões estiver vazio', async () => {
      const response = await request(app)
        .post('/api/study-sessions/batch')
        .send({ sessions: [] })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });
});
