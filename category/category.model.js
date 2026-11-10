const db = require('../config/db');
const { DataTypes } = require('sequelize');

// Boa prática: usar a primeira letra maiúscula para Modelos (Category)
const Category = db.define('Category', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    description: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, { 

    tableName: 'categories',
    timestamps: true
});

module.exports = Category;