const db = require('../config/db');
const { DataTypes } = require('sequelize');
const User = db.define('User', {
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    isAdmin: {
        type: DataTypes.BOOLEAN, // Define the isAdmin field with a boolean data type
        allowNull: false,
        defaultValue: false
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    }
});

// aqui a gente usa o toJSON pra dar um sumiço no hash da senha toda vez que o express devolver o usuário no res.json()
// fiz isso porque mesmo a senha estando criptografada com bcrypt, mandar o hash pro front-end (no cadastro, busca por email ou até dentro da listagem de empréstimos) é perigoso pois alguém pode pegar esse hash na aba Network e tentar quebrar a senha na força bruta offline
// o legal do toJSON é que na memória do back-end a senha continua existindo normal pro login conseguir comparar, mas na hora de virar JSON pra ir pra tela ela é cortada fora automaticamente
User.prototype.toJSON = function () {
    const values = { ...this.get() };
    delete values.password;
    return values;
};

module.exports = User;