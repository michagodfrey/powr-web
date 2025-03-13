import { Model, DataTypes, Sequelize } from "sequelize";
import { WorkoutSession } from "./WorkoutSession";

export interface SetAttributes {
  id: number;
  sessionId: number;
  setNumber: number;
  weight: number;
  reps: number;
  unit: "kg" | "lb";
  volume: number;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface SetCreationAttributes extends Omit<SetAttributes, "id"> {}

class Set
  extends Model<SetAttributes, SetCreationAttributes>
  implements SetAttributes
{
  public id!: number;
  public sessionId!: number;
  public setNumber!: number;
  public weight!: number;
  public reps!: number;
  public unit!: "kg" | "lb";
  public volume!: number;
  public notes!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

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
          allowNull: false,
        },
        reps: {
          type: DataTypes.INTEGER,
          allowNull: false,
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

  static associateModels(): void {
    Set.belongsTo(WorkoutSession, {
      foreignKey: "session_id",
      as: "session",
    });
  }
}

export { Set };
