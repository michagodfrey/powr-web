// User model for managing authenticated users and their preferences
// Stores user profile data from Google OAuth and application settings
import { Model, DataTypes, Sequelize } from "sequelize";

interface UserAttributes {
  id: number;
  email: string; // User's email address (unique)
  googleId?: string; // Google OAuth ID for authentication
  name: string; // User's display name
  picture?: string; // Profile picture URL from Google
  preferredUnit: "kg" | "lb"; // User's preferred weight unit
  passwordHash?: string; // Hashed password for email/password auth
  createdAt?: Date;
  updatedAt?: Date;
}

interface UserCreationAttributes extends Omit<UserAttributes, "id"> {}

class User
  extends Model<UserAttributes, UserCreationAttributes>
  implements UserAttributes
{
  // Required field declarations
  public id!: number;
  public email!: string;
  public googleId!: string;
  public name!: string;
  public picture!: string;
  public preferredUnit!: "kg" | "lb";
  public passwordHash?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Initialize the model's schema and configuration
  static initModel(sequelize: Sequelize): typeof User {
    User.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        email: {
          type: DataTypes.STRING(255),
          allowNull: false,
          unique: true,
        },
        googleId: {
          type: DataTypes.STRING(255),
          allowNull: true,
          unique: true,
          field: "google_id",
        },
        name: {
          type: DataTypes.STRING(255),
          allowNull: false,
        },
        picture: {
          type: DataTypes.STRING(1024),
          allowNull: true,
        },
        preferredUnit: {
          type: DataTypes.STRING(2),
          allowNull: false,
          defaultValue: "kg",
          field: "preferred_unit",
          validate: {
            isIn: [["kg", "lb"]],
          },
        },
        passwordHash: {
          type: DataTypes.STRING(255),
          allowNull: true,
          field: "password_hash",
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
        tableName: "users",
        underscored: true,
      }
    );
    return User;
  }
}

export { User };
