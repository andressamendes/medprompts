import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, ExternalLink, CheckCircle2, AlertCircle } from 'lucide-react';
import { clinicalCases, type ClinicalCase } from '@/data/clinical-cases-data';
import { useToast } from '@/hooks/use-toast';
import { updateChallengeProgress } from '@/lib/weekly-challenge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export function ClinicalCasesSection() {
  const [selectedCase, setSelectedCase] = useState<ClinicalCase | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);
  const { toast } = useToast();

  const handleSelectAnswer = (questionIndex: number, optionIndex: number) => {
    setUserAnswers(prev => ({ ...prev, [questionIndex]: optionIndex }));
  };

  const handleSubmit = () => {
    if (!selectedCase) return;

    const totalQuestions = selectedCase.questions.length;
    const answeredQuestions = Object.keys(userAnswers).length;

    if (answeredQuestions < totalQuestions) {
      toast({
        title: '⚠️ Responda todas as questões',
        description: `Faltam ${totalQuestions - answeredQuestions} questão(ões)`,
      });
      return;
    }

    setShowResults(true);

    // Calcular acertos
    const correctAnswers = selectedCase.questions.filter(
      (q, idx) => userAnswers[idx] === q.correctAnswer
    ).length;

    // Se acertou todas, registra no desafio semanal
    if (correctAnswers === totalQuestions) {
      const { tasksCompleted } = updateChallengeProgress('clinical-case', 1);
      
      if (tasksCompleted.length > 0) {
        toast({
          title: '🏆 Tarefa do desafio concluída!',
          description: `${tasksCompleted[0].title} - +${tasksCompleted[0].xpReward} XP`,
        });
      }
    }

    toast({
      title: correctAnswers === totalQuestions ? '🎉 Perfeito!' : '📝 Caso finalizado',
      description: `Você acertou ${correctAnswers} de ${totalQuestions} questões`,
    });
  };

  const handleVerifyPerplexity = (clinicalCase: ClinicalCase) => {
    const query = encodeURIComponent(clinicalCase.perplexityQuery);
    const perplexityUrl = `https://www.perplexity.ai/?q=${query}`;
    window.open(perplexityUrl, '_blank', 'noopener,noreferrer');
  };

  const handleReset = () => {
    setUserAnswers({});
    setShowResults(false);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Fácil': return 'bg-green-100 text-green-800';
      case 'Médio': return 'bg-yellow-100 text-yellow-800';
      case 'Difícil': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-500" />
            Casos Clínicos
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Disclaimer */}
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
              <div className="text-xs text-yellow-800">
                <strong>Validação Médica:</strong> Todos os casos foram validados via Perplexity com fontes científicas.
                Clique em "Verificar no Perplexity" para conferir as fontes.
              </div>
            </div>
          </div>

          {/* Grid de casos */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {clinicalCases.map((clinicalCase) => (
              <Card key={clinicalCase.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-sm line-clamp-2">{clinicalCase.title}</h3>
                      <Badge className={`text-xs shrink-0 ${getDifficultyColor(clinicalCase.difficulty)}`}>
                        {clinicalCase.difficulty}
                      </Badge>
                    </div>

                    <div className="space-y-2 text-sm text-muted-foreground">
                      <p>👤 {clinicalCase.patient.gender}, {clinicalCase.patient.age} anos</p>
                      <p className="line-clamp-2">{clinicalCase.patient.complaint}</p>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {clinicalCase.tags.slice(0, 3).map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <Button
                      onClick={() => setSelectedCase(clinicalCase)}
                      className="w-full"
                      size="sm"
                    >
                      Resolver Caso
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Dialog do Caso Clínico */}
      <Dialog open={!!selectedCase} onOpenChange={() => {
        setSelectedCase(null);
        handleReset();
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>{selectedCase?.title}</span>
              <Badge className={selectedCase ? getDifficultyColor(selectedCase.difficulty) : ''}>
                {selectedCase?.difficulty}
              </Badge>
            </DialogTitle>
            <DialogDescription>
              {selectedCase?.category}
            </DialogDescription>
          </DialogHeader>

          {selectedCase && (
            <div className="space-y-6 py-4">
              {/* Botão Verificar Perplexity */}
              <Button
                onClick={() => handleVerifyPerplexity(selectedCase)}
                variant="outline"
                size="sm"
                className="w-full"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Verificar no Perplexity (Validação Científica)
              </Button>

              {/* Apresentação do Caso */}
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold mb-2">👤 Paciente</h3>
                  <p className="text-sm">
                    {selectedCase.patient.gender}, {selectedCase.patient.age} anos
                  </p>
                  <p className="text-sm font-medium mt-2">{selectedCase.patient.complaint}</p>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold mb-2">📋 História Clínica</h3>
                  <p className="text-sm whitespace-pre-line">{selectedCase.history}</p>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold mb-2">🔍 Exame Físico</h3>
                  <p className="text-sm whitespace-pre-line">{selectedCase.physicalExam}</p>
                </div>

                {selectedCase.labs && (
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <h3 className="font-semibold mb-2">🧪 Exames Laboratoriais</h3>
                    <p className="text-sm whitespace-pre-line">{selectedCase.labs}</p>
                  </div>
                )}

                {selectedCase.imaging && (
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h3 className="font-semibold mb-2">📸 Exames de Imagem</h3>
                    <p className="text-sm whitespace-pre-line">{selectedCase.imaging}</p>
                  </div>
                )}
              </div>

              {/* Questões */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">❓ Questões</h3>
                
                {selectedCase.questions.map((question, qIdx) => (
                  <div key={qIdx} className="p-4 border rounded-lg space-y-3">
                    <p className="font-medium">{qIdx + 1}. {question.question}</p>
                    
                    <div className="space-y-2">
                      {question.options.map((option, oIdx) => {
                        const isSelected = userAnswers[qIdx] === oIdx;
                        const isCorrect = question.correctAnswer === oIdx;
                        const showCorrect = showResults && isCorrect;
                        const showWrong = showResults && isSelected && !isCorrect;

                        return (
                          <button
                            key={oIdx}
                            onClick={() => !showResults && handleSelectAnswer(qIdx, oIdx)}
                            disabled={showResults}
                            className={`w-full text-left p-3 border rounded-lg transition-all ${
                              showCorrect ? 'border-green-500 bg-green-50' :
                              showWrong ? 'border-red-500 bg-red-50' :
                              isSelected ? 'border-primary bg-primary/5' :
                              'hover:border-gray-400'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              {showCorrect && <CheckCircle2 className="w-5 h-5 text-green-600" />}
                              {showWrong && <AlertCircle className="w-5 h-5 text-red-600" />}
                              <span className="text-sm">{option}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {showResults && (
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm">
                          <strong>Explicação:</strong> {question.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Botões de ação */}
              {!showResults ? (
                <Button onClick={handleSubmit} className="w-full" size="lg">
                  Enviar Respostas
                </Button>
              ) : (
                <div className="space-y-3">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h3 className="font-semibold mb-2">✅ Diagnóstico</h3>
                    <p className="text-sm">{selectedCase.diagnosis}</p>
                  </div>

                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h3 className="font-semibold mb-2">💊 Tratamento</h3>
                    <p className="text-sm whitespace-pre-line">{selectedCase.treatment}</p>
                  </div>

                  <Button onClick={handleReset} variant="outline" className="w-full">
                    Tentar Novamente
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
