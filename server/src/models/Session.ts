import { Model, DataTypes } from "sequelize";
import sequelize from "../config/database";
import { User }from "./User";

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
}

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
        model: User,
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
    tableName: "sessions",
    underscored: true,
    timestamps: true,
    freezeTableName: true,
    updatedAt: false, // This table doesn't use updated_at
    indexes: [
      {
        fields: ["expires"],
        name: "idx_sessions_expires",
      },
    ],
  }
);

// Define associations
Session.belongsTo(User, { foreignKey: "user_id", as: "user" });
User.hasMany(Session, { foreignKey: "user_id", as: "sessions" });

export default Session;
