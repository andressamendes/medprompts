// Algoritmo de Cronograma Inteligente - Baseado em Spaced Repetition e Ciência Cognitiva

export interface StudyTopic {
  id: string;
  name: string;
  category: 'anatomia' | 'fisiologia' | 'patologia' | 'farmacologia' | 'clinica' | 'cirurgia' | 'outras';
  difficulty: 1 | 2 | 3 | 4 | 5; // 1 = fácil, 5 = muito difícil
  priority: 1 | 2 | 3; // 1 = alta, 3 = baixa
  estimatedHours: number;
  lastStudied?: Date;
  masteryLevel: 0 | 1 | 2 | 3 | 4; // 0 = não estudado, 4 = dominado
}

export interface StudySession {
  id: string;
  date: Date;
  startTime: string;
  endTime: string;
  duration: number; // em minutos
  topic: StudyTopic;
  type: 'initial' | 'review' | 'active-recall' | 'practice';
  techniques: ('active-recall' | 'spaced-repetition' | 'interleaving' | 'elaboration' | 'dual-coding')[];
  pomodoroSessions: number;
}

export interface WeeklySchedule {
  weekNumber: number;
  startDate: Date;
  endDate: Date;
  sessions: StudySession[];
  totalHours: number;
  topicsCovered: string[];
}

export interface StudentProfile {
  availableHoursPerDay: number;
  studyDaysPerWeek: number[];
  preferredSessionDuration: 25 | 50 | 90; // Pomodoro variants
  breakDuration: 5 | 10 | 15;
  peakProductivityHours: string[]; // ['08:00', '14:00', '20:00']
  weakDays?: number[]; // Dias com menos disponibilidade
}

// Intervalo de repetição espaçada baseado em Ebbinghaus
const SPACED_REPETITION_INTERVALS = {
  0: 1,    // Primeira revisão: 1 dia depois
  1: 3,    // Segunda revisão: 3 dias depois
  2: 7,    // Terceira revisão: 7 dias depois
  3: 14,   // Quarta revisão: 14 dias depois
  4: 30,   // Quinta revisão: 30 dias depois
};

// Peso de dificuldade para ajustar tempo de estudo
const DIFFICULTY_MULTIPLIER = {
  1: 0.7,  // Fácil: menos tempo
  2: 0.85,
  3: 1.0,  // Médio: tempo padrão
  4: 1.3,
  5: 1.6,  // Muito difícil: mais tempo
};

/**
 * Calcula a próxima data de revisão baseada em Spaced Repetition
 */
export function calculateNextReview(topic: StudyTopic): Date {
  const today = new Date();
  const interval = SPACED_REPETITION_INTERVALS[topic.masteryLevel as keyof typeof SPACED_REPETITION_INTERVALS] || 30;
  
  const nextReview = new Date(today);
  nextReview.setDate(nextReview.getDate() + interval);
  
  return nextReview;
}

/**
 * Ajusta tempo de estudo baseado na dificuldade
 */
export function adjustStudyTime(baseTime: number, difficulty: 1 | 2 | 3 | 4 | 5): number {
  return Math.round(baseTime * DIFFICULTY_MULTIPLIER[difficulty]);
}

/**
 * Converte horas em sessões Pomodoro
 */
export function hoursToPomodoros(hours: number, sessionDuration: 25 | 50 | 90): number {
  const minutes = hours * 60;
  return Math.ceil(minutes / sessionDuration);
}

/**
 * Distribui tópicos usando Interleaving (intercalação)
 */
export function interleaveTopics(topics: StudyTopic[]): StudyTopic[] {
  // Agrupa por categoria
  const byCategory = topics.reduce((acc, topic) => {
    if (!acc[topic.category]) acc[topic.category] = [];
    acc[topic.category].push(topic);
    return acc;
  }, {} as Record<string, StudyTopic[]>);

  // Intercala tópicos de categorias diferentes
  const interleaved: StudyTopic[] = [];
  const categories = Object.keys(byCategory);
  const maxLength = Math.max(...Object.values(byCategory).map(arr => arr.length));

  for (let i = 0; i < maxLength; i++) {
    categories.forEach(category => {
      if (byCategory[category][i]) {
        interleaved.push(byCategory[category][i]);
      }
    });
  }

  return interleaved;
}

/**
 * Gera cronograma semanal otimizado
 */
export function generateWeeklySchedule(
  topics: StudyTopic[],
  profile: StudentProfile,
  startDate: Date = new Date()
): WeeklySchedule {
  const sessions: StudySession[] = [];
  const sessionId = () => `session-${Date.now()}-${Math.random()}`;

  // Ordena tópicos por prioridade e dificuldade
  const sortedTopics = [...topics].sort((a, b) => {
    if (a.priority !== b.priority) return a.priority - b.priority;
    return b.difficulty - a.difficulty;
  });

  // Intercala tópicos para evitar fadiga cognitiva
  const interleavedTopics = interleaveTopics(sortedTopics);

  const currentDate = new Date(startDate);
  let topicIndex = 0;

  // Itera pelos dias da semana
  for (let day = 0; day < 7; day++) {
    const dayOfWeek = currentDate.getDay();

    // Pula dias que o usuário não estuda
    if (!profile.studyDaysPerWeek.includes(dayOfWeek)) {
      currentDate.setDate(currentDate.getDate() + 1);
      continue;
    }

    // Calcula horas disponíveis neste dia
    const isWeakDay = profile.weakDays?.includes(dayOfWeek);
    const availableHours = isWeakDay 
      ? profile.availableHoursPerDay * 0.5 
      : profile.availableHoursPerDay;

    let hoursUsed = 0;
    let sessionCount = 0;

    // Preenche o dia com sessões de estudo
    while (hoursUsed < availableHours && topicIndex < interleavedTopics.length) {
      const topic = interleavedTopics[topicIndex];
      const adjustedTime = adjustStudyTime(
        topic.estimatedHours,
        topic.difficulty
      );

      // Limita sessão para não exceder tempo disponível
      const sessionDuration = Math.min(
        adjustedTime * 60,
        (availableHours - hoursUsed) * 60,
        profile.preferredSessionDuration * 3 // Máximo 3 Pomodoros seguidos
      );

      if (sessionDuration < profile.preferredSessionDuration) {
        break; // Não vale a pena sessão muito curta
      }

      // Define horário da sessão
      const timeSlot = profile.peakProductivityHours[sessionCount % profile.peakProductivityHours.length];
      const [startHour, startMinute] = timeSlot.split(':').map(Number);
      
      const startTime = `${String(startHour).padStart(2, '0')}:${String(startMinute).padStart(2, '0')}`;
      const endHour = startHour + Math.floor(sessionDuration / 60);
      const endMinute = startMinute + (sessionDuration % 60);
      const endTime = `${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`;

      // Define tipo de sessão baseado no nível de domínio
      let sessionType: StudySession['type'];
      let techniques: StudySession['techniques'];

      if (topic.masteryLevel === 0) {
        sessionType = 'initial';
        techniques = ['dual-coding', 'elaboration'];
      } else if (topic.masteryLevel < 3) {
        sessionType = 'review';
        techniques = ['spaced-repetition', 'active-recall'];
      } else {
        sessionType = 'active-recall';
        techniques = ['active-recall', 'interleaving'];
      }

      sessions.push({
        id: sessionId(),
        date: new Date(currentDate),
        startTime,
        endTime,
        duration: sessionDuration,
        topic,
        type: sessionType,
        techniques,
        pomodoroSessions: hoursToPomodoros(sessionDuration / 60, profile.preferredSessionDuration),
      });

      hoursUsed += sessionDuration / 60;
      sessionCount++;
      topicIndex++;
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  const endDate = new Date(currentDate);
  endDate.setDate(endDate.getDate() - 1);

  return {
    weekNumber: getWeekNumber(startDate),
    startDate,
    endDate,
    sessions,
    totalHours: sessions.reduce((sum, s) => sum + s.duration / 60, 0),
    topicsCovered: [...new Set(sessions.map(s => s.topic.name))],
  };
}

/**
 * Obtém número da semana do ano
 */
function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

/**
 * Gera cronograma mensal (4 semanas)
 */
export function generateMonthlySchedule(
  topics: StudyTopic[],
  profile: StudentProfile,
  startDate: Date = new Date()
): WeeklySchedule[] {
  const schedules: WeeklySchedule[] = [];
  let currentDate = new Date(startDate);

  for (let week = 0; week < 4; week++) {
    const weekSchedule = generateWeeklySchedule(topics, profile, currentDate);
    schedules.push(weekSchedule);
    
    // Próxima semana
    currentDate = new Date(weekSchedule.endDate);
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return schedules;
}

/**
 * Exporta cronograma para formato iCal (calendário)
 */
export function exportToICal(schedule: WeeklySchedule): string {
  let ical = 'BEGIN:VCALENDAR\n';
  ical += 'VERSION:2.0\n';
  ical += 'PRODID:-//MedPrompts//Study Schedule//EN\n';
  ical += 'CALSCALE:GREGORIAN\n';
  ical += 'METHOD:PUBLISH\n';

  schedule.sessions.forEach(session => {
    const dateStr = session.date.toISOString().split('T')[0].replace(/-/g, '');
    const startTimeStr = session.startTime.replace(':', '') + '00';
    const endTimeStr = session.endTime.replace(':', '') + '00';

    ical += 'BEGIN:VEVENT\n';
    ical += `UID:${session.id}@medprompts.com\n`;
    ical += `DTSTAMP:${dateStr}T${startTimeStr}Z\n`;
    ical += `DTSTART:${dateStr}T${startTimeStr}Z\n`;
    ical += `DTEND:${dateStr}T${endTimeStr}Z\n`;
    ical += `SUMMARY:${session.topic.name} - ${session.type}\n`;
    ical += `DESCRIPTION:Técnicas: ${session.techniques.join(', ')}\\nPomodoros: ${session.pomodoroSessions}\n`;
    ical += `LOCATION:Estudo\n`;
    ical += 'END:VEVENT\n';
  });

  ical += 'END:VCALENDAR';
  return ical;
}
