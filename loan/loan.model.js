const db = require('../config/db');
const { DataTypes } = require('sequelize');
const Emprestimo = db.define('Emprestimo', {
    loanDate: {
        type: DataTypes.DATE,
        allowNull: false
    },
    dueDate: {
        type: DataTypes.DATE,
        allowNull: false
    },
    returnDate: {
        type: DataTypes.DATE,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('ATIVO', 'DEVOLVIDO', 'ATRASADO'),
        allowNull: false,
        defaultValue: 'ATIVO'
    },
    fine: {
        type: DataTypes.FLOAT,
        allowNull: true,
        defaultValue: 0.0
    }
});

module.exports = Emprestimo;