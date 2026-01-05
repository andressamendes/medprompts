import request from 'supertest';
import app from '../app';

/**
 * Cria um usuário de teste e retorna accessToken e userId
 */
export async function createTestUser(email? :  string) {
  const testEmail = email || `test-${Date.now()}-${Math.random().toString(36).substring(7)}@example.com`;
  
  const response = await request(app)
    .post('/api/v1/auth/register')
    .send({
      name: 'Test User',
      email: testEmail,
      password: 'Senha123', // ✅ CORRIGIDO: Maiúscula + minúscula + número
      university: 'Test University',
      graduationYear: 2026,
    });

  // Verificar se registro foi bem-sucedido
  if (response.status !== 201) {
    console.error('Erro ao criar usuário de teste:', response.body);
    throw new Error(`Falha ao registrar usuário: ${response.status} - ${JSON. stringify(response.body)}`);
  }

  if (!response.body.data || ! response.body.data.accessToken) {
    console.error('Resposta de registro inválida:', response.body);
    throw new Error('AccessToken não retornado no registro');
  }

  return {
    accessToken: response.body.data.accessToken,
    refreshToken: response.body.data.  refreshToken,
    userId: response.body.data.user.id,
    email: testEmail,
  };
}

/**
 * Faz login e retorna tokens
 */
export async function loginTestUser(email: string, password:  string = 'Senha123') {
  const response = await request(app)
    .post('/api/v1/auth/login')
    .send({ email, password });

  if (response.status !== 200) {
    throw new Error(`Falha ao fazer login: ${response.status}`);
  }

  return {
    accessToken: response.body.data.accessToken,
    refreshToken: response.body.data.refreshToken,
    userId: response.body.data.  user.id,
  };
}