import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import User from './User';

/**
 * Interface para variáveis do prompt (campos de preenchimento)
 */
export interface PromptVariable {
  key: string;          // Ex: "{{PACIENTE}}"
  label: string;        // Ex: "Nome do Paciente"
  type: 'text' | 'number' | 'textarea' | 'select';
  options?: string[];   // Para tipo 'select'
  placeholder?: string; // Placeholder do campo
  required?: boolean;   // Se o campo é obrigatório
}

/**
 * Interface dos atributos do Prompt
 */
export interface PromptAttributes {
  id: string;
  userId: string | null;  // NULL para prompts do sistema
  title: string;
  description: string;
  content: string;
  category: string;
  tags: string[];
  variables: PromptVariable[];  // ← NOVO: Campos de preenchimento
  isSystemPrompt: boolean;      // ← NOVO: Indica se é prompt do sistema
  isFavorite: boolean;
  timesUsed: number;
  recommendedAI?: string;       // ← NOVO: IA recomendada
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Interface para criação de Prompt (campos opcionais)
 */
interface PromptCreationAttributes
  extends Optional<
    PromptAttributes,
    'id' | 'userId' | 'description' | 'tags' | 'variables' | 'isSystemPrompt' | 'isFavorite' | 'timesUsed' | 'recommendedAI' | 'createdAt' | 'updatedAt'
  > {}

/**
 * Model de Prompt
 */
export class Prompt
  extends Model<PromptAttributes, PromptCreationAttributes>
  implements PromptAttributes
{
  public id!: string;
  public userId!: string | null;
  public title!: string;
  public description!: string;
  public content!: string;
  public category!: string;
  public tags!: string[];
  public variables!: PromptVariable[];
  public isSystemPrompt!: boolean;
  public isFavorite!: boolean;
  public timesUsed!: number;
  public recommendedAI?: string;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  /**
   * Método auxiliar para processar variáveis no conteúdo
   */
  public fillVariables(values: Record<string, string>): string {
    let filledContent = this.content;
    
    this.variables.forEach((variable) => {
      const value = values[variable.key] || '';
      filledContent = filledContent.replace(new RegExp(variable.key, 'g'), value);
    });
    
    return filledContent;
  }
}

/**
 * Inicialização do modelo
 */
Prompt.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: true,  // ← ALTERADO: permite NULL para prompts do sistema
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      field: 'user_id',
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Título é obrigatório',
        },
        len: {
          args: [3, 255],
          msg: 'Título deve ter entre 3 e 255 caracteres',
        },
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: '',
      validate: {
        len: {
          args: [0, 500],
          msg: 'Descrição deve ter no máximo 500 caracteres',
        },
      },
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Conteúdo é obrigatório',
        },
        len: {
          args: [10, 10000],
          msg: 'Conteúdo deve ter entre 10 e 10.000 caracteres',
        },
      },
    },
    category: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Categoria é obrigatória',
        },
        isIn: {
          args: [[
            'estudos',
            'clinica',
            'anamnese',
            'diagnostico',
            'tratamento',
            'pediatria',
            'ginecologia',
            'cardiologia',
            'neurologia',
            'ortopedia',
            'emergencia',
            'cirurgia',
            'clinica-medica',
            'estudos-caso',
            'revisao',
            'outros',
          ]],
          msg: 'Categoria inválida',
        },
      },
    },
    tags: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false,
      defaultValue: [],
      validate: {
        isValidTags(value: string[]) {
          if (!Array.isArray(value)) {
            throw new Error('Tags deve ser um array');
          }
          if (value.length > 10) {
            throw new Error('Máximo de 10 tags permitidas');
          }
          value.forEach((tag) => {
            if (typeof tag !== 'string' || tag.length < 2 || tag.length > 50) {
              throw new Error('Cada tag deve ter entre 2 e 50 caracteres');
            }
          });
        },
      },
    },
    variables: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
      validate: {
        isValidVariables(value: PromptVariable[]) {
          if (!Array.isArray(value)) {
            throw new Error('Variables deve ser um array');
          }
          if (value.length > 20) {
            throw new Error('Máximo de 20 variáveis permitidas');
          }
          value.forEach((variable) => {
            if (!variable.key || !variable.label || !variable.type) {
              throw new Error('Cada variável deve ter key, label e type');
            }
            if (!['text', 'number', 'textarea', 'select'].includes(variable.type)) {
              throw new Error('Tipo de variável inválido');
            }
          });
        },
      },
    },
    isSystemPrompt: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'is_system_prompt',
    },
    isFavorite: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'is_favorite',
    },
    timesUsed: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: {
          args: [0],
          msg: 'Número de usos não pode ser negativo',
        },
      },
      field: 'times_used',
    },
    recommendedAI: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'recommended_ai',
      validate: {
        isIn: {
          args: [[
            'ChatGPT',
            'Claude',
            'Gemini',
            'Perplexity',
            'NotebookLM',
            null,
          ]],
          msg: 'IA recomendada inválida',
        },
      },
    },
  },
  {
    sequelize,
    tableName: 'prompts',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        name: 'prompts_user_id_idx',
        fields: ['user_id'],
      },
      {
        name: 'prompts_category_idx',
        fields: ['category'],
      },
      {
        name: 'prompts_is_favorite_idx',
        fields: ['is_favorite'],
      },
      {
        name: 'prompts_is_system_prompt_idx',
        fields: ['is_system_prompt'],
      },
      {
        name: 'prompts_times_used_idx',
        fields: ['times_used'],
      },
    ],
  }
);

/**
 * Relacionamentos
 */
Prompt.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
});

User.hasMany(Prompt, {
  foreignKey: 'userId',
  as: 'prompts',
});

export default Prompt;
