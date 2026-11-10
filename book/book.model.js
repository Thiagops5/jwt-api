const db = require('../config/db');
const { DataTypes } = require('sequelize');

const book = db.define('Book', {
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    isbn: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    year: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    totalCopies: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    availableCopies: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
});
 module.exports = book;