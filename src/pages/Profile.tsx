import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { User, Lock, Settings, Upload, Loader2 } from 'lucide-react';
import api from '@/services/api';

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
  const [avatarPreview, setAvatarPreview] = useState<string>('');

  // Carregar dados do perfil ao montar componente
  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      const response = await api.getProfile();
      setProfile(response.data);
      setAvatarPreview(response.data.avatar || '');
      
      // Carregar preferências
      const prefsResponse = await api.getPreferences();
      setPreferences(prefsResponse.data);
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os dados do perfil',
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

  // Validação de senha
  const validatePassword = (): boolean => {
    if (passwordData.currentPassword.length < 8) {
      toast({
        title: 'Senha atual inválida',
        description: 'A senha atual deve ter pelo menos 8 caracteres',
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

    if (!hasUpperCase || !hasLowerCase || !hasNumber) {
      toast({
        title: 'Senha fraca',
        description: 'A senha deve conter letras maiúsculas, minúsculas e números',
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
      await api.updateProfile(profile);
      toast({
        title: 'Sucesso!',
        description: 'Perfil atualizado com sucesso',
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o perfil',
        variant: 'destructive'
      });
    } finally {
      setIsLoadingProfile(false);
    }
  };

  // Upload de avatar
  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Arquivo inválido',
        description: 'Por favor, selecione uma imagem',
        variant: 'destructive'
      });
      return;
    }

    // Validar tamanho (máximo 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: 'Arquivo muito grande',
        description: 'A imagem deve ter no máximo 2MB',
        variant: 'destructive'
      });
      return;
    }

    // Criar preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload para servidor
    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const response = await api.uploadAvatar(formData);
      setProfile(prev => ({ ...prev, avatar: response.data.avatar }));
      toast({
        title: 'Sucesso!',
        description: 'Avatar atualizado com sucesso',
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível fazer upload do avatar',
        variant: 'destructive'
      });
    }
  };

  // Alterar senha
  const handleChangePassword = async () => {
    if (!validatePassword()) return;

    setIsLoadingPassword(true);
    try {
      await api.changePassword(passwordData);
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
        title: 'Erro',
        description: error.response?.data?.message || 'Não foi possível alterar a senha',
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
      await api.updatePreferences(preferences);
      toast({
        title: 'Sucesso!',
        description: 'Preferências atualizadas com sucesso',
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar as preferências',
        variant: 'destructive'
      });
    } finally {
      setIsLoadingPreferences(false);
    }
  };

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8 md:py-12">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Meu Perfil</h1>
        <p className="text-muted-foreground">Gerencie suas informações pessoais e preferências</p>
      </div>

      <Tabs defaultValue="personal" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 gap-2">
          <TabsTrigger value="personal" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Pessoal</span>
          </TabsTrigger>
          <TabsTrigger value="avatar" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            <span className="hidden sm:inline">Avatar</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            <span className="hidden sm:inline">Segurança</span>
          </TabsTrigger>
          <TabsTrigger value="preferences" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Preferências</span>
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
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  disabled
                  className="bg-muted"
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
                  onChange={(e) => setProfile(prev => ({ ...prev, graduationYear: parseInt(e.target.value) }))}
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
                <Avatar className="h-32 w-32 md:h-40 md:w-40">
                  <AvatarImage src={avatarPreview || profile.avatar} alt={profile.name} />
                  <AvatarFallback className="text-4xl">
                    {profile.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>

                <div className="text-center space-y-2">
                  <Label htmlFor="avatar-upload" className="cursor-pointer">
                    <div className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
                      <Upload className="h-4 w-4" />
                      Escolher Imagem
                    </div>
                  </Label>
                  <Input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarUpload}
                  />
                  <p className="text-sm text-muted-foreground">
                    PNG, JPG ou WEBP. Máximo 2MB.
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
                />
                <p className="text-sm text-muted-foreground">
                  Mínimo 8 caracteres, com letras maiúsculas, minúsculas e números
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
                    className="px-3 py-2 border rounded-md"
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
