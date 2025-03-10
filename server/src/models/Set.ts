import { Model, DataTypes, Sequelize } from "sequelize";

interface SetAttributes {
  id: number;
  workoutExerciseId: number;
  weight: number;
  reps: number;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface SetCreationAttributes extends Omit<SetAttributes, "id"> {}

class Set
  extends Model<SetAttributes, SetCreationAttributes>
  implements SetAttributes
{
  public id!: number;
  public workoutExerciseId!: number;
  public weight!: number;
  public reps!: number;
  public notes!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Calculate volume for this set
  calculateVolume(): number {
    return this.weight * this.reps;
  }

  static initModel(sequelize: Sequelize): typeof Set {
    Set.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        workoutExerciseId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          field: "workout_exercise_id",
          references: {
            model: "workout_exercises",
            key: "id",
          },
        },
        weight: {
          type: DataTypes.DECIMAL(10, 2),
          allowNull: false,
        },
        reps: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        notes: {
          type: DataTypes.TEXT,
          allowNull: true,
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
        tableName: "sets",
        underscored: true,
      }
    );
    return Set;
  }
}

export { Set };
