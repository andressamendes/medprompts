import User from '../models/User';
import UserProgress from '../models/UserProgress';
import Prompt from '../models/Prompt';
import Badge, { UserBadge } from '../models/Badge';

describe('Models', () => {
  describe('User Model', () => {
    it('deve criar um usuário com senha hasheada', async () => {
      const user = await User.create({
        name: 'Test User',
        email: `test-${Date.now()}@example.com`,
        password: 'Senha123',
      });

      expect(user.id).toBeDefined();
      expect(user.password).not.toBe('Senha123'); // Deve estar hasheada
      expect(user.password.length).toBeGreaterThan(20); // Hash bcrypt
      expect(user.xp).toBe(0);
      expect(user.level).toBe(1);
    });

    it('deve validar email corretamente', async () => {
      await expect(
        User.create({
          name: 'Test',
          email: 'email-invalido',
          password: 'Senha123',
        })
      ).rejects.toThrow();
    });

    it('deve comparar senha corretamente', async () => {
      const user = await User.create({
        name: 'Test User',
        email: `compare-${Date.now()}@example.com`,
        password: 'Senha123',
      });

      const isValid = await user.comparePassword('Senha123');
      expect(isValid).toBe(true);

      const isInvalid = await user.comparePassword('senhaerrada');
      expect(isInvalid).toBe(false);
    });
  });

  describe('UserProgress Model', () => {
    let user: User;

    beforeEach(async () => {
      user = await User.create({
        name: 'Progress Test',
        email: `progress-${Date.now()}-${Math.random()}@example.com`,
        password: 'Senha123',
      });
    });

    it('deve criar progresso inicial', async () => {
      const progress = await UserProgress.create({
        userId: user.id,
        currentXP: 0,
        level: 1,
        totalXPEarned: 0,
        currentStreak: 0,
        longestStreak: 0,
        lastActivityDate: new Date(),
        xpHistory: [],
      });

      expect(progress.id).toBeDefined();
      expect(progress.currentXP).toBe(0);
      expect(progress.level).toBe(1);
      expect(progress.getXPToNextLevel()).toBe(100);
    });

    it('deve calcular XP para próximo nível corretamente', async () => {
      const progress = await UserProgress.create({
        userId: user.id,
        level: 5,
        currentXP: 0,
        totalXPEarned: 0,
        currentStreak: 0,
        longestStreak: 0,
        lastActivityDate: new Date(),
        xpHistory: [],
      });

      expect(progress.getXPToNextLevel()).toBe(500); // Level 5 * 100
    });

    it('deve adicionar XP e fazer level up', async () => {
      const progress = await UserProgress.create({
        userId: user.id,
        currentXP: 0,
        level: 1,
        totalXPEarned: 0,
        currentStreak: 0,
        longestStreak: 0,
        lastActivityDate: new Date(),
        xpHistory: [],
      });

      const leveledUp = progress.addXP(150, 'test');

      expect(leveledUp).toBe(true);
      expect(progress.level).toBe(2);
      expect(progress.currentXP).toBe(50); // 150 - 100
      expect(progress.totalXPEarned).toBe(150);
    });

    it('deve manter histórico de XP', async () => {
      const progress = await UserProgress.create({
        userId: user.id,
        currentXP: 0,
        level: 1,
        totalXPEarned: 0,
        currentStreak: 0,
        longestStreak: 0,
        lastActivityDate: new Date(),
        xpHistory: [],
      });

      progress.addXP(50, 'test1');
      progress.addXP(30, 'test2');

      expect(progress.xpHistory.length).toBeGreaterThan(0);
      const today = new Date().toISOString().split('T')[0];
      const todayEntry = progress.xpHistory.find((e) => e.date === today);
      expect(todayEntry).toBeDefined();
      expect(todayEntry?.xp).toBe(80);
    });

    it('deve atualizar streak corretamente', async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const progress = await UserProgress.create({
        userId: user.id,
        currentXP: 0,
        level: 1,
        totalXPEarned: 0,
        currentStreak: 1,
        longestStreak: 1,
        lastActivityDate: yesterday,
        xpHistory: [],
      });

      progress.updateStreak();

      expect(progress.currentStreak).toBe(2);
      expect(progress.longestStreak).toBe(2);
    });

    it('deve resetar streak se pular um dia', async () => {
      const twoDaysAgo = new Date();
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

      const progress = await UserProgress.create({
        userId: user.id,
        currentXP: 0,
        level: 1,
        totalXPEarned: 0,
        currentStreak: 5,
        longestStreak: 5,
        lastActivityDate: twoDaysAgo,
        xpHistory: [],
      });

      progress.updateStreak();

      expect(progress.currentStreak).toBe(1); // Reset
    });
  });

  describe('Prompt Model', () => {
    let user: User;

    beforeEach(async () => {
      user = await User.create({
        name: 'Prompt Test',
        email: `prompt-model-${Date.now()}-${Math.random()}@example.com`,
        password: 'Senha123',
      });
    });

    it('deve criar um prompt válido', async () => {
      const prompt = await Prompt.create({
        userId: user.id,
        title: 'Prompt de Teste',
        description: 'Descrição do prompt de teste',
        content: 'Conteúdo do prompt de teste com mais de 10 caracteres',
        category: 'anamnese', // ← CORRIGIDO: minúscula
        tags: ['teste'],
        variables: [], // ← ADICIONADO
        isSystemPrompt: false, // ← ADICIONADO
        isFavorite: false,
        timesUsed: 0,
      });

      expect(prompt.id).toBeDefined();
      expect(prompt.userId).toBe(user.id);
      expect(prompt.isFavorite).toBe(false);
      expect(prompt.timesUsed).toBe(0);
      expect(prompt.isSystemPrompt).toBe(false); // ← ADICIONADO
    });

    it('deve validar título mínimo', async () => {
      await expect(
        Prompt.create({
          userId: user.id,
          title: 'AB', // Menos de 3 chars
          content: 'Conteúdo válido',
          category: 'anamnese', // ← CORRIGIDO
        })
      ).rejects.toThrow();
    });

    it('deve validar categoria', async () => {
      await expect(
        Prompt.create({
          userId: user.id,
          title: 'Título Válido',
          content: 'Conteúdo válido',
          category: 'Categoria Inválida',
        })
      ).rejects.toThrow();
    });

    it('deve validar máximo de tags', async () => {
      await expect(
        Prompt.create({
          userId: user.id,
          title: 'Título Válido',
          content: 'Conteúdo válido',
          category: 'anamnese', // ← CORRIGIDO
          tags: [
            'tag1',
            'tag2',
            'tag3',
            'tag4',
            'tag5',
            'tag6',
            'tag7',
            'tag8',
            'tag9',
            'tag10',
            'tag11',
          ],
        })
      ).rejects.toThrow();
    });
  });

  describe('Badge Model', () => {
    it('deve criar um badge válido', async () => {
      const badge = await Badge.create({
        name: 'Badge Teste',
        description: 'Descrição do badge',
        icon: '🏆',
        category: 'bronze',
        requirement: { type: 'xp', target: 100 },
      });

      expect(badge.id).toBeDefined();
      expect(badge.category).toBe('bronze');
      expect(badge.requirement.type).toBe('xp');
      expect(badge.requirement.target).toBe(100);
    });

    it('deve validar categoria do badge', async () => {
      await expect(
        Badge.create({
          name: 'Badge Teste',
          description: 'Descrição',
          icon: '🏆',
          category: 'invalida' as any,
          requirement: { type: 'xp', target: 100 },
        })
      ).rejects.toThrow();
    });

    it('deve validar requirement', async () => {
      await expect(
        Badge.create({
          name: 'Badge Teste',
          description: 'Descrição',
          icon: '🏆',
          category: 'bronze',
          requirement: { type: 'invalido' as any, target: 100 },
        })
      ).rejects.toThrow();
    });
  });
});
