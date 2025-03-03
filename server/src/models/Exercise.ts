import { Model, DataTypes } from "sequelize";
import sequelize from "../config/database";
import User from "./User";

interface ExerciseAttributes {
  id: number;
  userId: number;
  name: string;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ExerciseCreationAttributes extends Omit<ExerciseAttributes, "id"> {}

class Exercise
  extends Model<ExerciseAttributes, ExerciseCreationAttributes>
  implements ExerciseAttributes
{
  public id!: number;
  public userId!: number;
  public name!: string;
  public description!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Exercise.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: "exercises",
    indexes: [
      {
        unique: true,
        fields: ["userId", "name"],
        name: "exercises_user_id_name_unique",
      },
    ],
  }
);

// Define associations
Exercise.belongsTo(User, { foreignKey: "userId", as: "user" });
User.hasMany(Exercise, { foreignKey: "userId", as: "exercises" });

export default Exercise;
