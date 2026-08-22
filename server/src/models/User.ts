// User model for managing authenticated users and their preferences
// The id is the same UUID Supabase Auth assigns in auth.users.id — this table
// only holds app-specific profile data (Supabase owns credentials/identity).
import { Model, DataTypes, Sequelize } from "sequelize";

interface UserAttributes {
  id: string;
  email: string; // User's email address (unique)
  name: string; // User's display name
  picture?: string; // Profile picture URL (from Google, when available)
  preferredUnit: "kg" | "lb"; // User's preferred weight unit
  createdAt?: Date;
  updatedAt?: Date;
}

interface UserCreationAttributes extends Omit<UserAttributes, "createdAt" | "updatedAt"> {}

class User
  extends Model<UserAttributes, UserCreationAttributes>
  implements UserAttributes
{
  // Required field declarations
  public id!: string;
  public email!: string;
  public name!: string;
  public picture!: string;
  public preferredUnit!: "kg" | "lb";
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Initialize the model's schema and configuration
  static initModel(sequelize: Sequelize): typeof User {
    User.init(
      {
        id: {
          type: DataTypes.UUID,
          primaryKey: true,
        },
        email: {
          type: DataTypes.STRING(255),
          allowNull: false,
          unique: true,
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
