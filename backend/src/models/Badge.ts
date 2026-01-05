import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import User from './User';

/**
 * Interface dos atributos do Badge
 */
export interface BadgeAttributes {
  id:  string;
  name: string;
  description: string;
  icon: string;
  category: 'bronze' | 'silver' | 'gold' | 'platinum';
  requirement: {
    type: 'xp' | 'streak' | 'sessions' | 'prompts' | 'level';
    target: number;
  };
  createdAt?:  Date;
  updatedAt?:  Date;
}

/**
 * Interface para criação de Badge
 */
interface BadgeCreationAttributes extends Optional<BadgeAttributes, 'id'> {}

/**
 * Model de Badge (template de conquistas)
 */
export class Badge
  extends Model<BadgeAttributes, BadgeCreationAttributes>
  implements BadgeAttributes
{
  public id!: string;
  public name!: string;
  public description!: string;
  public icon!: string;
  public category!: 'bronze' | 'silver' | 'gold' | 'platinum';
  public requirement!:  {
    type: 'xp' | 'streak' | 'sessions' | 'prompts' | 'level';
    target: number;
  };

  public readonly createdAt!:  Date;
  public readonly updatedAt! : Date;
}

/**
 * Inicialização do modelo
 */
Badge.init(
  {
    id: {
      type:  DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey:  true,
      allowNull: false,
    },
    name:  {
      type: DataTypes. STRING(100),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Nome é obrigatório',
        },
        len: {
          args: [3, 100],
          msg: 'Nome deve ter entre 3 e 100 caracteres',
        },
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Descrição é obrigatória',
        },
      },
    },
    icon:  {
      type: DataTypes. STRING(50),
      allowNull: false,
      defaultValue: '🏆',
    },
    category: {
      type: DataTypes.ENUM('bronze', 'silver', 'gold', 'platinum'),
      allowNull: false,
      validate: {
        isIn: {
          args: [['bronze', 'silver', 'gold', 'platinum']],
          msg: 'Categoria inválida',
        },
      },
    },
    requirement:  {
      type: DataTypes. JSONB,
      allowNull: false,
      validate: {
        isValidRequirement(value:  any) {
          if (!value || typeof value !== 'object') {
            throw new Error('Requirement deve ser um objeto');
          }
          const validTypes = ['xp', 'streak', 'sessions', 'prompts', 'level'];
          if (!validTypes.includes(value. type)) {
            throw new Error('Tipo de requirement inválido');
          }
          if (typeof value.target !== 'number' || value.target < 0) {
            throw new Error('Target deve ser um número positivo');
          }
        },
      },
    },
  },
  {
    sequelize,
    tableName: 'badges',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        name: 'badges_category_idx',
        fields: ['category'],
      },
    ],
  }
);

/**
 * Interface dos atributos do UserBadge (relação user <-> badge)
 */
export interface UserBadgeAttributes {
  id: string;
  userId: string;
  badgeId: string;
  unlockedAt:  Date;
  progress: number;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Interface para criação de UserBadge
 */
interface UserBadgeCreationAttributes
  extends Optional<UserBadgeAttributes, 'id' | 'progress'> {}

/**
 * Model de UserBadge (badges desbloqueados pelo usuário)
 */
export class UserBadge
  extends Model<UserBadgeAttributes, UserBadgeCreationAttributes>
  implements UserBadgeAttributes
{
  public id!:  string;
  public userId!:  string;
  public badgeId!: string;
  public unlockedAt!: Date;
  public progress!: number;

  public readonly createdAt!:  Date;
  public readonly updatedAt!: Date;
}

/**
 * Inicialização do modelo UserBadge
 */
UserBadge.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes. UUIDV4,
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
    badgeId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'badges',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate:  'CASCADE',
      field:  'badge_id',
    },
    unlockedAt:  {
      type: DataTypes. DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'unlocked_at',
    },
    progress:  {
      type: DataTypes. INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: {
          args: [0],
          msg: 'Progresso não pode ser negativo',
        },
      },
    },
  },
  {
    sequelize,
    tableName: 'user_badges',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        name: 'user_badges_user_id_idx',
        fields: ['user_id'],
      },
      {
        name:  'user_badges_badge_id_idx',
        fields:  ['badge_id'],
      },
      {
        name: 'user_badges_user_badge_unique',
        fields: ['user_id', 'badge_id'],
        unique:  true,
      },
    ],
  }
);

/**
 * Relacionamentos
 */
Badge.belongsToMany(User, {
  through: UserBadge,
  foreignKey: 'badgeId',
  otherKey: 'userId',
  as: 'users',
});

User.belongsToMany(Badge, {
  through: UserBadge,
  foreignKey: 'userId',
  otherKey: 'badgeId',
  as: 'badges',
});

UserBadge.belongsTo(User, {
  foreignKey:  'userId',
  as:  'user',
});

UserBadge.belongsTo(Badge, {
  foreignKey:  'badgeId',
  as: 'badge',
});

export default Badge;