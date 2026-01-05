import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import User from './User';

/**
 * Interface dos atributos do DailyMission (template)
 */
export interface DailyMissionAttributes {
  id:  string;
  title: string;
  description: string;
  xpReward: number;
  type: 'daily' | 'weekly';
  requirement: {
    action: 'create_prompt' | 'study_session' | 'complete_review' | 'use_prompt' | 'login_streak';
    target: number;
  };
  createdAt?:  Date;
  updatedAt?:  Date;
}

/**
 * Interface para criação de DailyMission
 */
interface DailyMissionCreationAttributes extends Optional<DailyMissionAttributes, 'id'> {}

/**
 * Model de DailyMission (template de missões)
 */
export class DailyMission
  extends Model<DailyMissionAttributes, DailyMissionCreationAttributes>
  implements DailyMissionAttributes
{
  public id! : string;
  public title! : string;
  public description! : string;
  public xpReward!: number;
  public type!: 'daily' | 'weekly';
  public requirement!:  {
    action: 'create_prompt' | 'study_session' | 'complete_review' | 'use_prompt' | 'login_streak';
    target: number;
  };

  public readonly createdAt! : Date;
  public readonly updatedAt! : Date;
}

/**
 * Inicialização do modelo
 */
DailyMission.init(
  {
    id: {
      type:  DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey:  true,
      allowNull: false,
    },
    title:  {
      type: DataTypes. STRING(200),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Título é obrigatório',
        },
        len: {
          args: [3, 200],
          msg: 'Título deve ter entre 3 e 200 caracteres',
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
    xpReward: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: {
          args: [1],
          msg: 'Recompensa de XP deve ser no mínimo 1',
        },
        max: {
          args: [1000],
          msg: 'Recompensa de XP máxima é 1000',
        },
      },
      field: 'xp_reward',
    },
    type: {
      type: DataTypes. ENUM('daily', 'weekly'),
      allowNull: false,
      validate: {
        isIn: {
          args: [['daily', 'weekly']],
          msg: 'Tipo deve ser daily ou weekly',
        },
      },
    },
    requirement: {
      type: DataTypes.JSONB,
      allowNull: false,
      validate: {
        isValidRequirement(value:  any) {
          if (!value || typeof value !== 'object') {
            throw new Error('Requirement deve ser um objeto');
          }
          const validActions = [
            'create_prompt',
            'study_session',
            'complete_review',
            'use_prompt',
            'login_streak',
          ];
          if (!validActions.includes(value.action)) {
            throw new Error('Ação de requirement inválida');
          }
          if (typeof value.target !== 'number' || value. target < 1) {
            throw new Error('Target deve ser um número positivo');
          }
        },
      },
    },
  },
  {
    sequelize,
    tableName: 'daily_missions',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        name: 'daily_missions_type_idx',
        fields: ['type'],
      },
    ],
  }
);

/**
 * Interface dos atributos do UserMission (progresso do usuário)
 */
export interface UserMissionAttributes {
  id: string;
  userId: string;
  missionId: string;
  progress:  number;
  isCompleted: boolean;
  completedAt?: Date;
  expiresAt:  Date;
  createdAt?:  Date;
  updatedAt?:  Date;
}

/**
 * Interface para criação de UserMission
 */
interface UserMissionCreationAttributes
  extends Optional<UserMissionAttributes, 'id' | 'progress' | 'isCompleted' | 'completedAt'> {}

/**
 * Model de UserMission (missões atribuídas ao usuário)
 */
export class UserMission
  extends Model<UserMissionAttributes, UserMissionCreationAttributes>
  implements UserMissionAttributes
{
  public id!:  string;
  public userId!:  string;
  public missionId!: string;
  public progress!: number;
  public isCompleted!: boolean;
  public completedAt?: Date;
  public expiresAt! : Date;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Associação com o template da missão
  public mission?: DailyMission;
}

/**
 * Inicialização do modelo UserMission
 */
UserMission.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes. UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    userId: {
      type:  DataTypes.UUID,
      allowNull: false,
      references:  {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      field: 'user_id',
    },
    missionId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'daily_missions',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      field: 'mission_id',
    },
    progress: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: {
          args: [0],
          msg: 'Progresso não pode ser negativo',
        },
      },
    },
    isCompleted: {
      type: DataTypes. BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'is_completed',
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'completed_at',
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'expires_at',
    },
  },
  {
    sequelize,
    tableName: 'user_missions',
    timestamps:  true,
    underscored:  true,
    indexes: [
      {
        name: 'user_missions_user_id_idx',
        fields: ['user_id'],
      },
      {
        name: 'user_missions_mission_id_idx',
        fields: ['mission_id'],
      },
      {
        name: 'user_missions_is_completed_idx',
        fields: ['is_completed'],
      },
      {
        name:  'user_missions_expires_at_idx',
        fields: ['expires_at'],
      },
    ],
  }
);

/**
 * Relacionamentos
 */
DailyMission.belongsToMany(User, {
  through: UserMission,
  foreignKey: 'missionId',
  otherKey: 'userId',
  as: 'users',
});

User.belongsToMany(DailyMission, {
  through: UserMission,
  foreignKey:  'userId',
  otherKey: 'missionId',
  as: 'missions',
});

UserMission.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
});

UserMission.belongsTo(DailyMission, {
  foreignKey: 'missionId',
  as:  'mission',
});

export default DailyMission;