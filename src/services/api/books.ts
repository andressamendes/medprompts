import axios from 'axios';

const GOOGLE_BOOKS_API_URL = 'https://www.googleapis.com/books/v1/volumes';
const API_KEY = import.meta.env.VITE_GOOGLE_BOOKS_API_KEY;

/**
 * Livros médicos mais populares no Brasil
 */
const POPULAR_BRAZILIAN_BOOKS = [
  'Guyton Fisiologia',
  'Tratado de Fisiologia Médica Guyton',
  'Sobotta Atlas de Anatomia Humana',
  'Netter Atlas de Anatomia Humana',
  'Gray Anatomia',
  'Harrison Medicina Interna',
  'Robbins Patologia',
  'Goodman Gilman Farmacologia',
  'Nelson Tratado de Pediatria',
  'Williams Obstetrícia',
  'Sabiston Tratado de Cirurgia',
  'Cecil Medicina',
];

/**
 * Interface para dados de um livro
 */
export interface BookData {
  id: string;
  title: string;
  authors: string[];
  description: string;
  thumbnail: string;
  categories: string[];
  publishedDate: string;
  pageCount: number;
  language: string;
  previewLink: string;
  infoLink: string;
  isFavorite?: boolean;
}

/**
 * Interface para resposta da API
 */
interface GoogleBooksResponse {
  kind: string;
  totalItems: number;
  items: GoogleBookItem[];
}

interface GoogleBookItem {
  id: string;
  volumeInfo: {
    title: string;
    authors?: string[];
    description?: string;
    imageLinks?: {
      thumbnail?: string;
      smallThumbnail?: string;
    };
    categories?: string[];
    publishedDate?: string;
    pageCount?: number;
    language?: string;
    previewLink?: string;
    infoLink?: string;
  };
}

/**
 * Serviço de API para Google Books
 */
class BooksService {
  /**
   * Buscar livros por termo de pesquisa
   */
  async search(query: string, maxResults: number = 20): Promise<BookData[]> {
    try {
      const response = await axios.get<GoogleBooksResponse>(GOOGLE_BOOKS_API_URL, {
        params: {
          q: query,
          maxResults,
          key: API_KEY,
          orderBy: 'relevance',
        },
      });

      if (!response.data.items) {
        return [];
      }

      return response.data.items.map((item) => this.formatBook(item));
    } catch (error: unknown) {
      const message =
        typeof error === 'object' && error && 'message' in error
          ? String((error as { message?: unknown }).message)
          : 'Erro ao buscar livros';
      throw new Error(message);
    }
  }

  /**
   * Buscar livros médicos por categoria (priorizando livros brasileiros populares)
   */
  async searchMedical(category: string, maxResults: number = 20): Promise<BookData[]> {
    try {
      // Se for primeira busca, retornar livros populares
      if (category === 'medicina geral') {
        return await this.getPopularBooks();
      }

      // Adicionar termos médicos específicos à busca
      const medicalTerms = ['medicina', 'medical'];
      const searchQuery = `${category} ${medicalTerms.join(' OR ')}`;
      
      const response = await axios.get<GoogleBooksResponse>(GOOGLE_BOOKS_API_URL, {
        params: {
          q: searchQuery,
          maxResults,
          key: API_KEY,
          orderBy: 'relevance',
        },
      });

      if (!response.data.items) {
        return [];
      }

      return response.data.items.map((item) => this.formatBook(item));
    } catch (error: unknown) {
      const message =
        typeof error === 'object' && error && 'message' in error
          ? String((error as { message?: unknown }).message)
          : 'Erro ao buscar livros médicos';
      throw new Error(message);
    }
  }

  /**
   * Buscar livros populares brasileiros
   */
  async getPopularBooks(): Promise<BookData[]> {
    try {
      const allBooks: BookData[] = [];

      // Buscar cada livro popular
      for (const bookTitle of POPULAR_BRAZILIAN_BOOKS.slice(0, 6)) {
        try {
          const response = await axios.get<GoogleBooksResponse>(GOOGLE_BOOKS_API_URL, {
            params: {
              q: bookTitle,
              maxResults: 1,
              key: API_KEY,
              orderBy: 'relevance',
            },
          });

          if (response.data.items && response.data.items.length > 0) {
            allBooks.push(this.formatBook(response.data.items[0]));
          }
        } catch (error) {
          console.error(`Erro ao buscar ${bookTitle}:`, error);
        }
      }

      return allBooks;
    } catch (error: unknown) {
      const message =
        typeof error === 'object' && error && 'message' in error
          ? String((error as { message?: unknown }).message)
          : 'Erro ao buscar livros populares';
      throw new Error(message);
    }
  }

  /**
   * Buscar livro por ID
   */
  async getById(bookId: string): Promise<BookData | null> {
    try {
      const response = await axios.get<GoogleBookItem>(
        `${GOOGLE_BOOKS_API_URL}/${bookId}`,
        {
          params: {
            key: API_KEY,
          },
        }
      );

      return this.formatBook(response.data);
    } catch (error: unknown) {
      const message =
        typeof error === 'object' && error && 'message' in error
          ? String((error as { message?: unknown }).message)
          : 'Erro ao buscar detalhes do livro';
      throw new Error(message);
    }
  }

  /**
   * Formatar dados do livro da API do Google
   */
  private formatBook(item: GoogleBookItem): BookData {
    const volumeInfo = item.volumeInfo;
    
    return {
      id: item.id,
      title: volumeInfo.title || 'Título não disponível',
      authors: volumeInfo.authors || ['Autor desconhecido'],
      description: volumeInfo.description || 'Descrição não disponível',
      thumbnail: volumeInfo.imageLinks?.thumbnail?.replace('http:', 'https:') || volumeInfo.imageLinks?.smallThumbnail?.replace('http:', 'https:') || '',
      categories: volumeInfo.categories || [],
      publishedDate: volumeInfo.publishedDate || '',
      pageCount: volumeInfo.pageCount || 0,
      language: volumeInfo.language || 'pt',
      previewLink: volumeInfo.previewLink || '',
      infoLink: volumeInfo.infoLink || '',
      isFavorite: false,
    };
  }
}

export default new BooksService();

