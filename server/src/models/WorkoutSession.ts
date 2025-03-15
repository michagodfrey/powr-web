import { Model, DataTypes, Sequelize } from "sequelize";
import { User } from "./User";
import { Exercise } from "./Exercise";
import { Set } from "./Set";
import { normalizeVolume } from "../utils/volumeCalculation";

interface WorkoutSessionAttributes {
  id: number;
  userId: number;
  exerciseId: number;
  date: Date;
  notes?: string;
  totalVolume: number;
  unit: "kg" | "lb";
  createdAt?: Date;
  updatedAt?: Date;
}

interface WorkoutSessionCreationAttributes
  extends Omit<WorkoutSessionAttributes, "id"> {}

class WorkoutSession
  extends Model<WorkoutSessionAttributes, WorkoutSessionCreationAttributes>
  implements WorkoutSessionAttributes
{
  public id!: number;
  public userId!: number;
  public exerciseId!: number;
  public date!: Date;
  public notes!: string;
  public totalVolume!: number;
  public unit!: "kg" | "lb";
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  get totalVolumeAsNumber(): number {
    return normalizeVolume(this.getDataValue("totalVolume"));
  }

  set totalVolumeValue(value: number | string) {
    this.setDataValue("totalVolume", normalizeVolume(value));
  }

  static initModel(sequelize: Sequelize): typeof WorkoutSession {
    WorkoutSession.init(
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
        exerciseId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          field: "exercise_id",
          references: {
            model: "exercises",
            key: "id",
          },
        },
        date: {
          type: DataTypes.DATE,
          allowNull: false,
        },
        notes: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        totalVolume: {
          type: DataTypes.DECIMAL(10, 2),
          allowNull: false,
          field: "total_volume",
          defaultValue: 0,
          validate: {
            isNonNegative(value: number) {
              if (value < 0) {
                throw new Error("Total volume cannot be negative");
              }
            },
          },
        },
        unit: {
          type: DataTypes.STRING(2),
          allowNull: false,
          validate: {
            isIn: [["kg", "lb"]],
          },
        },
        createdAt: {
          type: DataTypes.DATE,
          allowNull: false,
          field: "created_at",
          defaultValue: DataTypes.NOW,
        },
        updatedAt: {
          type: DataTypes.DATE,
          allowNull: false,
          field: "updated_at",
          defaultValue: DataTypes.NOW,
        },
      },
      {
        sequelize,
        tableName: "workout_sessions",
        underscored: true,
        indexes: [
          {
            fields: ["user_id", "exercise_id", "date"],
            name: "workout_sessions_user_exercise_date_idx",
          },
        ],
      }
    );
    return WorkoutSession;
  }

  static associateModels(): void {
    WorkoutSession.belongsTo(User, {
      foreignKey: "user_id",
      as: "user",
    });

    WorkoutSession.belongsTo(Exercise, {
      foreignKey: "exercise_id",
      as: "exercise",
    });

    WorkoutSession.hasMany(Set, {
      foreignKey: "session_id",
      as: "sets",
    });
  }
}

export { WorkoutSession };
