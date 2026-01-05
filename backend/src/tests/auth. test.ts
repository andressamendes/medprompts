import request from 'supertest';
import app from '../app';

describe('Auth Endpoints', () => {
  describe('POST /api/v1/auth/register', () => {
    it('deve registrar um novo usuário com sucesso', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Teste User',
          email: `teste-${Date.now()}@example.com`, // Email único
          password: 'senha123',
          university: 'UFBA',
          graduationYear: 2026,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data. user).toHaveProperty('id');
      expect(res.body.data).toHaveProperty('accessToken');
      expect(res.body. data).toHaveProperty('refreshToken');
    });

    it('deve falhar com email duplicado', async () => {
      const email = `duplicate-${Date.now()}@example.com`;
      
      await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'User 1',
          email,
          password: 'senha123',
        });

      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'User 2',
          email,
          password:  'senha456',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    const testEmail = `login-${Date.now()}@example.com`;
    
    beforeAll(async () => {
      await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Login Test',
          email: testEmail,
          password: 'senha123',
        });
    });

    it('deve fazer login com credenciais corretas', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testEmail,
          password: 'senha123',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('accessToken');
    });

    it('deve falhar com senha incorreta', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testEmail,
          password: 'senhaerrada',
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });
});