import request from 'supertest';
import app from '../app';
import Badge from '../models/Badge';

describe('Gamification Endpoints', () => {
  let accessToken:  string;
  let userId: string;
  const testEmail = `gamification-${Date.now()}@example.com`;

  beforeAll(async () => {
    const registerRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Gamification Test',
        email: testEmail,
        password: 'senha123',
      });

    accessToken = registerRes.body.data.accessToken;
    userId = registerRes. body.data.user.id;

    // Criar badge de teste
    await Badge.create({
      name: 'Primeiro Passo',
      description: 'Seu primeiro badge',
      icon: '🎯',
      category: 'bronze',
      requirement: { type: 'xp', target: 10 },
    });
  });

  describe('GET /api/v1/gamification', () => {
    it('deve retornar todos os dados de gamificação', async () => {
      const res = await request(app)
        .get('/api/v1/gamification')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('xp');
      expect(res.body.data).toHaveProperty('streak');
      expect(res.body.data).toHaveProperty('badges');
    });
  });

  describe('POST /api/v1/gamification/xp', () => {
    it('deve adicionar XP ao usuário', async () => {
      const res = await request(app)
        .post('/api/v1/gamification/xp')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          amount: 50,
          source: 'test',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body. data.currentXP).toBeGreaterThanOrEqual(0);
    });

    it('deve fazer level up quando atingir XP necessário', async () => {
      const res = await request(app)
        .post('/api/v1/gamification/xp')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          amount: 150,
          source: 'test',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.level).toBeGreaterThanOrEqual(1);
    });
  });

  describe('GET /api/v1/gamification/badges', () => {
    it('deve listar todos os badges disponíveis', async () => {
      const res = await request(app)
        .get('/api/v1/gamification/badges')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body. data)).toBe(true);
    });
  });

  describe('POST /api/v1/gamification/streak', () => {
    it('deve atualizar streak do usuário', async () => {
      const res = await request(app)
        .post('/api/v1/gamification/streak')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('currentStreak');
    });
  });
});