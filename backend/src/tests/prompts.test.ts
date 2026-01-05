import request from 'supertest';
import app from '../app';

describe('Prompts Endpoints', () => {
  let accessToken: string;
  let userId: string;
  const testEmail = `prompt-${Date.now()}@example.com`;

  beforeAll(async () => {
    const registerRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Prompt Test',
        email:  testEmail,
        password: 'senha123',
      });

    accessToken = registerRes.body.data.accessToken;
    userId = registerRes.body.data.user.id;
  });

  describe('POST /api/v1/prompts', () => {
    it('deve criar um novo prompt', async () => {
      const res = await request(app)
        .post('/api/v1/prompts')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: 'Anamnese Completa',
          content: 'Faça uma anamnese detalhada considerando.. .',
          category: 'Anamnese',
          tags: ['anamnese', 'básico'],
        });

      expect(res.status).toBe(201);
      expect(res.body. success).toBe(true);
      expect(res.body.prompt).toHaveProperty('id');
    });

    it('deve falhar sem autenticação', async () => {
      const res = await request(app)
        .post('/api/v1/prompts')
        .send({
          title: 'Test',
          content: 'Test content',
          category: 'Anamnese',
        });

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/v1/prompts', () => {
    beforeAll(async () => {
      await request(app)
        .post('/api/v1/prompts')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: 'Prompt 1',
          content: 'Conteúdo do prompt 1',
          category: 'Anamnese',
          tags: ['teste'],
        });

      await request(app)
        .post('/api/v1/prompts')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: 'Prompt 2',
          content: 'Conteúdo do prompt 2',
          category: 'Diagnóstico',
          tags: ['teste'],
        });
    });

    it('deve listar todos os prompts do usuário', async () => {
      const res = await request(app)
        .get('/api/v1/prompts')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body. prompts)).toBe(true);
    });

    it('deve filtrar prompts por categoria', async () => {
      const res = await request(app)
        .get('/api/v1/prompts? category=Anamnese')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      if (res.body.prompts.length > 0) {
        expect(res.body. prompts[0].category).toBe('Anamnese');
      }
    });
  });
});