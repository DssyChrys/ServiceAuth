import { Sequelize, DataTypes } from 'sequelize';
import sequelize from '../config/config.mjs';

const Personal = sequelize.define('personal_access_token', {
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
    }
}, {
    timestamps: true,
});

export default Personal;
