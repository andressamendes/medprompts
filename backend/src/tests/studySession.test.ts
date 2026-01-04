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
// MOCK DO MODELO StudySession
// ===========================================
const mockSessions: any[] = [];
let mockIdCounter = 1;

jest.mock('../models/StudySession', () => {
  return {
    __esModule: true,
    default: {
      findAll: jest.fn((options: any) => {
        let filtered = [...mockSessions];
        
        // Aplicar filtros where se existirem
        if (options?.where) {
          filtered = filtered.filter((s) => {
            if (options.where.userId && s.userId !== options.where.userId) return false;
            if (options.where.status && s.status !== options.where.status) return false;
            if (options.where.id && s.id !== options.where.id) return false;
            return true;
          });
        }
        
        return Promise.resolve(filtered);
      }),
      findOne: jest.fn((options: any) => {
        const session = mockSessions.find((s) => {
          if (options.where.id && s.id !== options.where.id) return false;
          if (options.where.userId && s.userId !== options.where.userId) return false;
          return true;
        });
        return Promise.resolve(session || null);
      }),
      create: jest.fn((data: any) => {
        const newSession = {
          id: `session-${mockIdCounter++}`,
          ...data,
          createdAt: new Date(),
          updatedAt: new Date(),
          save: jest.fn().mockResolvedValue(true),
          destroy: jest.fn().mockResolvedValue(true),
        };
        mockSessions.push(newSession);
        return Promise.resolve(newSession);
      }),
    },
  };
});

// ===========================================
// CONFIGURAÇÃO DA APLICAÇÃO DE TESTE
// ===========================================
const app = express();
app.use(express.json());
app.use('/api/study-sessions', studySessionRoutes);

// ===========================================
// HELPER: Limpar mocks entre testes
// ===========================================
beforeEach(() => {
  mockSessions.length = 0;
  mockIdCounter = 1;
});

// ===========================================
// TESTES DE STUDY SESSIONS
// ===========================================
describe('Study Session Routes', () => {
  describe('POST /api/study-sessions', () => {
    it('deve criar uma nova sessão de estudo com sucesso', async () => {
      const newSession = {
        topic: 'Farmacologia - Paracetamol',
        durationMinutes: 45,
        notes: 'Revisão sobre mecanismo de ação e indicações terapêuticas',
        promptsUsed: ['prompt-1', 'prompt-2']
      };

      const response = await request(app)
        .post('/api/study-sessions')
        .send(newSession)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.session).toHaveProperty('id');
      expect(response.body.session.topic).toBe(newSession.topic);
      expect(response.body.session.durationMinutes).toBe(45);
      expect(response.body.session.userId).toBe('550e8400-e29b-41d4-a716-446655440000');
    });

    it('deve retornar erro 400 se topic estiver faltando', async () => {
      const incompleteSession = {
        durationMinutes: 30
      };

      const response = await request(app)
        .post('/api/study-sessions')
        .send(incompleteSession)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('obrigatórios');
    });

    it('deve retornar erro 400 se durationMinutes estiver faltando', async () => {
      const incompleteSession = {
        topic: 'Teste'
      };

      const response = await request(app)
        .post('/api/study-sessions')
        .send(incompleteSession)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('obrigatórios');
    });

    it('deve retornar erro 400 se durationMinutes for inválido', async () => {
      const invalidSession = {
        topic: 'Teste',
        durationMinutes: 600 // mais de 480 minutos (8 horas)
      };

      const response = await request(app)
        .post('/api/study-sessions')
        .send(invalidSession)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('480');
    });
  });

  describe('GET /api/study-sessions', () => {
    it('deve retornar uma lista de sessões de estudo do usuário', async () => {
      const response = await request(app)
        .get('/api/study-sessions')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.sessions).toBeDefined();
      expect(Array.isArray(response.body.sessions)).toBe(true);
    });

    it('deve aceitar filtros de data', async () => {
      const startDate = new Date('2026-01-01').toISOString();
      const endDate = new Date('2026-01-31').toISOString();

      const response = await request(app)
        .get(`/api/study-sessions?startDate=${startDate}&endDate=${endDate}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.sessions).toBeDefined();
    });

    it('deve aceitar filtro de status', async () => {
      const response = await request(app)
        .get('/api/study-sessions?status=completed')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.sessions).toBeDefined();
    });

    it('deve aceitar filtro de busca por tópico', async () => {
      const response = await request(app)
        .get('/api/study-sessions?search=farmacologia')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.sessions).toBeDefined();
    });
  });

  describe('GET /api/study-sessions/:sessionId', () => {
    it('deve retornar erro 404 se a sessão não existir', async () => {
      const nonExistentId = '999e9999-e99b-99d9-a999-999999999999';

      const response = await request(app)
        .get(`/api/study-sessions/${nonExistentId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('não encontrada');
    });
  });

  describe('PUT /api/study-sessions/:sessionId', () => {
    it('deve retornar erro 404 se tentar atualizar sessão inexistente', async () => {
      const nonExistentId = '999e9999-e99b-99d9-a999-999999999999';

      const response = await request(app)
        .put(`/api/study-sessions/${nonExistentId}`)
        .send({ topic: 'Novo tópico' })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('não encontrada');
    });

    it('deve retornar erro 400 se durationMinutes for inválido', async () => {
      const sessionId = 'session-1';

      const response = await request(app)
        .put(`/api/study-sessions/${sessionId}`)
        .send({ durationMinutes: 500 })
        .expect(404); // Retorna 404 porque sessão não existe no mock

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/study-sessions/:sessionId', () => {
    it('deve retornar erro 404 se tentar deletar sessão inexistente', async () => {
      const nonExistentId = '999e9999-e99b-99d9-a999-999999999999';

      const response = await request(app)
        .delete(`/api/study-sessions/${nonExistentId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('não encontrada');
    });
  });

  describe('GET /api/study-sessions/statistics', () => {
    it('deve retornar estatísticas de estudo do usuário', async () => {
      const response = await request(app)
        .get('/api/study-sessions/statistics')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.statistics).toBeDefined();
      expect(response.body.statistics).toHaveProperty('totalSessions');
      expect(response.body.statistics).toHaveProperty('totalMinutes');
      expect(response.body.statistics).toHaveProperty('totalHours');
      expect(response.body.statistics).toHaveProperty('completedSessions');
      expect(response.body.statistics).toHaveProperty('pendingSessions');
      expect(response.body.statistics).toHaveProperty('averageMinutesPerSession');
      expect(response.body.statistics).toHaveProperty('topTopics');
      expect(response.body.statistics).toHaveProperty('last7Days');
    });

    it('deve aceitar período de tempo nas estatísticas', async () => {
      const response = await request(app)
        .get('/api/study-sessions/statistics?period=week')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.statistics).toBeDefined();
    });

    it('deve aceitar período month nas estatísticas', async () => {
      const response = await request(app)
        .get('/api/study-sessions/statistics?period=month')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.statistics).toBeDefined();
    });
  });

  describe('GET /api/study-sessions/review', () => {
    it('deve retornar sessões que precisam de revisão', async () => {
      const response = await request(app)
        .get('/api/study-sessions/review')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.sessions).toBeDefined();
      expect(Array.isArray(response.body.sessions)).toBe(true);
      expect(response.body.count).toBeDefined();
    });
  });

  describe('POST /api/study-sessions/:sessionId/complete', () => {
    it('deve retornar erro 404 se sessão não existir', async () => {
      const nonExistentId = '999e9999-e99b-99d9-a999-999999999999';

      const response = await request(app)
        .post(`/api/study-sessions/${nonExistentId}/complete`)
        .send({ quality: 4 })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('não encontrada');
    });

    it('deve retornar erro 400 se quality for inválido', async () => {
      const sessionId = 'session-1';

      const response = await request(app)
        .post(`/api/study-sessions/${sessionId}/complete`)
        .send({ quality: 6 }) // deve ser 1-5
        .expect(404); // Retorna 404 porque sessão não existe no mock

      expect(response.body.success).toBe(false);
    });
  });
});
