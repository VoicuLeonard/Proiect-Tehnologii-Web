const { DataTypes } = require('sequelize');
const sequelize = require('../config/db'); 

/**
 * MODEL: User
 * Defineste structura tabelului de utilizatori.
 * Contine informatii despre nume, email, parola si rol.
 */
const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nume: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    parola: {
        type: DataTypes.STRING,
        allowNull: false
    },
    rol: {
        type: DataTypes.ENUM('STUDENT', 'PROFESOR'),
        defaultValue: 'STUDENT',
        allowNull: false
    }
});

module.exports = User;