import { Model, DataTypes, Sequelize } from "sequelize";

interface UserAttributes {
  id: number;
  email: string;
  googleId?: string;
  name: string;
  picture?: string;
  preferredUnit: "kg" | "lb";
  createdAt?: Date;
  updatedAt?: Date;
}

interface UserCreationAttributes extends Omit<UserAttributes, "id"> {}

class User
  extends Model<UserAttributes, UserCreationAttributes>
  implements UserAttributes
{
  public id!: number;
  public email!: string;
  public googleId!: string;
  public name!: string;
  public picture!: string;
  public preferredUnit!: "kg" | "lb";
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

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
