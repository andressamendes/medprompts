import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AuthenticatedNavbar } from '@/components/AuthenticatedNavbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Search, Star, ExternalLink, Loader2, BookOpen, Filter, ArrowLeft, Sparkles } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import booksService, { BookData } from '@/services/api/books';

export default function Library() {
  const [books, setBooks] = useState<BookData[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<BookData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('medicina geral');
  const [selectedTab, setSelectedTab] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const categories = ['medicina geral', 'anatomia', 'fisiologia', 'farmacologia', 'clínica médica', 'cirurgia', 'pediatria', 'cardiologia', 'neurologia', 'patologia'];

  useEffect(() => {
    if (selectedCategory) {
      loadBooks(selectedCategory);
    }
  }, [selectedCategory]);

  useEffect(() => {
    let filtered = books;
    if (selectedTab === 'favorites') {
      filtered = filtered.filter((book) => favorites.has(book.id));
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (book) =>
          book.title.toLowerCase().includes(term) ||
          book.authors.some((author) => author.toLowerCase().includes(term)) ||
          book.description.toLowerCase().includes(term)
      );
    }
    setFilteredBooks(filtered);
  }, [books, selectedTab, searchTerm, favorites]);

  const loadBooks = async (category: string) => {
    setIsLoading(true);
    try {
      const data = await booksService.searchMedical(category, 30);
      setBooks(data);
      setFilteredBooks(data);
    } catch (error: unknown) {
      const message = typeof error === 'object' && error && 'message' in error ? String((error as { message?: unknown }).message) : 'Erro ao carregar livros';
      toast({ title: 'Erro ao carregar livros', description: message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      toast({ title: 'Termo de busca vazio', description: 'Digite algo para buscar', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    try {
      const data = await booksService.search(searchTerm, 30);
      setBooks(data);
      setFilteredBooks(data);
    } catch (error: unknown) {
      const message = typeof error === 'object' && error && 'message' in error ? String((error as { message?: unknown }).message) : 'Erro ao buscar livros';
      toast({ title: 'Erro ao buscar', description: message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFavorite = (bookId: string) => {
    setFavorites((prev) => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(bookId)) {
        newFavorites.delete(bookId);
        toast({ title: 'Removido dos favoritos', description: 'Livro removido da sua lista' });
      } else {
        newFavorites.add(bookId);
        toast({ title: 'Adicionado aos favoritos', description: 'Livro salvo na sua lista' });
      }
      return newFavorites;
    });
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        <AuthenticatedNavbar />
        <section className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950 py-16 sm:py-24">
          <div className="container mx-auto px-4">
            <Link to="/tools">
              <Button variant="ghost" className="mb-6 gap-2 hover:gap-3 transition-all">
                <ArrowLeft className="h-4 w-4" />
                Voltar para Ferramentas
              </Button>
            </Link>
            <div className="text-center max-w-4xl mx-auto space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-sm font-medium mb-4">
                <Sparkles className="h-4 w-4" />
                <span>Livros Médicos Mais Populares do Brasil</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Biblioteca Médica</span>
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
                Guyton, Netter, Sobotta, Harrison e muito mais. Acesse os principais livros de referência.
              </p>
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <BookOpen className="h-5 w-5" />
                <span>{filteredBooks.length} livros disponíveis</span>
              </div>
            </div>
          </div>
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        </section>
        <main className="container mx-auto px-4 py-8 sm:py-12">
          <div className="space-y-8">
            <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
              <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 h-auto">
                <TabsTrigger value="all" className="gap-2"><BookOpen className="h-4 w-4" /><span className="hidden sm:inline">Todos os Livros</span><span className="sm:hidden">Todos</span></TabsTrigger>
                <TabsTrigger value="favorites" className="gap-2"><Star className="h-4 w-4" /><span className="hidden sm:inline">Meus Favoritos</span><span className="sm:hidden">Favoritos</span></TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 flex gap-2">
                <Input placeholder="Buscar por título, autor ou descrição..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} className="flex-1" />
                <Button onClick={handleSearch} className="gap-2"><Search className="h-4 w-4" /><span className="hidden sm:inline">Buscar</span></Button>
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full sm:w-[200px]"><Filter className="h-4 w-4 mr-2" /><SelectValue /></SelectTrigger>
                <SelectContent>{categories.map((cat) => (<SelectItem key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</SelectItem>))}</SelectContent>
              </Select>
            </div>
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-16 sm:py-24 gap-4">
                <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
                <p className="text-sm text-muted-foreground">Buscando livros populares...</p>
              </div>
            ) : (
              <>{filteredBooks.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredBooks.map((book) => (
                    <Card key={book.id} className="group flex flex-col hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-indigo-200 dark:hover:border-indigo-800">
                      <CardHeader className="pb-3">
                        <div className="flex gap-3">
                          {book.thumbnail && (<img src={book.thumbnail} alt={book.title} className="w-20 h-28 object-cover rounded-lg shadow-md" />)}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <CardTitle className="text-sm leading-tight line-clamp-3">{book.title}</CardTitle>
                              <Tooltip>
                                <TooltipTrigger>
                                  <Button variant="ghost" size="icon" className="shrink-0 h-7 w-7" onClick={() => toggleFavorite(book.id)}>
                                    <Star className={`h-4 w-4 transition-all ${favorites.has(book.id) ? 'fill-yellow-500 text-yellow-500 scale-110' : 'group-hover:text-yellow-500/50'}`} />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>{favorites.has(book.id) ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}</TooltipContent>
                              </Tooltip>
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-2">{book.authors.join(', ')}</p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="flex-1 flex flex-col gap-3 pt-0">
                        <CardDescription className="text-xs line-clamp-3">{book.description}</CardDescription>
                        <div className="flex flex-wrap gap-1.5 text-xs text-muted-foreground">
                          {book.publishedDate && (<Badge variant="outline" className="text-xs">{book.publishedDate.split('-')[0]}</Badge>)}
                          {book.pageCount > 0 && (<Badge variant="outline" className="text-xs">{book.pageCount} pág.</Badge>)}
                        </div>
                        <div className="flex gap-2 mt-auto">
                          {book.previewLink && (
                            <Tooltip>
                              <TooltipTrigger className="flex-1">
                                <Button variant="outline" size="sm" className="w-full gap-2" onClick={() => window.open(book.previewLink, '_blank')}>
                                  <BookOpen className="h-3 w-3" /><span className="text-xs">Prévia</span>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Ver prévia do livro</TooltipContent>
                            </Tooltip>
                          )}
                          {book.infoLink && (
                            <Tooltip>
                              <TooltipTrigger className="flex-1">
                                <Button variant="default" size="sm" className="w-full gap-2" onClick={() => window.open(book.infoLink, '_blank')}>
                                  <ExternalLink className="h-3 w-3" /><span className="text-xs">Detalhes</span>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Ver mais informações</TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="border-2 border-dashed">
                  <CardContent className="flex flex-col items-center justify-center py-12 sm:py-16 gap-4">
                    <div className="rounded-full bg-muted p-4"><Search className="h-8 w-8 text-muted-foreground" /></div>
                    <div className="text-center space-y-2">
                      <p className="font-medium">Nenhum livro encontrado</p>
                      <p className="text-sm text-muted-foreground">Tente ajustar os filtros ou fazer uma nova busca</p>
                    </div>
                  </CardContent>
                </Card>
              )}</>
            )}
          </div>
        </main>
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
    </TooltipProvider>
  );
}
        
