"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("refresh_tokens", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "users", key: "id" },
        onDelete: "CASCADE",
      },
      token: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      device: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      expires_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn("NOW"),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn("NOW"),
      },
    });
    await queryInterface.addIndex("refresh_tokens", ["user_id"], {
      name: "refresh_tokens_user_id_idx",
    });
    await queryInterface.addIndex("refresh_tokens", ["token"], {
      name: "refresh_tokens_token_idx",
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("refresh_tokens");
  },
};
