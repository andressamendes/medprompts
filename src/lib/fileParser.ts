/**
 * Utilitário para parsing de arquivos PDF, DOCX e TXT
 * Extrai texto dos arquivos para injeção dinâmica em prompts
 * Usa lazy loading para otimizar o bundle
 */

export interface ParseResult {
  success: boolean;
  content: string;
  error?: string;
  metadata?: {
    pages?: number;
    wordCount?: number;
    fileType: string;
  };
}

/**
 * Extrai texto de um arquivo PDF (lazy loading)
 */
export async function parsePDF(file: File): Promise<ParseResult> {
  try {
    // Dynamic import para otimizar bundle
    const pdfjsLib = await import('pdfjs-dist');

    // Configurar worker do PDF.js
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    let fullText = '';
    const numPages = pdf.numPages;

    for (let i = 1; i <= numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item) => {
          // TextItem has 'str' property, TextMarkedContent doesn't
          if ('str' in item) {
            return item.str || '';
          }
          return '';
        })
        .join(' ');
      fullText += pageText + '\n\n';
    }

    const cleanedText = cleanExtractedText(fullText);

    return {
      success: true,
      content: cleanedText,
      metadata: {
        pages: numPages,
        wordCount: cleanedText.split(/\s+/).length,
        fileType: 'pdf',
      },
    };
  } catch (error) {
    console.error('Erro ao processar PDF:', error);
    return {
      success: false,
      content: '',
      error: `Erro ao processar PDF: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
    };
  }
}

/**
 * Extrai texto de um arquivo DOCX (lazy loading)
 */
export async function parseDOCX(file: File): Promise<ParseResult> {
  try {
    // Dynamic import para otimizar bundle
    const mammoth = await import('mammoth');

    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });

    const cleanedText = cleanExtractedText(result.value);

    return {
      success: true,
      content: cleanedText,
      metadata: {
        wordCount: cleanedText.split(/\s+/).length,
        fileType: 'docx',
      },
    };
  } catch (error) {
    console.error('Erro ao processar DOCX:', error);
    return {
      success: false,
      content: '',
      error: `Erro ao processar DOCX: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
    };
  }
}

/**
 * Lê conteúdo de arquivo de texto
 */
export async function parseTXT(file: File): Promise<ParseResult> {
  try {
    const text = await file.text();
    const cleanedText = cleanExtractedText(text);

    return {
      success: true,
      content: cleanedText,
      metadata: {
        wordCount: cleanedText.split(/\s+/).length,
        fileType: 'txt',
      },
    };
  } catch (error) {
    console.error('Erro ao ler arquivo de texto:', error);
    return {
      success: false,
      content: '',
      error: `Erro ao ler arquivo: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
    };
  }
}

/**
 * Parser universal que detecta o tipo de arquivo e usa o parser apropriado
 */
export async function parseFile(file: File): Promise<ParseResult> {
  const extension = file.name.toLowerCase().split('.').pop() || '';
  const mimeType = file.type.toLowerCase();

  // PDF
  if (extension === 'pdf' || mimeType === 'application/pdf') {
    return parsePDF(file);
  }

  // DOCX
  if (extension === 'docx' || mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    return parseDOCX(file);
  }

  // DOC (formato antigo - tentamos como texto mas pode não funcionar)
  if (extension === 'doc' || mimeType === 'application/msword') {
    return {
      success: false,
      content: '',
      error: 'Formato .doc não suportado. Por favor, converta para .docx ou .pdf',
    };
  }

  // Arquivos de texto (txt, md, csv, etc.)
  if (
    extension === 'txt' ||
    extension === 'md' ||
    extension === 'csv' ||
    mimeType.startsWith('text/')
  ) {
    return parseTXT(file);
  }

  return {
    success: false,
    content: '',
    error: `Formato de arquivo não suportado: ${extension || mimeType}`,
  };
}

/**
 * Limpa texto extraído removendo caracteres indesejados e normalizando espaçamento
 */
function cleanExtractedText(text: string): string {
  return text
    // Remover caracteres de controle
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    // Normalizar quebras de linha
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    // Remover múltiplas quebras de linha (mais de 2)
    .replace(/\n{3,}/g, '\n\n')
    // Remover espaços múltiplos
    .replace(/[ \t]{2,}/g, ' ')
    // Remover espaços no início/fim das linhas
    .split('\n')
    .map(line => line.trim())
    .join('\n')
    // Trim final
    .trim();
}

/**
 * Trunca texto se exceder limite de caracteres (para evitar prompts muito grandes)
 */
export function truncateContent(content: string, maxLength: number = 15000): string {
  if (content.length <= maxLength) {
    return content;
  }

  const truncated = content.substring(0, maxLength);
  // Tentar cortar em um ponto natural (fim de parágrafo ou frase)
  const lastParagraph = truncated.lastIndexOf('\n\n');
  const lastSentence = truncated.lastIndexOf('. ');

  const cutPoint = Math.max(lastParagraph, lastSentence);

  if (cutPoint > maxLength * 0.8) {
    return truncated.substring(0, cutPoint + 1) + '\n\n[...conteúdo truncado por exceder limite de caracteres]';
  }

  return truncated + '\n\n[...conteúdo truncado por exceder limite de caracteres]';
}

/**
 * Verifica se o tipo de arquivo é suportado para parsing de conteúdo
 */
export function isContentParseable(filename: string): boolean {
  const extension = filename.toLowerCase().split('.').pop() || '';
  const parseableExtensions = ['pdf', 'docx', 'txt', 'md', 'csv'];
  return parseableExtensions.includes(extension);
}
