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
      field: "user_id",
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
        fields: ["user_id", "name"],
        name: "exercises_user_id_name_unique",
      },
    ],
  }
);

// Define associations
Exercise.belongsTo(User, { foreignKey: "user_id", as: "user" });
User.hasMany(Exercise, { foreignKey: "user_id", as: "exercises" });

export default Exercise;
