import { Model, DataTypes, Sequelize } from "sequelize";
import { User } from "./User";
import { Exercise } from "./Exercise";

interface WorkoutSetData {
  weight: number;
  reps: number;
  unit: "kg" | "lb";
}

interface WorkoutSessionAttributes {
  id: number;
  userId: number;
  exerciseId: number;
  date: Date;
  notes?: string;
  sets: WorkoutSetData[];
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
  public sets!: WorkoutSetData[];
  public totalVolume!: number;
  public unit!: "kg" | "lb";
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Calculate total volume for the session
  public calculateTotalVolume(): number {
    return this.sets.reduce((total, set) => {
      const weight = set.unit === "lb" ? set.weight * 0.453592 : set.weight; // Convert to kg if needed
      return total + weight * set.reps;
    }, 0);
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
        sets: {
          type: DataTypes.JSONB,
          allowNull: false,
          defaultValue: [],
        },
        totalVolume: {
          type: DataTypes.DECIMAL(10, 2),
          allowNull: false,
          field: "total_volume",
          defaultValue: 0,
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
        hooks: {
          beforeSave: async (session: WorkoutSession) => {
            session.totalVolume = session.calculateTotalVolume();
          },
        },
      }
    );
    return WorkoutSession;
  }
}

export { WorkoutSession };
