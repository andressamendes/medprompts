import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { User, Lock, Settings, Upload, Loader2, ArrowLeft } from 'lucide-react';
import { authService } from '@/services/auth.service';

interface UserProfile {
  name: string;
  email: string;
  university: string;
  graduationYear: number;
  avatar?: string;
}

interface PasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface Preferences {
  theme: 'light' | 'dark' | 'system';
  notifications: boolean;
  emailNotifications: boolean;
}

export default function Profile() {
  const { toast } = useToast();
  const navigate = useNavigate();

  // Estados
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    email: '',
    university: '',
    graduationYear: new Date().getFullYear(),
    avatar: ''
  });

  const [passwordData, setPasswordData] = useState<PasswordData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [preferences, setPreferences] = useState<Preferences>({
    theme: 'system',
    notifications: true,
    emailNotifications: false
  });

  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isLoadingPassword, setIsLoadingPassword] = useState(false);
  const [isLoadingPreferences, setIsLoadingPreferences] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string>('');

  // Carregar dados do perfil ao montar componente
  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      const currentUser = authService.getCurrentUser();
      
      if (currentUser) {
        setProfile({
          name: currentUser.name,
          email: currentUser.email,
          university: currentUser.university || '',
          graduationYear: currentUser.graduationYear || new Date().getFullYear(),
          avatar: currentUser.avatar || ''
        });
        setAvatarPreview(currentUser.avatar || '');
      }
      
      setPreferences({
        theme: 'system',
        notifications: true,
        emailNotifications: false
      });
    } catch (error) {
      toast({
        title: 'Erro ao carregar perfil',
        description: 'Não foi possível carregar os dados do perfil. Tente recarregar a página.',
        variant: 'destructive'
      });
    }
  };

  // Validação de nome
  const validateName = (name: string): boolean => {
    if (name.trim().length < 3) {
      toast({
        title: 'Nome inválido',
        description: 'O nome deve ter pelo menos 3 caracteres',
        variant: 'destructive'
      });
      return false;
    }
    return true;
  };

  // Validação de universidade
  const validateUniversity = (university: string): boolean => {
    if (university.trim().length < 3) {
      toast({
        title: 'Universidade inválida',
        description: 'O nome da universidade deve ter pelo menos 3 caracteres',
        variant: 'destructive'
      });
      return false;
    }
    return true;
  };

  // Validação de ano de formatura
  const validateGraduationYear = (year: number): boolean => {
    const currentYear = new Date().getFullYear();
    if (year < currentYear || year > currentYear + 10) {
      toast({
        title: 'Ano inválido',
        description: 'O ano de formatura deve estar entre o ano atual e daqui a 10 anos',
        variant: 'destructive'
      });
      return false;
    }
    return true;
  };

  // MELHORIA CRÍTICA 2: Validação em tempo real do ano de formatura
  const handleGraduationYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    const currentYear = new Date().getFullYear();
    
    // Bloqueia valores inválidos em tempo real
    if (value < currentYear) {
      toast({
        title: 'Ano inválido',
        description: `O ano de formatura não pode ser anterior a ${currentYear}`,
        variant: 'destructive'
      });
      return;
    }
    
    if (value > currentYear + 10) {
      toast({
        title: 'Ano inválido',
        description: `O ano de formatura não pode ser superior a ${currentYear + 10}`,
        variant: 'destructive'
      });
      return;
    }
    
    setProfile(prev => ({ ...prev, graduationYear: value }));
  };

  // Validação de senha com segurança melhorada
  const validatePassword = async (): Promise<boolean> => {
    if (passwordData.currentPassword.length < 8) {
      toast({
        title: 'Senha atual inválida',
        description: 'A senha atual deve ter pelo menos 8 caracteres',
        variant: 'destructive'
      });
      return false;
    }

    // SEGURANÇA: Verifica senha atual usando authService (PBKDF2)
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      toast({
        title: 'Erro de autenticação',
        description: 'Usuário não encontrado. Faça login novamente.',
        variant: 'destructive'
      });
      return false;
    }

    const isValidPassword = await authService.validateCurrentPassword(
      currentUser.email,
      passwordData.currentPassword
    );

    if (!isValidPassword) {
      toast({
        title: 'Senha incorreta',
        description: 'A senha atual informada está incorreta',
        variant: 'destructive'
      });
      return false;
    }

    if (passwordData.newPassword.length < 8) {
      toast({
        title: 'Nova senha inválida',
        description: 'A nova senha deve ter pelo menos 8 caracteres',
        variant: 'destructive'
      });
      return false;
    }

    // Validar complexidade da senha
    const hasUpperCase = /[A-Z]/.test(passwordData.newPassword);
    const hasLowerCase = /[a-z]/.test(passwordData.newPassword);
    const hasNumber = /[0-9]/.test(passwordData.newPassword);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(passwordData.newPassword);

    if (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar) {
      toast({
        title: 'Senha fraca',
        description: 'A senha deve conter letras maiúsculas, minúsculas, números e caracteres especiais (!@#$%)',
        variant: 'destructive'
      });
      return false;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: 'Senhas não coincidem',
        description: 'A nova senha e a confirmação devem ser iguais',
        variant: 'destructive'
      });
      return false;
    }

    return true;
  };

  // Salvar informações pessoais
  const handleSaveProfile = async () => {
    if (!validateName(profile.name)) return;
    if (!validateUniversity(profile.university)) return;
    if (!validateGraduationYear(profile.graduationYear)) return;

    setIsLoadingProfile(true);

    try {
      const currentUser = authService.getCurrentUser();
      if (currentUser) {
        await authService.updateUser(currentUser.id, {
          name: profile.name,
          university: profile.university,
          graduationYear: profile.graduationYear
        });
      }
      
      toast({
        title: 'Sucesso!',
        description: 'Perfil atualizado com sucesso',
      });
    } catch (error) {
      toast({
        title: 'Erro ao salvar',
        description: 'Não foi possível atualizar o perfil. Tente novamente.',
        variant: 'destructive'
      });
    } finally {
      setIsLoadingProfile(false);
    }
  };

  // MELHORIA CRÍTICA 3: Validação melhorada de avatar com dimensões
  const validateImage = (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      // Validar tipo de arquivo
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Arquivo inválido',
          description: 'Por favor, selecione uma imagem (PNG, JPG, WEBP)',
          variant: 'destructive'
        });
        resolve(false);
        return;
      }

      // Validar tamanho (máximo 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: 'Arquivo muito grande',
          description: 'A imagem deve ter no máximo 2MB',
          variant: 'destructive'
        });
        resolve(false);
        return;
      }

      // Validar dimensões da imagem
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      
      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        
        if (img.width < 100 || img.height < 100) {
          toast({
            title: 'Imagem muito pequena',
            description: 'A imagem deve ter pelo menos 100x100 pixels',
            variant: 'destructive'
          });
          resolve(false);
          return;
        }

        if (img.width > 2000 || img.height > 2000) {
          toast({
            title: 'Imagem muito grande',
            description: 'A imagem deve ter no máximo 2000x2000 pixels',
            variant: 'destructive'
          });
          resolve(false);
          return;
        }

        resolve(true);
      };

      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        toast({
          title: 'Erro ao processar imagem',
          description: 'Não foi possível ler o arquivo de imagem',
          variant: 'destructive'
        });
        resolve(false);
      };

      img.src = objectUrl;
    });
  };

  // Upload de avatar com loading
  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar imagem
    const isValid = await validateImage(file);
    if (!isValid) return;

    setIsUploadingAvatar(true);

    // Criar preview
    const reader = new FileReader();
    reader.onloadend = async () => {
      const avatarData = reader.result as string;
      
      // TODO: Em produção, enviar para servidor e receber URL
      // const response = await fetch('/api/upload/avatar', {
      //   method: 'POST',
      //   body: formData
      // });
      // const { avatarUrl } = await response.json();
      
      setAvatarPreview(avatarData);

      // Salvar no perfil
      const currentUser = authService.getCurrentUser();
      if (currentUser) {
        try {
          await authService.updateUser(currentUser.id, {
            avatar: avatarData
          });
          setProfile(prev => ({ ...prev, avatar: avatarData }));
          
          toast({
            title: 'Sucesso!',
            description: 'Avatar atualizado com sucesso',
          });
        } catch (error) {
          toast({
            title: 'Erro ao salvar avatar',
            description: 'Não foi possível salvar o avatar. Tente novamente.',
            variant: 'destructive'
          });
        } finally {
          setIsUploadingAvatar(false);
        }
      }
    };

    reader.onerror = () => {
      toast({
        title: 'Erro ao processar arquivo',
        description: 'Não foi possível ler o arquivo. Tente novamente.',
        variant: 'destructive'
      });
      setIsUploadingAvatar(false);
    };

    reader.readAsDataURL(file);
  };

  // Alterar senha
  const handleChangePassword = async () => {
    // Valida senha (agora é async)
    const isValid = await validatePassword();
    if (!isValid) return;

    setIsLoadingPassword(true);

    try {
      const currentUser = authService.getCurrentUser();
      if (!currentUser) {
        throw new Error('Usuário não autenticado');
      }

      // SEGURANÇA: Usa authService.updatePassword com hashing PBKDF2
      await authService.updatePassword(
        currentUser.id,
        passwordData.currentPassword,
        passwordData.newPassword
      );

      toast({
        title: 'Sucesso!',
        description: 'Senha alterada com sucesso',
      });

      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error: any) {
      toast({
        title: 'Erro ao alterar senha',
        description: error.message || 'Não foi possível alterar a senha. Tente novamente.',
        variant: 'destructive'
      });
    } finally {
      setIsLoadingPassword(false);
    }
  };

  // Salvar preferências
  const handleSavePreferences = async () => {
    setIsLoadingPreferences(true);

    try {
      // TODO: Implementar salvamento real de preferências no backend
      toast({
        title: 'Sucesso!',
        description: 'Preferências atualizadas com sucesso',
      });
    } catch (error) {
      toast({
        title: 'Erro ao salvar preferências',
        description: 'Não foi possível atualizar as preferências. Tente novamente.',
        variant: 'destructive'
      });
    } finally {
      setIsLoadingPreferences(false);
    }
  };

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8 md:py-12">
      <div className="mb-8">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate('/dashboard')}
          className="mb-4 flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar ao Dashboard
        </Button>
        
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Meu Perfil</h1>
        <p className="text-muted-foreground">Gerencie suas informações pessoais e preferências</p>
      </div>

      <Tabs defaultValue="personal" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 gap-2">
          <TabsTrigger value="personal" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Pessoal</span>
            <span className="sm:hidden">Info</span>
          </TabsTrigger>
          <TabsTrigger value="avatar" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            <span className="hidden sm:inline">Avatar</span>
            <span className="sm:hidden">Foto</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            <span className="hidden sm:inline">Segurança</span>
            <span className="sm:hidden">Senha</span>
          </TabsTrigger>
          <TabsTrigger value="preferences" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Preferências</span>
            <span className="sm:hidden">Config</span>
          </TabsTrigger>
        </TabsList>

        {/* Aba de Informações Pessoais */}
        <TabsContent value="personal">
          <Card>
            <CardHeader>
              <CardTitle>Informações Pessoais</CardTitle>
              <CardDescription>
                Atualize suas informações de perfil
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo</Label>
                <Input
                  id="name"
                  value={profile.name}
                  onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Seu nome completo"
                  className="min-h-[44px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  disabled
                  className="bg-muted min-h-[44px]"
                />
                <p className="text-sm text-muted-foreground">
                  O email não pode ser alterado
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="university">Universidade</Label>
                <Input
                  id="university"
                  value={profile.university}
                  onChange={(e) => setProfile(prev => ({ ...prev, university: e.target.value }))}
                  placeholder="Nome da sua universidade"
                  className="min-h-[44px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="graduationYear">Ano de Formatura</Label>
                <Input
                  id="graduationYear"
                  type="number"
                  min={new Date().getFullYear()}
                  max={new Date().getFullYear() + 10}
                  value={profile.graduationYear}
                  onChange={handleGraduationYearChange}
                  className="min-h-[44px]"
                />
              </div>

              <Button 
                onClick={handleSaveProfile} 
                className="w-full md:w-auto"
                disabled={isLoadingProfile}
              >
                {isLoadingProfile ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  'Salvar Alterações'
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba de Avatar */}
        <TabsContent value="avatar">
          <Card>
            <CardHeader>
              <CardTitle>Avatar do Perfil</CardTitle>
              <CardDescription>
                Faça upload de uma foto de perfil
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center gap-6">
                <div className="relative">
                  <Avatar className="h-32 w-32 md:h-40 md:w-40">
                    <AvatarImage src={avatarPreview || profile.avatar} alt={profile.name} />
                    <AvatarFallback className="text-4xl">
                      {profile.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  {isUploadingAvatar && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                      <Loader2 className="h-8 w-8 animate-spin text-white" />
                    </div>
                  )}
                </div>

                <div className="text-center space-y-2">
                  <Label htmlFor="avatar-upload" className="cursor-pointer">
                    <Button
                      type="button"
                      disabled={isUploadingAvatar}
                      className="flex items-center gap-2"
                      asChild
                    >
                      <span>
                        <Upload className="h-4 w-4" />
                        {isUploadingAvatar ? 'Enviando...' : 'Escolher Imagem'}
                      </span>
                    </Button>
                  </Label>
                  <Input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarUpload}
                    disabled={isUploadingAvatar}
                  />
                  <p className="text-sm text-muted-foreground">
                    PNG, JPG ou WEBP. 100-2000px. Máximo 2MB.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba de Segurança */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Alterar Senha</CardTitle>
              <CardDescription>
                Mantenha sua conta segura com uma senha forte
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Senha Atual</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                  placeholder="Digite sua senha atual"
                  className="min-h-[44px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">Nova Senha</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                  placeholder="Digite a nova senha"
                  className="min-h-[44px]"
                />
                <p className="text-sm text-muted-foreground">
                  Mínimo 8 caracteres, com letras maiúsculas, minúsculas, números e caracteres especiais (!@#$%)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  placeholder="Confirme a nova senha"
                  className="min-h-[44px]"
                />
              </div>

              <Button 
                onClick={handleChangePassword} 
                className="w-full md:w-auto"
                disabled={isLoadingPassword}
              >
                {isLoadingPassword ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Alterando...
                  </>
                ) : (
                  'Alterar Senha'
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba de Preferências */}
        <TabsContent value="preferences">
          <Card>
            <CardHeader>
              <CardTitle>Preferências</CardTitle>
              <CardDescription>
                Personalize sua experiência
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Tema</Label>
                    <p className="text-sm text-muted-foreground">
                      Escolha o tema da interface
                    </p>
                  </div>
                  <select
                    value={preferences.theme}
                    onChange={(e) => setPreferences(prev => ({ ...prev, theme: e.target.value as 'light' | 'dark' | 'system' }))}
                    className="px-3 py-2 border rounded-md min-h-[44px]"
                  >
                    <option value="light">Claro</option>
                    <option value="dark">Escuro</option>
                    <option value="system">Sistema</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Notificações</Label>
                    <p className="text-sm text-muted-foreground">
                      Receba notificações no navegador
                    </p>
                  </div>
                  <Switch
                    checked={preferences.notifications}
                    onCheckedChange={(checked: boolean) => setPreferences(prev => ({ ...prev, notifications: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Notificações por Email</Label>
                    <p className="text-sm text-muted-foreground">
                      Receba atualizações por email
                    </p>
                  </div>
                  <Switch
                    checked={preferences.emailNotifications}
                    onCheckedChange={(checked: boolean) => setPreferences(prev => ({ ...prev, emailNotifications: checked }))}
                  />
                </div>
              </div>

              <Button 
                onClick={handleSavePreferences} 
                className="w-full md:w-auto"
                disabled={isLoadingPreferences}
              >
                {isLoadingPreferences ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  'Salvar Preferências'
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
