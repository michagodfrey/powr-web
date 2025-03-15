import { Model, DataTypes, Sequelize } from "sequelize";

interface SessionAttributes {
  sid: string;
  sess: any;
  expire: Date;
}

interface SessionCreationAttributes extends SessionAttributes {}

class Session
  extends Model<SessionAttributes, SessionCreationAttributes>
  implements SessionAttributes
{
  public sid!: string;
  public sess!: any;
  public expire!: Date;

  static initModel(sequelize: Sequelize): typeof Session {
    Session.init(
      {
        sid: {
          type: DataTypes.STRING,
          primaryKey: true,
        },
        sess: {
          type: DataTypes.JSON,
          allowNull: false,
        },
        expire: {
          type: DataTypes.DATE,
          allowNull: false,
        },
      },
      {
        sequelize,
        tableName: "session",
        timestamps: false,
        indexes: [
          {
            fields: ["expire"],
            name: "idx_session_expire",
          },
        ],
      }
    );
    return Session;
  }

  static associateModels(): void {
    // No associations needed for session table
  }
}

export { Session, SessionAttributes, SessionCreationAttributes };
