import { Model, DataTypes, Optional } from 'sequelize';
import bcrypt from 'bcrypt';
import { sequelize } from '../config/database';
import { logger } from '../utils/logger';

// Atributos do modelo User
interface UserAttributes {
  id: string;
  name: string;
  email: string;
  password: string;
  university?: string;
  graduationYear?: number;
  xp: number;
  level: number;
  createdAt?: Date;
  updatedAt?: Date;
}

// Atributos opcionais para criação
interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'xp' | 'level'> {}

// Modelo User
class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  declare id: string;
  declare name: string;
  declare email: string;
  declare password: string;
  declare university?: string;
  declare graduationYear?: number;
  declare xp: number;
  declare level: number;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  // Método para comparar senha
  public async comparePassword(candidatePassword: string): Promise<boolean> {
    try {
      logger.info('🔐 Comparando senhas', {
        hasPasswordStored: !!this.password,
        passwordLength: this.password?.length || 0,
        candidatePasswordLength: candidatePassword.length,
      });

      const isMatch = await bcrypt.compare(candidatePassword, this.password);
      
      logger.info(isMatch ? '✅ Senha correta' : '❌ Senha incorreta');
      
      return isMatch;
    } catch (error: any) {
      logger.error('❌ Erro ao comparar senha', { 
        error: error.message,
        stack: error.stack,
      });
      return false;
    }
  }
}

// Inicializar modelo
User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    university: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    graduationYear: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 2020,
        max: 2050,
      },
    },
    xp: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
    level: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'users',
    timestamps: true,
    hooks: {
      beforeCreate: async (user: User) => {
        if (user.password) {
          logger.info('🔐 Hasheando senha antes de criar usuário', {
            email: user.email,
          });
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
          logger.info('✅ Senha hasheada com sucesso');
        }
      },
      beforeUpdate: async (user: User) => {
        if (user.changed('password')) {
          logger.info('🔐 Hasheando senha antes de atualizar usuário', {
            email: user.email,
          });
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
          logger.info('✅ Senha hasheada com sucesso');
        }
      },
    },
  }
);

export default User;
