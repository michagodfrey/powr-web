import { Model, DataTypes, Sequelize } from "sequelize";
import { User } from "./User";

interface SessionAttributes {
  id: number;
  userId: number;
  expires: Date;
  data: string;
  createdAt?: Date;
}

interface SessionCreationAttributes extends Omit<SessionAttributes, "id"> {}

class Session
  extends Model<SessionAttributes, SessionCreationAttributes>
  implements SessionAttributes
{
  public id!: number;
  public userId!: number;
  public expires!: Date;
  public data!: string;
  public readonly createdAt!: Date;

  static initModel(sequelize: Sequelize): typeof Session {
    Session.init(
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
        expires: {
          type: DataTypes.DATE,
          allowNull: false,
        },
        data: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
        createdAt: {
          type: DataTypes.DATE,
          allowNull: false,
          field: "created_at",
          defaultValue: DataTypes.NOW,
        },
      },
      {
        sequelize,
        tableName: "user_sessions",
        underscored: true,
        timestamps: true,
        freezeTableName: true,
        updatedAt: false, // This table doesn't use updated_at
        indexes: [
          {
            fields: ["expires"],
            name: "idx_user_sessions_expires",
          },
        ],
      }
    );
    return Session;
  }

  static associateModels(): void {
    Session.belongsTo(User, { foreignKey: "user_id", as: "user" });
    User.hasMany(Session, { foreignKey: "user_id", as: "sessions" });
  }
}

export { Session };
