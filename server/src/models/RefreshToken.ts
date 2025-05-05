// RefreshToken model for storing JWT refresh tokens securely
import { Model, DataTypes, Sequelize } from "sequelize";

interface RefreshTokenAttributes {
  id: number;
  userId: number; // References the user who owns the token
  token: string; // Hashed refresh token
  device?: string; // Optional device/user-agent info
  expiresAt: Date; // Expiry timestamp
  createdAt?: Date;
  updatedAt?: Date;
}

interface RefreshTokenCreationAttributes
  extends Omit<RefreshTokenAttributes, "id"> {}

class RefreshToken
  extends Model<RefreshTokenAttributes, RefreshTokenCreationAttributes>
  implements RefreshTokenAttributes
{
  public id!: number;
  public userId!: number;
  public token!: string;
  public device?: string;
  public expiresAt!: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  static initModel(sequelize: Sequelize): typeof RefreshToken {
    RefreshToken.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        userId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          field: "user_id",
          references: {
            model: "users",
            key: "id",
          },
        },
        token: {
          type: DataTypes.STRING(255),
          allowNull: false,
        },
        device: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        expiresAt: {
          type: DataTypes.DATE,
          allowNull: false,
          field: "expires_at",
        },
        createdAt: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
          field: "created_at",
        },
        updatedAt: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
          field: "updated_at",
        },
      },
      {
        sequelize,
        tableName: "refresh_tokens",
        underscored: true,
        indexes: [
          { fields: ["user_id"], name: "refresh_tokens_user_id_idx" },
          { fields: ["token"], name: "refresh_tokens_token_idx" },
        ],
      }
    );
    return RefreshToken;
  }
}

export { RefreshToken, RefreshTokenAttributes, RefreshTokenCreationAttributes };
