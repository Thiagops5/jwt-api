const db = require('../config/db');
const { DataTypes } = require('sequelize');

const RefreshToken = db.define('refresh_token', {
    token: {
        type: DataTypes.STRING(500),
        allowNull: false
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    expiresAt: {
        type: DataTypes.DATE,
        allowNull: false
    },
    revoked: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
});

module.exports = RefreshToken;
