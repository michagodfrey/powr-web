import { Model, DataTypes } from "sequelize";
import { sequelize } from "./index";

interface UserAttributes {
  id: number;
  googleId: string;
  email: string;
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
  public googleId!: string;
  public email!: string;
  public name!: string;
  public picture!: string;
  public preferredUnit!: "kg" | "lb";
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    googleId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      field: "google_id",
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
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

export default User;
