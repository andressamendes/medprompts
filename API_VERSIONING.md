# Versionamento de API - MedPrompts

## Overview

Este documento descreve a estratégia de versionamento da API do MedPrompts.

## Versão Atual

**v1** - API estável com endpoints de autenticação, prompts e study sessions. 

### Base URL

- **Desenvolvimento**: `http://localhost:3001/api/v1`
- **Produção**:  Configurado via variáveis de ambiente

## Endpoints da v1

### Autenticação
POST /auth/register - Registrar novo usuário POST /auth/login - Fazer login POST /auth/logout - Fazer logout POST /auth/refresh - Renovar token de acesso GET /auth/verify - Verificar token

### Prompts
GET /prompts - Listar todos os prompts GET /prompts/: id - Obter um prompt específico POST /prompts - Criar novo prompt (admin) PUT /prompts/:id - Atualizar prompt (admin) DELETE /prompts/:id - Deletar prompt (admin)

### Study Sessions
GET /study-sessions - Listar sessões do usuário GET /study-sessions/:id - Obter sessão específica POST /study-sessions - Criar nova sessão PUT /study-sessions/:id - Atualizar sessão DELETE /study-sessions/:id - Deletar sessão

## Autenticação

Todos os endpoints (exceto `/auth/register` e `/auth/login`) requerem token JWT: 
Authorization: Bearer <token>

## Rate Limiting

- **Limite**: 100 requisições por minuto por IP
- **Headers**: `X-RateLimit-Limit`, `X-RateLimit-Remaining`

## Códigos de Status

| Código | Significado |
|--------|------------|
| 200 | OK - Requisição bem-sucedida |
| 201 | Created - Recurso criado |
| 400 | Bad Request - Dados inválidos |
| 401 | Unauthorized - Token ausente ou inválido |
| 403 | Forbidden - Sem permissão |
| 404 | Not Found - Recurso não encontrado |
| 500 | Server Error - Erro interno |

## Tratamento de Erros

As respostas de erro seguem este formato:

```json
{
  "error": "Descrição do erro",
  "code": "ERROR_CODE",
  "details": {}
}