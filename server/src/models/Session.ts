// Session model for storing user authentication sessions
// Manages session persistence and expiration in the database
import { Model, DataTypes, Sequelize } from "sequelize";

interface SessionAttributes {
  sid: string; // Session ID (primary key)
  sess: any; // Session data (stored as JSON)
  expire: Date; // Session expiration timestamp
}

interface SessionCreationAttributes extends SessionAttributes {}

class Session
  extends Model<SessionAttributes, SessionCreationAttributes>
  implements SessionAttributes
{
  // Required field declarations
  public sid!: string;
  public sess!: any;
  public expire!: Date;

  // Initialize the model's schema and configuration
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

  // No associations needed for session management
  static associateModels(): void {}
}

export { Session, SessionAttributes, SessionCreationAttributes };
