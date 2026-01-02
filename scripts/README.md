# 🤖 Sistema de Geração Automática de Desafios Semanais

## Como Funciona

1. **GitHub Action** roda toda segunda-feira às 06:00 UTC (03:00 BRT)
2. Chama **Google Gemini API** com prompt especializado
3. Gera novo desafio semanal validado
4. Atualiza `src/data/weekly-challenges-data.ts`
5. Faz commit automático no repositório

## Testar Localmente

```bash
# Configurar API Key (terminal)
export GEMINI_API_KEY="sua-chave-aqui"

# Gerar desafio
npm run generate-challenge
