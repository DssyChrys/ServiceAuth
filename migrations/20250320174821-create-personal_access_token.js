'use test';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const { DataTypes } = Sequelize;
    await queryInterface.createTable('personal_access_tokens', {
         id: {
             type: DataTypes.INTEGER,
             autoIncrement: true,
             primaryKey: true,
         },
         accesstoken: {
             type: DataTypes.TEXT,
             allowNull: true,
         },
         resettoken: {
             type: DataTypes.TEXT,
             allowNull: true,
         },
         resetcode: {
             type: DataTypes.INTEGER,
             allowNull: true,
         },
         resetcodeexpiration: {
             type: DataTypes.DATE,
             allowNull: true,
         },
         user_id: {
             type: DataTypes.INTEGER,
             allowNull: false,
             unique: true,
         },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: true,
        }
    },
    );
},

  down:async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('personal_access_token');
  },
};
