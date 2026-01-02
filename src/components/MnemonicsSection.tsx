import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Mnemonic {
  id: string;
  title: string;
  mnemonic: string;
  explanation: string[];
  category: string;
}

const mnemonics: Mnemonic[] = [
  {
    id: 'mnem-1',
    title: 'Nervos Cranianos',
    mnemonic: 'Oh Oh Oh To Touch And Feel Very Good Velvet AH!',
    explanation: [
      'Olfatório',
      'Óptico',
      'Oculomotor',
      'Troclear',
      'Trigêmeo',
      'Abducente',
      'Facial',
      'Vestibulococlear',
      'Glossofaríngeo',
      'Vago',
      'Acessório',
      'Hipoglosso',
    ],
    category: 'Anatomia',
  },
  {
    id: 'mnem-2',
    title: 'Causas de Hipercalemia',
    mnemonic: 'MACHINE',
    explanation: [
      'Medications (medicações)',
      'Acidose',
      'Cellular breakdown (destruição celular)',
      'Hypoaldosteronism',
      'Intake (ingestão excessiva)',
      'Números falsos (pseudo-hipercalemia)',
      'Excretion (diminuição da excreção renal)',
    ],
    category: 'Nefrologia',
  },
  {
    id: 'mnem-3',
    title: 'Sintomas de Hipercalcemia',
    mnemonic: 'Stones, Bones, Groans, Thrones, Psychiatric Overtones',
    explanation: [
      'Stones: Cálculos renais',
      'Bones: Dor óssea',
      'Groans: Dor abdominal, náuseas',
      'Thrones: Poliúria (vai ao banheiro)',
      'Psychiatric Overtones: Alterações psiquiátricas',
    ],
    category: 'Endocrinologia',
  },
];

export function MnemonicsSection() {
  const [expandedMnemonic, setExpandedMnemonic] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { toast } = useToast();

  const toggleMnemonic = (id: string) => {
    setExpandedMnemonic(expandedMnemonic === id ? null : id);
  };

  const handleCopy = (mnemonic: Mnemonic) => {
    const text = `${mnemonic.title}\n\n${mnemonic.mnemonic}\n\n${mnemonic.explanation.join('\n')}`;
    navigator.clipboard.writeText(text);
    setCopiedId(mnemonic.id);
    setTimeout(() => setCopiedId(null), 2000);
    toast({
      title: '✅ Copiado!',
      description: 'Mnemônico copiado para área de transferência',
    });
  };

  return (
    <Card data-tutorial="mnemonics">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-500" />
          Mnemônicos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mnemonics.map((mnemonic) => {
            const isExpanded = expandedMnemonic === mnemonic.id;
            const isCopied = copiedId === mnemonic.id;

            return (
              <div
                key={mnemonic.id}
                className="border rounded-lg overflow-hidden"
              >
                <button
                  onClick={() => toggleMnemonic(mnemonic.id)}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-1 text-xs rounded bg-purple-100 text-purple-700">
                      {mnemonic.category}
                    </span>
                    <span className="font-medium text-left">
                      {mnemonic.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopy(mnemonic);
                      }}
                      className="p-2 hover:bg-gray-100 rounded transition-colors"
                      title="Copiar"
                    >
                      {isCopied ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4 text-muted-foreground" />
                      )}
                    </button>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                </button>

                {isExpanded && (
                  <div className="p-4 border-t bg-purple-50">
                    <div className="mb-4 p-4 bg-white rounded-lg border-2 border-purple-200">
                      <p className="font-bold text-lg text-center text-purple-900">
                        {mnemonic.mnemonic}
                      </p>
                    </div>

                    <div className="space-y-2">
                      {mnemonic.explanation.map((item, index) => (
                        <div
                          key={index}
                          className="flex items-start gap-2 text-sm"
                        >
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-200 text-purple-700 flex items-center justify-center text-xs font-bold">
                            {index + 1}
                          </span>
                          <span className="pt-0.5">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
