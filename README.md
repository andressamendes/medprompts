# 🩺 MedPrompts

<div align="center">

![MedPrompts Logo](https://img.shields.io/badge/MedPrompts-Medicina%20+%20IA-blue?style=for-the-badge)
[![Deploy](https://img.shields.io/badge/Deploy-GitHub%20Pages-success?style=for-the-badge)](https://andressamendes.github.io/medprompts/)
[![React](https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)

**[Acesse a aplicação em produção](https://andressamendes.github.io/medprompts/)**

</div>

---

## 📋 Sobre o Projeto

MedPrompts é uma aplicação web gamificada desenvolvida para facilitar o acesso e gerenciamento de prompts de IA especializados para estudantes de medicina. A plataforma oferece uma experiência interativa com sistema de progressão, conquistas e missões diárias.

### ✨ Funcionalidades Principais

#### 🎮 Sistema de Gamificação Completo
- **XP e Níveis**: Ganhe 10 XP ao usar qualquer prompt
- **5 Níveis Progressivos**: Iniciante → Estudante → Residente → Especialista → Mestre
- **Contador de Streak**: Bônus de XP para dias consecutivos (5 XP × dias)
- **Histórico de Uso**: Últimos 10 prompts usados com botão "Usar novamente"

#### 🏆 Sistema de Conquistas
- **12 Badges Diferentes**: Bronze, Prata e Ouro
- **Categorias de Badges**:
  - XP acumulado (100, 500, 1000)
  - Prompts usados (10, 50, 100)
  - Streak mantido (3, 7, 30 dias)
  - Níveis alcançados (2, 4, 5)
- **Recompensas em XP**: Cada badge desbloqueado concede XP extra

#### 🎯 Missões Diárias
- **3 Missões por Dia**: Renovadas automaticamente à meia-noite
- **Tipos de Missões**:
  - Usar X prompts no dia
  - Usar prompts de categoria específica
  - Manter streak ativo
- **Recompensas**: 20-50 XP por missão completada

#### 👤 Perfil Personalizado
- **Configuração de Perfil**: Nome, ano da graduação
- **Disciplinas em Andamento**: Selecione suas matérias atuais
- **Áreas de Interesse**: Especialidades que você quer explorar
- **Filtros Inteligentes**: Prompts relevantes ao seu perfil

#### 📚 Biblioteca de Prompts
- 🔍 Pesquisa avançada por título, descrição ou tags
- 🎨 Categorização por especialidades médicas
- 📱 Interface responsiva (mobile-first)
- ⚡ Campos dinâmicos para personalização de prompts
- 📋 Sistema de favoritos

---

## 🛠️ Tecnologias Utilizadas

### Frontend
- **React 18** - Biblioteca JavaScript para interfaces
- **TypeScript** - Tipagem estática
- **Vite** - Build tool ultrarrápido
- **Tailwind CSS** - Framework CSS utilitário

### Componentes UI
- **Radix UI** - Componentes acessíveis sem estilo
  - Dialog, Select, Progress, Checkbox
- **Lucide React** - Ícones modernos

### Persistência
- **LocalStorage** - Armazenamento local de dados
  - Progresso do usuário
  - Perfil do estudante
  - Badges conquistados
  - Missões diárias

### Deploy
- **GitHub Pages** - Hospedagem estática
- **GitHub Actions** - CI/CD automatizado

---

## 🚀 Começando

### Pré-requisitos
- Node.js 18+ 
- npm ou yarn

### Instalação

```bash
# Clone o repositório
git clone https://github.com/andressamendes/medprompts.git

# Entre no diretório
cd medprompts

# Instale as dependências
npm install

# Execute em modo desenvolvimento
npm run dev
