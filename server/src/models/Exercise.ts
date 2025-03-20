// Exercise model representing user-created exercises in the application
// Stores exercise details and maintains relationships with workout sessions
import { Model, DataTypes, Sequelize } from "sequelize";
import { Set } from "./Set";
import { WorkoutSession } from "./WorkoutSession";

// Base attributes required for an Exercise instance
interface ExerciseAttributes {
  id: number;
  userId: number; // References the user who created the exercise
  name: string; // Name of the exercise (unique per user)
  description?: string; // Optional description of the exercise
  isArchived: boolean; // Soft deletion flag
  createdAt?: Date;
  updatedAt?: Date;
  workoutSessions?: WorkoutSession[]; // Associated workout history
}

// Attributes required when creating a new Exercise (excludes auto-generated fields)
interface ExerciseCreationAttributes extends Omit<ExerciseAttributes, "id"> {}

class Exercise
  extends Model<ExerciseAttributes, ExerciseCreationAttributes>
  implements ExerciseAttributes
{
  // Required field declarations
  public id!: number;
  public userId!: number;
  public name!: string;
  public description!: string;
  public isArchived!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public workoutSessions?: WorkoutSession[];

  // Initialize the model's schema and configuration
  static initModel(sequelize: Sequelize): typeof Exercise {
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
            model: "users",
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
        isArchived: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
          field: "is_archived",
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
        tableName: "exercises",
        underscored: true,
        indexes: [
          {
            unique: true,
            fields: ["user_id", "name"],
            name: "exercises_user_id_name_unique",
          },
        ],
      }
    );
    return Exercise;
  }
}

export { Exercise };
