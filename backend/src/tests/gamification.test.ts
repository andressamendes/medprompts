import request from 'supertest';
import app from '../app';
import Badge from '../models/Badge';
import DailyMission from '../models/DailyMission';

describe('Gamification Endpoints', () => {
  let accessToken: string;
  let userId:  string;

  beforeEach(async () => {
    // Criar usuário
    const registerRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Gamification Test',
        email: 'gamification@example.com',
        password: 'senha123',
      });

    accessToken = registerRes.body.data.accessToken;
    userId = registerRes.body.data.user.id;

    // Criar badges de teste
    await Badge.create({
      name: 'Primeiro Passo',
      description: 'Seu primeiro badge',
      icon: '🎯',
      category: 'bronze',
      requirement: { type: 'xp', target: 10 },
    });

    // Criar missão de teste
    await DailyMission.create({
      title: 'Missão Teste',
      description: 'Complete esta missão',
      xpReward: 50,
      type: 'daily',
      requirement: { action: 'study_session', target: 1 },
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
      expect(res.body.data).toHaveProperty('dailyMissions');
      
      // Verificar dados iniciais
      expect(res.body.data.xp. currentXP).toBe(0);
      expect(res.body.data.xp.level).toBe(1);
      expect(res.body.data. streak. currentStreak).toBe(0);
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
      expect(res.body. data.currentXP).toBe(50);
      expect(res.body. data.totalXPEarned).toBe(50);
      expect(res.body.data. level).toBe(1);
      expect(res.body.data. leveledUp).toBe(false);
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
      expect(res.body.data.level).toBe(2);
      expect(res.body.data. leveledUp).toBe(true);
      expect(res.body.data. currentXP).toBe(50); // Overflow de 150 - 100
      expect(res.body.message).toContain('nível 2');
    });

    it('deve falhar com quantidade inválida', async () => {
      const res = await request(app)
        .post('/api/v1/gamification/xp')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          amount: -10,
          source: 'test',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/gamification/streak', () => {
    it('deve atualizar streak do usuário', async () => {
      const res = await request(app)
        .post('/api/v1/gamification/streak')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.currentStreak).toBeGreaterThan(0);
      expect(res.body.data. longestStreak).toBeGreaterThan(0);
    });
  });

  describe('GET /api/v1/gamification/badges', () => {
    it('deve listar todos os badges disponíveis', async () => {
      const res = await request(app)
        .get('/api/v1/gamification/badges')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.data. length).toBeGreaterThan(0);
      expect(res.body.data[0]).toHaveProperty('isUnlocked');
      expect(res.body.data[0]. isUnlocked).toBe(false);
    });
  });

  describe('GET /api/v1/gamification/xp/history', () => {
    beforeEach(async () => {
      // Adicionar algum XP primeiro
      await request(app)
        .post('/api/v1/gamification/xp')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ amount: 100, source: 'test' });
    });

    it('deve retornar histórico de XP', async () => {
      const res = await request(app)
        .get('/api/v1/gamification/xp/history')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeInstanceOf(Array);
    });

    it('deve filtrar por número de dias', async () => {
      const res = await request(app)
        .get('/api/v1/gamification/xp/history?days=7')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body. success).toBe(true);
    });
  });

  describe('GET /api/v1/gamification/leaderboard', () => {
    it('deve retornar leaderboard vazio inicialmente', async () => {
      const res = await request(app)
        .get('/api/v1/gamification/leaderboard')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeInstanceOf(Array);
    });
  });
});