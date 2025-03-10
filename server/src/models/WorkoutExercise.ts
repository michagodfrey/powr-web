import { Model, DataTypes, Sequelize } from "sequelize";

interface WorkoutExerciseAttributes {
  id: number;
  workoutId: number;
  exerciseId: number;
  notes?: string;
  order: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface WorkoutExerciseCreationAttributes
  extends Omit<WorkoutExerciseAttributes, "id"> {}

class WorkoutExercise
  extends Model<WorkoutExerciseAttributes, WorkoutExerciseCreationAttributes>
  implements WorkoutExerciseAttributes
{
  public id!: number;
  public workoutId!: number;
  public exerciseId!: number;
  public notes!: string;
  public order!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  static initModel(sequelize: Sequelize): typeof WorkoutExercise {
    WorkoutExercise.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        workoutId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          field: "workout_id",
          references: {
            model: "workouts",
            key: "id",
          },
        },
        exerciseId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          field: "exercise_id",
          references: {
            model: "exercises",
            key: "id",
          },
        },
        notes: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        order: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
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
        tableName: "workout_exercises",
        underscored: true,
        indexes: [
          {
            unique: true,
            fields: ["workout_id", "order"],
            name: "workout_exercises_workout_id_order_unique",
          },
        ],
      }
    );
    return WorkoutExercise;
  }
}

export { WorkoutExercise };
