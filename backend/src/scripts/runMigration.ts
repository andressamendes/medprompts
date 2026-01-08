import { readFileSync } from 'fs';
import { join } from 'path';
import { sequelize } from '../config/database';

async function runMigration(migrationFile: string) {
  try {
    console.log(`🔄 Executando migration: ${migrationFile}`);
    
    // Lê o arquivo SQL diretamente da pasta src/migrations
    const migrationPath = join(__dirname, '../../src/migrations', migrationFile);
    console.log(`📁 Caminho: ${migrationPath}`);
    
    const sql = readFileSync(migrationPath, 'utf-8');
    
    // Remove comentários mas mantém o SQL intacto
    const cleanedSql = sql
      .split('\n')
      .filter(line => !line.trim().startsWith('--') || line.includes('='))
      .join('\n');
    
    // Divide por statements de forma mais inteligente
    // Separa apenas por ; que não estejam dentro de blocos $$ $$
    const statements: string[] = [];
    let currentStatement = '';
    let insideDollarBlock = false;
    
    const lines = cleanedSql.split('\n');
    
    for (const line of lines) {
      currentStatement += line + '\n';
      
      // Detecta início/fim de bloco $$
      if (line.includes('$$')) {
        insideDollarBlock = !insideDollarBlock;
      }
      
      // Se encontrar ; fora de bloco $$, é fim de statement
      if (line.includes(';') && !insideDollarBlock) {
        const trimmed = currentStatement.trim();
        if (trimmed.length > 0 && 
            !trimmed.toLowerCase().includes('down:') &&
            !trimmed.toLowerCase().includes('rollback') &&
            !trimmed.toLowerCase().includes('para executar o rollback')) {
          statements.push(trimmed);
        }
        currentStatement = '';
      }
    }
    
    console.log(`📝 ${statements.length} statements encontrados`);
    
    // Executa cada statement
    let executedCount = 0;
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      try {
        console.log(`⏳ Executando statement ${i + 1}/${statements.length}...`);
        await sequelize.query(statement);
        executedCount++;
      } catch (err: any) {
        // Ignora erros de "já existe" para ser idempotente
        if (err.message.includes('already exists') || 
            err.message.includes('já existe') ||
            err.message.includes('duplicate')) {
          console.log('⚠️  Item já existe, continuando...');
        } else {
          console.error('❌ Erro no statement:', statement.substring(0, 150) + '...');
          throw err;
        }
      }
    }
    
    console.log(`✅ Migration executada com sucesso! (${executedCount} statements)`);
    await sequelize.close();
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Erro ao executar migration:', error.message);
    await sequelize.close();
    process.exit(1);
  }
}

// Executa a migration
const migrationFile = process.argv[2] || '005_update_prompts_table.sql';
runMigration(migrationFile);
