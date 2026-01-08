import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, GripVertical, Plus, Shuffle, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Task {
  id: string;
  text: string;
  timeBlock: number; // em minutos
  completed: boolean;
}

export const TaskStack = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskText, setNewTaskText] = useState('');
  const [newTaskTime, setNewTaskTime] = useState(25);

  const addTask = () => {
    if (!newTaskText.trim()) return;

    const newTask: Task = {
      id: Date.now().toString(),
      text: newTaskText.trim(),
      timeBlock: newTaskTime,
      completed: false,
    };

    setTasks([...tasks, newTask]);
    setNewTaskText('');
    setNewTaskTime(25);
  };

  const removeTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const toggleComplete = (id: string) => {
    setTasks(tasks.map(t => 
      t.id === id ? { ...t, completed: !t.completed } : t
    ));
  };

  const shuffleTasks = () => {
    const shuffled = [...tasks].sort(() => Math.random() - 0.5);
    setTasks(shuffled);
  };

  const clearCompleted = () => {
    setTasks(tasks.filter(t => !t.completed));
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="text-lg md:text-xl">Pilha de Tarefas</CardTitle>
          <div className="flex gap-2">
            <Button
              onClick={shuffleTasks}
              size="sm"
              variant="outline"
              disabled={tasks.length === 0}
            >
              <Shuffle className="h-4 w-4" />
            </Button>
            <Button
              onClick={clearCompleted}
              size="sm"
              variant="outline"
              disabled={!tasks.some(t => t.completed)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Formulário de nova tarefa */}
        <div className="flex flex-col md:flex-row gap-2">
          <Input
            placeholder="Nova tarefa..."
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') addTask();
            }}
            className="flex-1"
          />
          <div className="flex gap-2">
            <Input
              type="number"
              min="5"
              max="120"
              value={newTaskTime}
              onChange={(e) => setNewTaskTime(Number(e.target.value))}
              className="w-20"
              placeholder="min"
            />
            <Button onClick={addTask} size="default" className="whitespace-nowrap">
              <Plus className="h-4 w-4 mr-1" />
              Adicionar
            </Button>
          </div>
        </div>

        {/* Lista de tarefas */}
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {tasks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              Nenhuma tarefa adicionada ainda.
              <br />
              Comece criando sua primeira tarefa!
            </div>
          ) : (
            tasks.map((task) => (
              <div
                key={task.id}
                className={`flex items-center gap-2 p-3 rounded-lg border transition-all ${
                  task.completed
                    ? 'bg-secondary/30 border-secondary'
                    : 'bg-background border-border hover:border-primary/50'
                }`}
              >
                <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => toggleComplete(task.id)}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary flex-shrink-0"
                />

                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-medium truncate ${
                      task.completed ? 'line-through text-muted-foreground' : ''
                    }`}
                  >
                    {task.text}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {task.timeBlock} min
                  </p>
                </div>

                <Button
                  onClick={() => removeTask(task.id)}
                  size="sm"
                  variant="ghost"
                  className="flex-shrink-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </div>

        {/* Estatísticas */}
        {tasks.length > 0 && (
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground pt-2 border-t">
            <span>
              Total: <strong className="text-foreground">{tasks.length}</strong> tarefas
            </span>
            <span>
              Concluídas: <strong className="text-foreground">{tasks.filter(t => t.completed).length}</strong>
            </span>
            <span>
              Tempo total: <strong className="text-foreground">{tasks.reduce((acc, t) => acc + t.timeBlock, 0)}</strong> min
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
