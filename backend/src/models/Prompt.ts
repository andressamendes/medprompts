import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import User from './User'; // ← CORREÇÃO: import default ao invés de named import

/**
 * Interface dos atributos do Prompt
 */
export interface PromptAttributes {
  id: string;
  userId: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  isFavorite: boolean;
  timesUsed: number;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Interface para criação de Prompt (campos opcionais)
 */
interface PromptCreationAttributes
  extends Optional<
    PromptAttributes,
    'id' | 'tags' | 'isFavorite' | 'timesUsed' | 'createdAt' | 'updatedAt'
  > {}

/**
 * Model de Prompt
 */
export class Prompt
  extends Model<PromptAttributes, PromptCreationAttributes>
  implements PromptAttributes
{
  public id!: string;
  public userId!: string;
  public title!: string;
  public content!: string;
  public category!: string;
  public tags!: string[];
  public isFavorite!: boolean;
  public timesUsed!: number;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
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
      allowNull: false,
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
            'Anamnese',
            'Diagnóstico',
            'Tratamento',
            'Pediatria',
            'Ginecologia',
            'Cardiologia',
            'Neurologia',
            'Ortopedia',
            'Emergência',
            'Cirurgia',
            'Clínica Médica',
            'Estudos de Caso',
            'Revisão',
            'Outros',
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
