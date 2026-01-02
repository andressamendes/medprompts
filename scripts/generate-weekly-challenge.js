import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Para usar __dirname em ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuração da API do Gemini
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';

// Template do prompt para o Gemini
const PROMPT_TEMPLATE = `Você é um especialista em educação médica e gamificação. 

Crie um DESAFIO SEMANAL para estudantes de medicina com as seguintes especificações:

FORMATO OBRIGATÓRIO (JSON):
{
  "weekNumber": [número sequencial, começando em 5],
  "title": "[Título curto e motivador]",
  "description": "[Descrição clara do desafio em 1-2 frases]",
  "startDate": "[Data de início no formato ISO: YYYY-MM-DD]",
  "endDate": "[Data de término no formato ISO: YYYY-MM-DD]",
  "tasks": [
    {
      "id": "weekly_1_task_1",
      "title": "[Título da tarefa 1]",
      "description": "[Descrição clara]",
      "type": "prompt",
      "target": 5,
      "xpReward": 50
    },
    {
      "id": "weekly_1_task_2",
      "title": "[Título da tarefa 2]",
      "description": "[Descrição clara]",
      "type": "clinical-case",
      "target": 2,
      "xpReward": 60
    },
    {
      "id": "weekly_1_task_3",
      "title": "[Título da tarefa 3]",
      "description": "[Descrição clara]",
      "type": "mnemonic",
      "target": 3,
      "xpReward": 40
    }
  ],
  "totalXP": 150,
  "badgeReward": {
    "id": "weekly_challenge_1",
    "name": "[Nome do badge único]",
    "icon": "🏆"
  }
}

REGRAS:
1. Sempre 3 tarefas: prompt, clinical-case e mnemonic
2. XP total = soma dos xpReward (entre 150-200 XP)
3. Tema: relacionado à medicina do 2º ano (anatomia, fisiologia, patologia básica)
4. Targets realistas: prompts (5-10), casos clínicos (2-3), mnemônicos (3-5)
5. Data de início: próxima segunda-feira
6. Data de término: domingo seguinte (7 dias)
7. Badge único com nome criativo relacionado ao tema
8. IDs únicos incrementais

IMPORTANTE: Responda APENAS com o JSON válido, sem markdown, sem explicações.

Data de hoje: ${new Date().toISOString().split('T')[0]}
`;

// Função para chamar a API do Gemini
async function generateChallengeWithGemini() {
  try {
    console.log('🤖 Chamando Google Gemini API...');
    
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: PROMPT_TEMPLATE
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    const generatedText = data.candidates[0].content.parts[0].text;
    
    console.log('✅ Resposta recebida do Gemini');
    
    // Limpar markdown se houver
    const jsonText = generatedText
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();
    
    const challengeData = JSON.parse(jsonText);
    
    console.log('✅ JSON validado:', challengeData.title);
    
    return challengeData;
    
  } catch (error) {
    console.error('❌ Erro ao gerar desafio:', error.message);
    throw error;
  }
}

// Função para ler o arquivo atual
function readCurrentChallenges() {
  const filePath = path.join(__dirname, '../src/data/weekly-challenges-data.ts');
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Extrair o array de challenges
  const match = content.match(/export const WEEKLY_CHALLENGES: WeeklyChallenge\[\] = (\[[\s\S]*?\]);/);
  
  if (match) {
    // Remover as últimas linhas (apenas o array)
    const jsonStr = match[1]
      .replace(/'/g, '"')
      .replace(/(\w+):/g, '"$1":');
    
    try {
      return JSON.parse(jsonStr);
    } catch (e) {
      console.warn('⚠️ Não foi possível parsear challenges existentes');
      return [];
    }
  }
  
  return [];
}

// Função para calcular próxima segunda-feira
function getNextMonday() {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const daysUntilMonday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek;
  
  const nextMonday = new Date(today);
  nextMonday.setDate(today.getDate() + daysUntilMonday);
  nextMonday.setHours(0, 0, 0, 0);
  
  return nextMonday;
}

// Função para calcular domingo seguinte
function getFollowingSunday(monday) {
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  
  return sunday;
}

// Função para atualizar o arquivo
function updateChallengesFile(newChallenge) {
  const filePath = path.join(__dirname, '../src/data/weekly-challenges-data.ts');
  
  // Ler desafios existentes
  const existingChallenges = readCurrentChallenges();
  
  // Adicionar novo desafio
  existingChallenges.push(newChallenge);
  
  // Manter apenas os últimos 4 desafios
  const recentChallenges = existingChallenges.slice(-4);
  
  // Gerar conteúdo do arquivo
  const fileContent = `// Desafios Semanais Gerados Automaticamente pela IA
// Última atualização: ${new Date().toISOString()}

export interface WeeklyTask {
  id: string;
  title: string;
  description: string;
  type: 'prompt' | 'clinical-case' | 'mnemonic' | 'pomodoro';
  target: number;
  current: number;
  xpReward: number;
}

export interface WeeklyChallenge {
  weekNumber: number;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  tasks: Omit<WeeklyTask, 'current'>[];
  totalXP: number;
  badgeReward: {
    id: string;
    name: string;
    icon: string;
  };
}

export const WEEKLY_CHALLENGES: WeeklyChallenge[] = ${JSON.stringify(recentChallenges, null, 2)};

// Função auxiliar para pegar o desafio atual
export function getCurrentWeeklyChallenge(): WeeklyChallenge | null {
  const now = new Date();
  
  for (const challenge of WEEKLY_CHALLENGES) {
    const start = new Date(challenge.startDate);
    const end = new Date(challenge.endDate);
    
    if (now >= start && now <= end) {
      return challenge;
    }
  }
  
  return null;
}
`;

  fs.writeFileSync(filePath, fileContent, 'utf8');
  console.log('✅ Arquivo atualizado:', filePath);
}

// Função principal
async function main() {
  try {
    console.log('🚀 Iniciando geração de desafio semanal...');
    
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY não configurada!');
    }
    
    // Gerar desafio com IA
    let challenge = await generateChallengeWithGemini();
    
    // Ajustar datas automaticamente
    const nextMonday = getNextMonday();
    const followingSunday = getFollowingSunday(nextMonday);
    
    challenge.startDate = nextMonday.toISOString().split('T')[0];
    challenge.endDate = followingSunday.toISOString().split('T')[0];
    
    // Obter número da semana atual
    const existingChallenges = readCurrentChallenges();
    const lastWeekNumber = existingChallenges.length > 0 
      ? Math.max(...existingChallenges.map(c => c.weekNumber))
      : 4;
    
    challenge.weekNumber = lastWeekNumber + 1;
    
    // Atualizar IDs das tarefas
    challenge.tasks = challenge.tasks.map((task, idx) => ({
      ...task,
      id: `weekly_${challenge.weekNumber}_task_${idx + 1}`
    }));
    
    challenge.badgeReward.id = `weekly_challenge_${challenge.weekNumber}`;
    
    console.log(`✅ Desafio Semana #${challenge.weekNumber}: ${challenge.title}`);
    console.log(`📅 ${challenge.startDate} até ${challenge.endDate}`);
    
    // Atualizar arquivo
    updateChallengesFile(challenge);
    
    console.log('🎉 Desafio semanal gerado com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
  }
}

// Executar
main();
