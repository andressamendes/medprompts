import request from 'supertest';
import app from '../app';
import Badge from '../models/Badge';
import { createTestUser } from './helpers';

describe('Gamification Endpoints', () => {
  let accessToken: string;
  let userId: string;
  let badgeId: string;

  beforeAll(async () => {
    const testUser = await createTestUser();
    accessToken = testUser.accessToken;
    userId = testUser.userId;
  });

  // Criar badge antes de cada teste (pois afterEach limpa)
  beforeEach(async () => {
    const badge = await Badge.create({
      name: 'Primeiro Passo',
      description: 'Seu primeiro badge',
      icon: '🎯',
      category:  'bronze',
      requirement: { type: 'xp', target: 10 },
    });
    badgeId = badge.id;
  });

  describe('GET /api/v1/gamification', () => {
    it('deve retornar todos os dados de gamificação', async () => {
      const res = await request(app)
        .get('/api/v1/gamification')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body. data).toHaveProperty('xp');
      expect(res.body.data).toHaveProperty('streak');
      expect(res.body.data).toHaveProperty('badges');
      expect(res.body.data).toHaveProperty('dailyMissions');
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
      expect(res.body. success).toBe(true);
      expect(res.body.data).toHaveProperty('currentXP');
      expect(res.body.data).toHaveProperty('level');
    });

    it('deve fazer level up quando atingir XP necessário', async () => {
      const res = await request(app)
        .post('/api/v1/gamification/xp')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          amount: 200,
          source: 'test',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body. data.level).toBeGreaterThanOrEqual(1);
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
      // Badge foi criado no beforeEach
      expect(res.body.data. length).toBeGreaterThan(0);
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
      expect(res.body. data).toHaveProperty('longestStreak');
    });
  });
});