import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Plus, Trash2, ArrowLeft, Sparkles, Loader2, LogIn, LogOut, RefreshCw } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import calendarService, { CalendarEvent } from '@/services/api/calendar';

export default function StudySchedule() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const [formData, setFormData] = useState({
    summary: '',
    description: '',
    date: '',
    startTime: '',
    duration: '60',
    enableSpacedRepetition: false,
  });

  useEffect(() => {
    initializeGoogleApi();
  }, []);

  const initializeGoogleApi = async () => {
    try {
      const script1 = document.createElement('script');
      script1.src = 'https://apis.google.com/js/api.js';
      script1.async = true;
      script1.defer = true;
      document.body.appendChild(script1);

      const script2 = document.createElement('script');
      script2.src = 'https://accounts.google.com/gsi/client';
      script2.async = true;
      script2.defer = true;
      document.body.appendChild(script2);

      script1.onload = async () => {
        await calendarService.initGoogleApi();
      };

      script2.onload = () => {
        calendarService.initGoogleIdentity(() => {
          setIsAuthenticated(true);
          loadEvents();
        });
      };
    } catch (error) {
      console.error('Erro ao inicializar Google API:', error);
    }
  };

  const handleLogin = async () => {
    try {
      await calendarService.login();
      setIsAuthenticated(true);
      toast({ title: 'Login realizado', description: 'Conectado ao Google Calendar' });
      loadEvents();
    } catch (error: any) {
      toast({ title: 'Erro ao fazer login', description: error.message || 'Erro desconhecido', variant: 'destructive' });
    }
  };

  const handleLogout = () => {
    calendarService.logout();
    setIsAuthenticated(false);
    setEvents([]);
    toast({ title: 'Logout realizado', description: 'Desconectado do Google Calendar' });
  };

  const loadEvents = async () => {
    setIsLoading(true);
    try {
      const eventsList = await calendarService.listEvents(20);
      setEvents(eventsList);
    } catch (error: any) {
      toast({ title: 'Erro ao carregar eventos', description: error.message || 'Erro desconhecido', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateEvent = async () => {
    if (!formData.summary || !formData.date || !formData.startTime) {
      toast({ title: 'Campos obrigatórios', description: 'Preencha título, data e horário', variant: 'destructive' });
      return;
    }

    setIsCreating(true);
    try {
      const startDateTime = new Date(`${formData.date}T${formData.startTime}`);
      const endDateTime = new Date(startDateTime);
      endDateTime.setMinutes(endDateTime.getMinutes() + parseInt(formData.duration));

      const event: CalendarEvent = {
        summary: formData.summary,
        description: formData.description,
        start: { dateTime: startDateTime.toISOString(), timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone },
        end: { dateTime: endDateTime.toISOString(), timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone },
        reminders: { useDefault: false, overrides: [{ method: 'popup', minutes: 30 }] },
        colorId: '9',
      };

      await calendarService.createEvent(event);

      if (formData.enableSpacedRepetition) {
        await calendarService.createSpacedRepetitionSeries(
          { summary: formData.summary, description: formData.description, reminders: event.reminders },
          startDateTime,
          parseInt(formData.duration)
        );
        toast({ title: 'Evento criado com revisões', description: 'Evento e 5 revisões espaçadas foram agendados' });
      } else {
        toast({ title: 'Evento criado', description: 'Seu evento foi adicionado ao calendário' });
      }

      setIsModalOpen(false);
      setFormData({ summary: '', description: '', date: '', startTime: '', duration: '60', enableSpacedRepetition: false });
      loadEvents();
    } catch (error: any) {
      toast({ title: 'Erro ao criar evento', description: error.message || 'Erro desconhecido', variant: 'destructive' });
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('Tem certeza que deseja excluir este evento?')) return;
    try {
      await calendarService.deleteEvent(eventId);
      toast({ title: 'Evento excluído', description: 'O evento foi removido do calendário' });
      loadEvents();
    } catch (error: any) {
      toast({ title: 'Erro ao excluir evento', description: error.message || 'Erro desconhecido', variant: 'destructive' });
    }
  };

  const formatEventDate = (dateTimeStr: string) => {
    const date = new Date(dateTimeStr);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const formatEventTime = (dateTimeStr: string) => {
    const date = new Date(dateTimeStr);
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-blue-950 py-16 sm:py-24">
        <div className="container mx-auto px-4">
          <Link to="/tools">
            <Button variant="ghost" className="mb-6 gap-2 hover:gap-3 transition-all">
              <ArrowLeft className="h-4 w-4" />
              Voltar para Ferramentas
            </Button>
          </Link>
          <div className="text-center max-w-4xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium mb-4">
              <Sparkles className="h-4 w-4" />
              <span>Organize seus Estudos com Google Calendar</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Cronograma de Estudos</span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
              Integre com seu Google Calendar e crie sessões de estudo com revisão espaçada automática
            </p>
            {!isAuthenticated ? (
              <Button onClick={handleLogin} size="lg" className="gap-2"><LogIn className="h-5 w-5" />Conectar com Google Calendar</Button>
            ) : (
              <div className="flex items-center justify-center gap-4">
                <Badge variant="secondary" className="text-sm px-4 py-2">✓ Conectado</Badge>
                <Button onClick={handleLogout} variant="outline" size="sm" className="gap-2"><LogOut className="h-4 w-4" />Desconectar</Button>
              </div>
            )}
          </div>
        </div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      </section>
      <main className="container mx-auto px-4 py-8 sm:py-12">
        {isAuthenticated ? (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Próximas Sessões</h2>
              <div className="flex gap-2">
                <Button onClick={loadEvents} variant="outline" size="sm" className="gap-2"><RefreshCw className="h-4 w-4" />Atualizar</Button>
                <Button onClick={() => setIsModalOpen(true)} className="gap-2"><Plus className="h-4 w-4" />Nova Sessão</Button>
              </div>
            </div>
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-4">
                <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
                <p className="text-sm text-muted-foreground">Carregando eventos...</p>
              </div>
            ) : (
              <>{events.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {events.map((event) => (
                    <Card key={event.id} className="group hover:shadow-lg transition-all duration-300">
                      <CardHeader>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <CardTitle className="text-lg line-clamp-2">{event.summary}</CardTitle>
                            <CardDescription className="mt-2 flex items-center gap-2 text-xs">
                              <Calendar className="h-3 w-3" />{formatEventDate(event.start.dateTime)}
                            </CardDescription>
                          </div>
                          <Button variant="ghost" size="icon" className="shrink-0 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => event.id && handleDeleteEvent(event.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {event.description && (<p className="text-sm text-muted-foreground line-clamp-2">{event.description}</p>)}
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>{formatEventTime(event.start.dateTime)} - {formatEventTime(event.end.dateTime)}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="border-2 border-dashed">
                  <CardContent className="flex flex-col items-center justify-center py-12 sm:py-16 gap-4">
                    <div className="rounded-full bg-muted p-4"><Calendar className="h-8 w-8 text-muted-foreground" /></div>
                    <div className="text-center space-y-2">
                      <p className="font-medium">Nenhuma sessão agendada</p>
                      <p className="text-sm text-muted-foreground">Crie sua primeira sessão de estudos</p>
                    </div>
                    <Button onClick={() => setIsModalOpen(true)} className="gap-2"><Plus className="h-4 w-4" />Criar sessão</Button>
                  </CardContent>
                </Card>
              )}</>
            )}
          </div>
        ) : (
          <Card className="max-w-2xl mx-auto">
            <CardContent className="flex flex-col items-center justify-center py-12 gap-6">
              <div className="rounded-full bg-blue-100 dark:bg-blue-900/30 p-6"><Calendar className="h-12 w-12 text-blue-600" /></div>
              <div className="text-center space-y-2">
                <h3 className="text-xl font-bold">Conecte-se ao Google Calendar</h3>
                <p className="text-sm text-muted-foreground max-w-md">Sincronize suas sessões de estudo com o Google Calendar e receba lembretes automáticos. Crie revisões espaçadas baseadas na curva de esquecimento.</p>
              </div>
              <Button onClick={handleLogin} size="lg" className="gap-2"><LogIn className="h-5 w-5" />Conectar com Google Calendar</Button>
            </CardContent>
          </Card>
        )}
      </main>
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nova Sessão de Estudos</DialogTitle>
                        <DialogDescription>Crie uma sessão de estudos no seu calendário. Opcionalmente, ative revisões espaçadas.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="summary">Título *</Label>
              <Input id="summary" value={formData.summary} onChange={(e) => setFormData({ ...formData, summary: e.target.value })} placeholder="Ex: Estudo de Anatomia Cardiovascular" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea id="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Descreva o que você vai estudar nesta sessão..." rows={3} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Data *</Label>
                <Input id="date" type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="startTime">Horário *</Label>
                <Input id="startTime" type="time" value={formData.startTime} onChange={(e) => setFormData({ ...formData, startTime: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Duração (minutos)</Label>
              <Input id="duration" type="number" value={formData.duration} onChange={(e) => setFormData({ ...formData, duration: e.target.value })} min="15" step="15" />
            </div>
            <div className="flex items-center space-x-2 p-4 border rounded-lg bg-muted/50">
              <input type="checkbox" id="spacedRepetition" checked={formData.enableSpacedRepetition} onChange={(e) => setFormData({ ...formData, enableSpacedRepetition: e.target.checked })} className="h-4 w-4" />
              <label htmlFor="spacedRepetition" className="text-sm font-medium cursor-pointer">Criar revisões espaçadas (1, 3, 7, 14 e 30 dias)</label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)} disabled={isCreating}>Cancelar</Button>
            <Button onClick={handleCreateEvent} disabled={isCreating} className="gap-2">
              {isCreating ? (<><Loader2 className="h-4 w-4 animate-spin" />Criando...</>) : ('Criar Sessão')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <footer className="border-t mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">MedPrompts © 2026 • Desenvolvido para estudantes de Medicina</p>
            <p className="text-xs text-muted-foreground">Desenvolvido por <span className="font-semibold">Andressa Mendes</span> • Estudante de Medicina</p>
            <p className="text-xs text-muted-foreground">Afya - Guanambi/BA</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

