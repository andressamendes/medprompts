import request from 'supertest';
import app from '../app';

describe('Prompts Endpoints', () => {
  let accessToken: string;
  let userId: string;

  beforeEach(async () => {
    // Criar usuário e fazer login
    const registerRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Prompt Test',
        email: 'prompt@example.com',
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
      expect(res.body.success).toBe(true);
      expect(res.body.prompt).toHaveProperty('id');
      expect(res.body. prompt. title).toBe('Anamnese Completa');
      expect(res.body.prompt.userId).toBe(userId);
      expect(res.body.prompt. isFavorite).toBe(false);
      expect(res.body.prompt. timesUsed).toBe(0);
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

    it('deve falhar com dados inválidos', async () => {
      const res = await request(app)
        .post('/api/v1/prompts')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: 'AB', // Muito curto
          content: 'Curto', // Menos de 10 chars
          category: 'Invalida',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/prompts', () => {
    beforeEach(async () => {
      // Criar alguns prompts de teste
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
      expect(res.body. prompts).toHaveLength(2);
    });

    it('deve filtrar prompts por categoria', async () => {
      const res = await request(app)
        .get('/api/v1/prompts? category=Anamnese')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.prompts).toHaveLength(1);
      expect(res.body.prompts[0].category).toBe('Anamnese');
    });

    it('deve buscar prompts por texto', async () => {
      const res = await request(app)
        .get('/api/v1/prompts?search=Prompt 1')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.prompts).toHaveLength(1);
      expect(res.body.prompts[0].title).toContain('Prompt 1');
    });
  });

  describe('POST /api/v1/prompts/:promptId/favorite', () => {
    let promptId: string;

    beforeEach(async () => {
      const res = await request(app)
        .post('/api/v1/prompts')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: 'Favorito Test',
          content: 'Conteúdo do prompt favorito',
          category: 'Anamnese',
        });

      promptId = res. body.prompt.id;
    });

    it('deve favoritar um prompt', async () => {
      const res = await request(app)
        .post(`/api/v1/prompts/${promptId}/favorite`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body. prompt.isFavorite).toBe(true);
    });

    it('deve desfavoritar um prompt favoritado', async () => {
      // Favoritar primeiro
      await request(app)
        .post(`/api/v1/prompts/${promptId}/favorite`)
        .set('Authorization', `Bearer ${accessToken}`);

      // Desfavoritar
      const res = await request(app)
        .post(`/api/v1/prompts/${promptId}/favorite`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.prompt.isFavorite).toBe(false);
    });
  });

  describe('DELETE /api/v1/prompts/: promptId', () => {
    let promptId: string;

    beforeEach(async () => {
      const res = await request(app)
        .post('/api/v1/prompts')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: 'Delete Test',
          content: 'Prompt a ser deletado',
          category: 'Anamnese',
        });

      promptId = res.body.prompt.id;
    });

    it('deve deletar um prompt', async () => {
      const res = await request(app)
        .delete(`/api/v1/prompts/${promptId}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // Verificar que foi deletado
      const getRes = await request(app)
        .get(`/api/v1/prompts/${promptId}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(getRes.status).toBe(404);
    });
  });
});