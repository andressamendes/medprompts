/**
 * Sistema de Geração Contextual Inteligente
 * Barrel export de todos os módulos
 */

// Parser Semântico
export { SemanticParser, getSemanticParser, parseUserInput } from './semanticParser';

// Motor de Contexto
export { ContextEngine, createContextEngine } from './contextEngine';

// Adaptador de Prompts
export { PromptAdapter, createPromptAdapter, preparePromptForExecution } from './promptAdapter';
