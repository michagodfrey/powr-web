import { Model, DataTypes, Sequelize } from "sequelize";
import { Workout } from "./Workout";
import { WorkoutExercise } from "./WorkoutExercise";
import { Set } from "./Set";

interface ExerciseAttributes {
  id: number;
  userId: number;
  name: string;
  description?: string;
  isArchived: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  workouts?: Workout[];
  workoutExercise?: WorkoutExercise;
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
  public isArchived!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public workouts?: Workout[];
  public workoutExercise?: WorkoutExercise;

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

  static associateModels(): void {
    Exercise.belongsToMany(Workout, {
      through: WorkoutExercise,
      as: "workouts",
      foreignKey: "exerciseId",
    });

    Exercise.hasOne(WorkoutExercise, {
      as: "workoutExercise",
      foreignKey: "exerciseId",
    });
  }
}

export { Exercise };
