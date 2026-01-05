import { useState, useEffect } from 'react';
import { AuthenticatedNavbar } from '@/components/AuthenticatedNavbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, Calendar, Clock, TrendingUp, Filter, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

/**
 * Interface para Sessão de Estudo
 */
interface StudySession {
  id: string;
  subject: string;
  topic: string;
  duration: number; // em minutos
  notes?:  string;
  date: string;
  xpEarned: number;
}

/**
 * Página Study Sessions - Gerenciamento de sessões de estudo
 * Permite:  Registrar, visualizar, filtrar e excluir sessões
 * Integrada com AuthenticatedNavbar
 */
export default function StudySessions() {
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [filteredSessions, setFilteredSessions] = useState<StudySession[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterPeriod, setFilterPeriod] = useState('all');
  
  const [formData, setFormData] = useState({
    subject: '',
    topic: '',
    duration: '',
    notes: '',
    date: new Date().toISOString().split('T')[0],
  });

  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  const subjects = [
    'Anatomia',
    'Fisiologia',
    'Farmacologia',
    'Patologia',
    'Clínica Médica',
    'Cirurgia',
    'Pediatria',
    'Ginecologia',
    'Psiquiatria',
    'Outro',
  ];

  // 🎭 MOCK: Carrega sessões simuladas
  useEffect(() => {
    const mockSessions:  StudySession[] = [
      {
        id: '1',
        subject: 'Anatomia',
        topic: 'Sistema Cardiovascular',
        duration:  120,
        notes: 'Revisão completa de anatomia cardíaca',
        date: new Date().toISOString(),
        xpEarned:  60,
      },
      {
        id: '2',
        subject: 'Farmacologia',
        topic: 'Anti-hipertensivos',
        duration: 90,
        notes: 'Mecanismos de ação dos principais grupos',
        date: new Date(Date.now() - 86400000).toISOString(),
        xpEarned: 45,
      },
      {
        id: '3',
        subject: 'Fisiologia',
        topic: 'Sistema Renal',
        duration: 60,
        notes: 'Filtração glomerular e reabsorção tubular',
        date: new Date(Date.now() - 172800000).toISOString(),
        xpEarned:  30,
      },
      {
        id: '4',
        subject: 'Clínica Médica',
        topic: 'Insuficiência Cardíaca',
        duration: 150,
        date: new Date(Date.now() - 259200000).toISOString(),
        xpEarned: 75,
      },
    ];
    setSessions(mockSessions);
    setFilteredSessions(mockSessions);
  }, []);

  // Filtrar sessões por período
  useEffect(() => {
    let filtered = sessions;

    if (filterPeriod === 'today') {
      const today = new Date().toDateString();
      filtered = sessions. filter(s => new Date(s.date).toDateString() === today);
    } else if (filterPeriod === 'week') {
      const weekAgo = Date.now() - 7 * 86400000;
      filtered = sessions.filter(s => new Date(s.date).getTime() > weekAgo);
    } else if (filterPeriod === 'month') {
      const monthAgo = Date.now() - 30 * 86400000;
      filtered = sessions.filter(s => new Date(s.date).getTime() > monthAgo);
    }

    setFilteredSessions(filtered);
  }, [sessions, filterPeriod]);

  // Validar formulário
  const validateForm = (): boolean => {
    const errors: { [key:  string]: string } = {};

    if (!formData.subject) errors.subject = 'Matéria é obrigatória';
    if (!formData.topic) errors.topic = 'Tópico é obrigatório';
    if (!formData.duration || parseInt(formData.duration) <= 0) {
      errors.duration = 'Duração deve ser maior que 0';
    }
    if (!formData. date) errors.date = 'Data é obrigatória';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Abrir modal para criar
  const handleCreate = () => {
    setFormData({
      subject: '',
      topic: '',
      duration:  '',
      notes: '',
      date: new Date().toISOString().split('T')[0],
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  // Salvar sessão
  const handleSave = () => {
    if (! validateForm()) return;

    const duration = parseInt(formData.duration);
    const xpEarned = Math.floor(duration / 2); // 0.5 XP por minuto

    const newSession: StudySession = {
      id:  Date.now().toString(),
      subject: formData.subject,
      topic: formData.topic,
      duration,
      notes: formData.notes,
      date: new Date(formData.date).toISOString(),
      xpEarned,
    };

    setSessions([newSession, ...sessions]);
    setIsModalOpen(false);
  };

  // Excluir sessão
  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta sessão?')) {
      setSessions(sessions. filter(s => s.id !== id));
    }
  };

  // Calcular estatísticas
  const totalMinutes = filteredSessions.reduce((acc, s) => acc + s.duration, 0);
  const totalXP = filteredSessions.reduce((acc, s) => acc + s.xpEarned, 0);
  const totalHours = Math.floor(totalMinutes / 60);
  const remainingMinutes = totalMinutes % 60;

  // Formatar data
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month:  '2-digit', year: 'numeric' });
  };

  // Formatar duração
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}min`;
    }
    return `${mins}min`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      {/* Navbar Autenticada */}
      <AuthenticatedNavbar />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold tracking-tight">Sessões de Estudo</h1>
              <p className="text-muted-foreground">
                {filteredSessions.length} {filteredSessions.length === 1 ? 'sessão' : 'sessões'}
              </p>
            </div>
            <Button onClick={handleCreate} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Nova Sessão
            </Button>
          </div>

          {/* Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Tempo Total</CardDescription>
                <CardTitle className="text-3xl">
                  {totalHours > 0 ? `${totalHours}h ${remainingMinutes}min` : `${remainingMinutes}min`}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {filteredSessions.length} sessões
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription>XP Ganho</CardDescription>
                <CardTitle className="text-3xl">{totalXP}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <TrendingUp className="h-3 w-3" />
                  0.5 XP por minuto
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Média por Sessão</CardDescription>
                <CardTitle className="text-3xl">
                  {filteredSessions.length > 0 
                    ? formatDuration(Math.floor(totalMinutes / filteredSessions.length))
                    :  '0min'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  Últimas sessões
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filtro de Período */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={filterPeriod} onValueChange={setFilterPeriod}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="today">Hoje</SelectItem>
                <SelectItem value="week">Última semana</SelectItem>
                <SelectItem value="month">Último mês</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Lista de Sessões */}
          {filteredSessions.length > 0 ? (
            <div className="space-y-4">
              {filteredSessions.map((session) => (
                <Card key={session.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <CardTitle className="text-lg">{session.subject}</CardTitle>
                          <Badge variant="secondary">{session.topic}</Badge>
                        </div>
                        <CardDescription>
                          {session.notes || 'Sem anotações'}
                        </CardDescription>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(session.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(session. date)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDuration(session.duration)}
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        +{session.xpEarned} XP
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-muted-foreground mb-4">
                  Nenhuma sessão encontrada
                </p>
                <Button onClick={handleCreate}>
                  <Plus className="h-4 w-4 mr-2" />
                  Registrar primeira sessão
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      {/* Modal de Criar Sessão */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nova Sessão de Estudo</DialogTitle>
            <DialogDescription>
              Registre uma nova sessão de estudo e ganhe XP
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Matéria */}
            <div className="space-y-2">
              <Label htmlFor="subject">Matéria *</Label>
              <Select
                value={formData.subject}
                onValueChange={(v) => setFormData({ ...formData, subject: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a matéria" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map(subject => (
                    <SelectItem key={subject} value={subject}>
                      {subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formErrors.subject && (
                <p className="text-xs text-red-500">{formErrors.subject}</p>
              )}
            </div>

            {/* Tópico */}
            <div className="space-y-2">
              <Label htmlFor="topic">Tópico *</Label>
              <Input
                id="topic"
                value={formData.topic}
                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                placeholder="Ex: Sistema Cardiovascular"
              />
              {formErrors.topic && (
                <p className="text-xs text-red-500">{formErrors.topic}</p>
              )}
            </div>

            {/* Duração e Data */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duration">Duração (minutos) *</Label>
                <Input
                  id="duration"
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ... formData, duration: e.target.value })}
                  placeholder="60"
                  min="1"
                />
                {formErrors.duration && (
                  <p className="text-xs text-red-500">{formErrors.duration}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Data *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
                {formErrors.date && (
                  <p className="text-xs text-red-500">{formErrors.date}</p>
                )}
              </div>
            </div>

            {/* Anotações */}
            <div className="space-y-2">
              <Label htmlFor="notes">Anotações (opcional)</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target. value })}
                placeholder="O que você estudou nesta sessão?"
                rows={3}
              />
            </div>

            {/* Prévia de XP */}
            {formData.duration && parseInt(formData.duration) > 0 && (
              <div className="bg-secondary/30 p-3 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Você ganhará <span className="font-semibold text-primary">
                    {Math.floor(parseInt(formData.duration) / 2)} XP
                  </span> ao registrar esta sessão
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              Registrar Sessão
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer className="border-t mt-16">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              MedPrompts © 2026 • Desenvolvido para estudantes de Medicina
            </p>
            <p className="text-xs text-muted-foreground">
              Desenvolvido por <span className="font-semibold">Andressa Mendes</span> • Estudante de Medicina
            </p>
            <p className="text-xs text-muted-foreground">
              Afya - Guanambi/BA
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}