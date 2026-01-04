import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import User from './User';

export interface StudySessionAttributes {
  id: string;
  userId: string;
  topic: string;
  durationMinutes: number;
  notes: string;
  promptsUsed: string[];
  status: 'pending' | 'completed';
  reviewCount: number;
  nextReviewDate: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

interface StudySessionCreationAttributes
  extends Optional<
    StudySessionAttributes,
    'id' | 'notes' | 'promptsUsed' | 'status' | 'reviewCount' | 'createdAt' | 'updatedAt'
  > {}

export class StudySession
  extends Model<StudySessionAttributes, StudySessionCreationAttributes>
  implements StudySessionAttributes
{
  public id!: string;
  public userId!: string;
  public topic!: string;
  public durationMinutes!: number;
  public notes!: string;
  public promptsUsed!: string[];
  public status!: 'pending' | 'completed';
  public reviewCount!: number;
  public nextReviewDate!: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

StudySession.init(
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
    topic: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Tópico é obrigatório',
        },
        len: {
          args: [3, 255],
          msg: 'Tópico deve ter entre 3 e 255 caracteres',
        },
      },
    },
    durationMinutes: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: {
          args: [1],
          msg: 'Duração mínima é 1 minuto',
        },
        max: {
          args: [480],
          msg: 'Duração máxima é 480 minutos (8 horas)',
        },
      },
      field: 'duration_minutes',
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: '',
      validate: {
        len: {
          args: [0, 5000],
          msg: 'Notas devem ter no máximo 5.000 caracteres',
        },
      },
    },
    promptsUsed: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false,
      defaultValue: [],
      validate: {
        isValidPrompts(value: string[]) {
          if (!Array.isArray(value)) {
            throw new Error('Prompts usados deve ser um array');
          }
          if (value.length > 50) {
            throw new Error('Máximo de 50 prompts por sessão');
          }
        },
      },
      field: 'prompts_used',
    },
    status: {
      type: DataTypes.ENUM('pending', 'completed'),
      allowNull: false,
      defaultValue: 'pending',
      validate: {
        isIn: {
          args: [['pending', 'completed']],
          msg: 'Status deve ser "pending" ou "completed"',
        },
      },
    },
    reviewCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: {
          args: [0],
          msg: 'Contador de revisões não pode ser negativo',
        },
      },
      field: 'review_count',
    },
    nextReviewDate: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'next_review_date',
    },
  },
  {
    sequelize,
    tableName: 'study_sessions',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        name: 'study_sessions_user_id_idx',
        fields: ['user_id'],
      },
      {
        name: 'study_sessions_status_idx',
        fields: ['status'],
      },
      {
        name: 'study_sessions_next_review_date_idx',
        fields: ['next_review_date'],
      },
      {
        name: 'study_sessions_created_at_idx',
        fields: ['created_at'],
      },
    ],
  }
);

StudySession.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
});

User.hasMany(StudySession, {
  foreignKey: 'userId',
  as: 'studySessions',
});

export default StudySession;
