import request from 'supertest';
import { sequelize } from '../config/database';
import app from '../app';

describe('Testes de Integração - Autenticação', () => {
  // Conectar ao banco antes de todos os testes
  beforeAll(async () => {
    await sequelize.authenticate();
    await sequelize.sync({ force: true }); // Recria as tabelas
  });

  // Limpar dados após cada teste
  afterEach(async () => {
    await sequelize.query('DELETE FROM users');
  });

  // Fechar conexão após todos os testes
  afterAll(async () => {
    await sequelize.close();
  });

  describe('POST /api/v1/auth/register', () => {
    it('deve registrar um novo usuário com sucesso', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'João Silva',
          email: 'joao.silva@medicina.com',
          password: 'Senha@123',
          university: 'UFMG',
          graduationYear: 2030, // Ajustado para ano futuro válido
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('success', true);
      // Ajustado para estrutura real da API
      expect(response.body.data).toHaveProperty('accessToken');
      expect(response.body.data).toHaveProperty('refreshToken');
      expect(response.body.data.user).toHaveProperty('id');
      expect(response.body.data.user).toHaveProperty('email', 'joao.silva@medicina.com');
      expect(response.body.data.user).not.toHaveProperty('password'); // Senha não deve ser retornada
    });

    it('deve rejeitar registro com email duplicado', async () => {
      // Criar primeiro usuário
      await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'João Silva',
          email: 'joao.silva@medicina.com',
          password: 'Senha@123',
        });

      // Tentar criar usuário com mesmo email
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Maria Silva',
          email: 'joao.silva@medicina.com',
          password: 'Senha@456',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });

    it('deve rejeitar registro com dados inválidos', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: '',
          email: 'email-invalido',
          password: '123', // senha muito curta
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    beforeEach(async () => {
      // Criar usuário para testes de login
      await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'João Silva',
          email: 'joao.silva@medicina.com',
          password: 'Senha@123',
        });
    });

    it('deve fazer login com credenciais corretas', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'joao.silva@medicina.com',
          password: 'Senha@123',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      // Ajustado para estrutura real da API
      expect(response.body.data).toHaveProperty('accessToken');
      expect(response.body.data).toHaveProperty('refreshToken');
      expect(response.body.data.user).toHaveProperty('email', 'joao.silva@medicina.com');
    });

    it('deve rejeitar login com email inexistente', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'inexistente@medicina.com',
          password: 'Senha@123',
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('success', false);
    });

    it('deve rejeitar login com senha incorreta', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'joao.silva@medicina.com',
          password: 'SenhaErrada@123',
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('POST /api/v1/auth/refresh', () => {
    let refreshToken: string;

    beforeEach(async () => {
      // Registrar e pegar refresh token
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'João Silva',
          email: 'joao.silva@medicina.com',
          password: 'Senha@123',
        });

      refreshToken = response.body.data.refreshToken;
    });

    it('deve gerar novo access token com refresh token válido', async () => {
      const response = await request(app)
        .post('/api/v1/auth/refresh')
        .send({
          refreshToken,
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      // Ajustado para estrutura real da API
      expect(response.body.data).toHaveProperty('accessToken');
    });

    it('deve rejeitar refresh token inválido', async () => {
      const response = await request(app)
        .post('/api/v1/auth/refresh')
        .send({
          refreshToken: 'token-invalido-fake-12345',
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('success', false);
    });
  });
});
