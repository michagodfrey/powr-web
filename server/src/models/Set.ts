// Individual set model representing a single set within a workout session
// Tracks weight, reps, and/or duration depending on the exercise type, plus the
// set's contribution to its session total
import { Model, DataTypes, Sequelize } from "sequelize";
import { WorkoutSession } from "./WorkoutSession";

export interface SetAttributes {
  id: number;
  sessionId: number; // References the parent workout session
  setNumber: number; // Order of the set within the session
  weight: number | null; // Weight used in the set (weighted exercises only)
  reps: number | null; // Number of repetitions performed (weighted and reps exercises)
  durationSeconds?: number | null; // Time held (timed exercises only)
  unit: "kg" | "lb"; // Weight unit (kilograms or pounds)
  volume: number; // Set's metric: weight * reps, reps, or seconds by exercise type
  notes?: string; // Optional notes for the set
  createdAt?: Date;
  updatedAt?: Date;
}

export interface SetCreationAttributes extends Omit<SetAttributes, "id"> {}

class Set
  extends Model<SetAttributes, SetCreationAttributes>
  implements SetAttributes
{
  // Required field declarations
  public id!: number;
  public sessionId!: number;
  public setNumber!: number;
  public weight!: number | null;
  public reps!: number | null;
  public durationSeconds!: number | null;
  public unit!: "kg" | "lb";
  public volume!: number;
  public notes!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Initialize the model's schema and configuration
  static initModel(sequelize: Sequelize): typeof Set {
    Set.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        sessionId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          field: "session_id",
          references: {
            model: "workout_sessions",
            key: "id",
          },
        },
        setNumber: {
          type: DataTypes.INTEGER,
          allowNull: false,
          field: "set_number",
        },
        weight: {
          type: DataTypes.DECIMAL(6, 2),
          allowNull: true,
        },
        reps: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },
        durationSeconds: {
          type: DataTypes.INTEGER,
          allowNull: true,
          field: "duration_seconds",
        },
        unit: {
          type: DataTypes.STRING(2),
          allowNull: false,
          validate: {
            isIn: [["kg", "lb"]],
          },
        },
        volume: {
          type: DataTypes.DECIMAL(10, 2),
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

  // Define model associations
  static associateModels(): void {
    Set.belongsTo(WorkoutSession, {
      foreignKey: "session_id",
      as: "session",
    });
  }
}

export { Set };
