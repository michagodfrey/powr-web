import { Model, DataTypes, Sequelize } from "sequelize";
import { Set as WorkoutSet } from "./Set";
import { Workout } from "./Workout";
import { Exercise } from "./Exercise";

interface WorkoutExerciseAttributes {
  id: number;
  workoutId: number;
  exerciseId: number;
  notes?: string;
  order: number;
  createdAt?: Date;
  updatedAt?: Date;
  sets?: WorkoutSet[];
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
  public sets?: WorkoutSet[];

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

  static associateModels(): void {
    WorkoutExercise.hasMany(WorkoutSet, {
      as: "sets",
      foreignKey: "workoutExerciseId",
      onDelete: "CASCADE",
    });

    WorkoutExercise.belongsTo(Workout, {
      foreignKey: "workoutId",
    });

    WorkoutExercise.belongsTo(Exercise, {
      foreignKey: "exerciseId",
    });
  }
}

export { WorkoutExercise };
