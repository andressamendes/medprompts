import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Download, Sparkles, Brain, TrendingUp, CheckCircle2, AlertCircle } from 'lucide-react';
import { 
  StudyTopic, 
  StudentProfile, 
  WeeklySchedule,
  generateWeeklySchedule,
  generateMonthlySchedule,
  exportToICal
} from '@/utils/scheduleAlgorithm';
import { logger } from '@/utils/logger';

const DAYS_OF_WEEK = [
  { value: 0, label: 'Domingo' },
  { value: 1, label: 'Segunda' },
  { value: 2, label: 'Terça' },
  { value: 3, label: 'Quarta' },
  { value: 4, label: 'Quinta' },
  { value: 5, label: 'Sexta' },
  { value: 6, label: 'Sábado' },
];

const SAMPLE_TOPICS: StudyTopic[] = [
  { id: '1', name: 'Anatomia Cardíaca', category: 'anatomia', difficulty: 3, priority: 1, estimatedHours: 4, masteryLevel: 0 },
  { id: '2', name: 'Fisiologia Renal', category: 'fisiologia', difficulty: 4, priority: 1, estimatedHours: 5, masteryLevel: 0 },
  { id: '3', name: 'Farmacologia Cardiovascular', category: 'farmacologia', difficulty: 5, priority: 1, estimatedHours: 6, masteryLevel: 0 },
  { id: '4', name: 'Semiologia Abdominal', category: 'clinica', difficulty: 3, priority: 2, estimatedHours: 3, masteryLevel: 1 },
  { id: '5', name: 'Patologia Pulmonar', category: 'patologia', difficulty: 4, priority: 1, estimatedHours: 4, masteryLevel: 0 },
  { id: '6', name: 'Técnica Cirúrgica Básica', category: 'cirurgia', difficulty: 5, priority: 2, estimatedHours: 5, masteryLevel: 0 },
];

export function StudyScheduleGenerator() {
  const [step, setStep] = useState<'profile' | 'topics' | 'schedule'>('profile');
  const [profile, setProfile] = useState<StudentProfile>({
    availableHoursPerDay: 6,
    studyDaysPerWeek: [1, 2, 3, 4, 5],
    preferredSessionDuration: 50,
    breakDuration: 10,
    peakProductivityHours: ['08:00', '14:00', '19:00'],
    weakDays: [6],
  });
  const [selectedTopics, setSelectedTopics] = useState<StudyTopic[]>([]);
  const [generatedSchedule, setGeneratedSchedule] = useState<WeeklySchedule | null>(null);
  const [scheduleType, setScheduleType] = useState<'weekly' | 'monthly'>('weekly');

  const handleProfileSubmit = () => {
    logger.info('Perfil de estudo configurado', {
      component: 'StudyScheduleGenerator',
      action: 'profile_configured',
      profile: {
        hoursPerDay: profile.availableHoursPerDay,
        studyDays: profile.studyDaysPerWeek.length,
        sessionDuration: profile.preferredSessionDuration,
      },
    });
    setStep('topics');
  };

  const handleTopicToggle = (topic: StudyTopic) => {
    setSelectedTopics(prev => {
      const exists = prev.find(t => t.id === topic.id);
      if (exists) {
        return prev.filter(t => t.id !== topic.id);
      } else {
        return [...prev, topic];
      }
    });
  };

  const handleGenerateSchedule = () => {
    if (selectedTopics.length === 0) {
      logger.warn('Tentativa de gerar cronograma sem tópicos', {
        component: 'StudyScheduleGenerator',
        action: 'generate_schedule_failed',
        reason: 'no_topics_selected',
      });
      return;
    }

    logger.info('Gerando cronograma inteligente', {
      component: 'StudyScheduleGenerator',
      action: 'generate_schedule',
      topicsCount: selectedTopics.length,
      scheduleType,
      profile: {
        hoursPerDay: profile.availableHoursPerDay,
        studyDays: profile.studyDaysPerWeek.length,
      },
    });

    const schedule = generateWeeklySchedule(selectedTopics, profile);
    setGeneratedSchedule(schedule);
    setStep('schedule');

    logger.info('Cronograma gerado com sucesso', {
      component: 'StudyScheduleGenerator',
      action: 'schedule_generated',
      totalSessions: schedule.sessions.length,
      totalHours: schedule.totalHours,
      topicsCovered: schedule.topicsCovered.length,
    });
  };

  const handleExportICal = () => {
    if (!generatedSchedule) return;

    const icalContent = exportToICal(generatedSchedule);
    const blob = new Blob([icalContent], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cronograma-estudos-semana-${generatedSchedule.weekNumber}.ics`;
    a.click();
    URL.revokeObjectURL(url);

    logger.info('Cronograma exportado para iCal', {
      component: 'StudyScheduleGenerator',
      action: 'export_ical',
      weekNumber: generatedSchedule.weekNumber,
      sessionsCount: generatedSchedule.sessions.length,
    });
  };

  const renderProfile = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="hours">Horas disponíveis por dia</Label>
        <Input
          id="hours"
          type="number"
          min="1"
          max="16"
          value={profile.availableHoursPerDay}
          onChange={(e) => setProfile({ ...profile, availableHoursPerDay: Number(e.target.value) })}
        />
        <p className="text-xs text-muted-foreground">Recomendado: 4-8 horas para evitar fadiga cognitiva</p>
      </div>

      <div className="space-y-2">
        <Label>Dias de estudo</Label>
        <div className="grid grid-cols-2 gap-2">
          {DAYS_OF_WEEK.map((day) => (
            <div key={day.value} className="flex items-center space-x-2">
              <Checkbox
                id={`day-${day.value}`}
                checked={profile.studyDaysPerWeek.includes(day.value)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setProfile({ ...profile, studyDaysPerWeek: [...profile.studyDaysPerWeek, day.value] });
                  } else {
                    setProfile({ ...profile, studyDaysPerWeek: profile.studyDaysPerWeek.filter(d => d !== day.value) });
                  }
                }}
              />
              <label htmlFor={`day-${day.value}`} className="text-sm cursor-pointer">
                {day.label}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="session-duration">Duração da sessão (Pomodoro)</Label>
        <Select
          value={String(profile.preferredSessionDuration)}
          onValueChange={(value) => setProfile({ ...profile, preferredSessionDuration: Number(value) as 25 | 50 | 90 })}
        >
          <SelectTrigger id="session-duration">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="25">25 min (Clássico)</SelectItem>
            <SelectItem value="50">50 min (Estendido)</SelectItem>
            <SelectItem value="90">90 min (Deep Work)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button onClick={handleProfileSubmit} className="w-full">
        Continuar para Tópicos
      </Button>
    </div>
  );

  const renderTopics = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Selecione os tópicos que deseja estudar. O algoritmo aplicará:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-purple-500" />
            <span>Spaced Repetition</span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-500" />
            <span>Active Recall</span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-yellow-500" />
            <span>Interleaving</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            <span>Elaboration</span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {SAMPLE_TOPICS.map((topic) => (
          <div
            key={topic.id}
            className={`p-4 border rounded-lg cursor-pointer transition-all ${
              selectedTopics.find(t => t.id === topic.id)
                ? 'border-primary bg-primary/5'
                : 'hover:border-muted-foreground/50'
            }`}
            onClick={() => handleTopicToggle(topic)}
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <h4 className="font-medium">{topic.name}</h4>
                <div className="flex gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {topic.category}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    Dificuldade: {topic.difficulty}/5
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    ~{topic.estimatedHours}h
                  </Badge>
                </div>
              </div>
              <Checkbox checked={!!selectedTopics.find(t => t.id === topic.id)} />
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <Button variant="outline" onClick={() => setStep('profile')} className="flex-1">
          Voltar
        </Button>
        <Button onClick={handleGenerateSchedule} disabled={selectedTopics.length === 0} className="flex-1">
          Gerar Cronograma ({selectedTopics.length} tópicos)
        </Button>
      </div>
    </div>
  );

  const renderSchedule = () => {
    if (!generatedSchedule) return null;

    return (
      <div className="space-y-6">
        <div className="bg-primary/10 p-4 rounded-lg">
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Cronograma Otimizado
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Total de Sessões</p>
              <p className="font-bold text-lg">{generatedSchedule.sessions.length}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Horas de Estudo</p>
              <p className="font-bold text-lg">{generatedSchedule.totalHours.toFixed(1)}h</p>
            </div>
            <div>
              <p className="text-muted-foreground">Tópicos Cobertos</p>
              <p className="font-bold text-lg">{generatedSchedule.topicsCovered.length}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Semana</p>
              <p className="font-bold text-lg">#{generatedSchedule.weekNumber}</p>
            </div>
          </div>
        </div>

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {generatedSchedule.sessions.map((session) => (
            <div key={session.id} className="border rounded-lg p-4 hover:bg-accent/50 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h4 className="font-medium">{session.topic.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {session.date.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'short' })}
                  </p>
                </div>
                <Badge variant={session.type === 'initial' ? 'default' : 'secondary'}>
                  {session.type === 'initial' ? 'Novo' : session.type === 'review' ? 'Revisão' : 'Prática'}
                </Badge>
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {session.startTime} - {session.endTime}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {session.pomodoroSessions} Pomodoros
                </div>
              </div>

              <div className="mt-2 flex gap-1 flex-wrap">
                {session.techniques.map((technique) => (
                  <Badge key={technique} variant="outline" className="text-xs">
                    {technique}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setStep('topics')} className="flex-1">
            Ajustar Tópicos
          </Button>
          <Button onClick={handleExportICal} className="flex-1">
            <Download className="w-4 h-4 mr-2" />
            Exportar para Calendário
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Brain className="w-6 h-6 text-primary" />
          <div>
            <CardTitle>Gerador de Cronograma Inteligente</CardTitle>
            <CardDescription>
              Baseado em Spaced Repetition, Active Recall e Neurociência
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {step === 'profile' && renderProfile()}
        {step === 'topics' && renderTopics()}
        {step === 'schedule' && renderSchedule()}
      </CardContent>

      <CardFooter>
        <div className="w-full flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <AlertCircle className="w-4 h-4" />
          <span>Algoritmo validado cientificamente • Estudos da NCBI e UBC</span>
        </div>
      </CardFooter>
    </Card>
  );
}
