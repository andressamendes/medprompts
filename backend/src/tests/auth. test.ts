import request from 'supertest';
import app from '../app';

describe('Auth Endpoints', () => {
  describe('POST /api/v1/auth/register', () => {
    it('deve registrar um novo usuário com sucesso', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Teste User',
          email: 'teste@example.com',
          password: 'senha123',
          university: 'UFBA',
          graduationYear: 2026,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data. user).toHaveProperty('id');
      expect(res.body.data. user.email).toBe('teste@example. com');
      expect(res.body.data).toHaveProperty('accessToken');
      expect(res.body.data).toHaveProperty('refreshToken');
      expect(res.body.data. user).not.toHaveProperty('password');
    });

    it('deve falhar com email duplicado', async () => {
      // Criar primeiro usuário
      await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'User 1',
          email: 'duplicate@example.com',
          password: 'senha123',
        });

      // Tentar criar segundo usuário com mesmo email
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'User 2',
          email:  'duplicate@example.com',
          password: 'senha456',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body. error).toContain('já cadastrado');
    });

    it('deve falhar com dados inválidos', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: '',
          email: 'invalid-email',
          password: '123',
        });

      expect(res.status).toBe(400);
      expect(res.body. success).toBe(false);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    beforeEach(async () => {
      // Criar usuário de teste
      await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Login Test',
          email: 'login@example.com',
          password: 'senha123',
        });
    });

    it('deve fazer login com credenciais corretas', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'login@example.com',
          password: 'senha123',
        });

      expect(res.status).toBe(200);
      expect(res.body. success).toBe(true);
      expect(res.body.data).toHaveProperty('accessToken');
      expect(res.body. data).toHaveProperty('refreshToken');
      expect(res.body.data. user. email).toBe('login@example. com');
    });

    it('deve falhar com email inexistente', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'naoexiste@example.com',
          password: 'senha123',
        });

      expect(res.status).toBe(401);
      expect(res.body. success).toBe(false);
      expect(res.body.error).toContain('incorretos');
    });

    it('deve falhar com senha incorreta', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'login@example.com',
          password: 'senhaerrada',
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('incorretos');
    });
  });
});