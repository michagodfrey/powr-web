import { Model, DataTypes, Sequelize } from "sequelize";
import { Exercise } from "./Exercise";
import { WorkoutExercise } from "./WorkoutExercise";
import { Set } from "./Set";

interface WorkoutAttributes {
  id: number;
  userId: number;
  name?: string;
  notes?: string;
  startTime: Date;
  endTime?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  exercises?: Exercise[];
}

interface WorkoutCreationAttributes extends Omit<WorkoutAttributes, "id"> {}

class Workout
  extends Model<WorkoutAttributes, WorkoutCreationAttributes>
  implements WorkoutAttributes
{
  public id!: number;
  public userId!: number;
  public name!: string;
  public notes!: string;
  public startTime!: Date;
  public endTime!: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public exercises?: Exercise[];

  static initModel(sequelize: Sequelize): typeof Workout {
    Workout.init(
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
          allowNull: true,
        },
        notes: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        startTime: {
          type: DataTypes.DATE,
          allowNull: false,
          field: "start_time",
        },
        endTime: {
          type: DataTypes.DATE,
          allowNull: true,
          field: "end_time",
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
        tableName: "workouts",
        underscored: true,
      }
    );

    return Workout;
  }

  static associateModels(): void {
    Workout.belongsToMany(Exercise, {
      through: WorkoutExercise,
      as: "exercises",
      foreignKey: "workoutId",
    });
  }
}

export { Workout };
