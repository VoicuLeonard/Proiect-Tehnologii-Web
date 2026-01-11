const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

/**
 * MODEL: Session
 * Defineste structura tabelului pentru sesiunile de disertatie create de profesori.
 */
const Session = sequelize.define('Session', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    titlu: {
        type: DataTypes.STRING,
        allowNull: false
    },
    descriere: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    dataStart: {
        type: DataTypes.DATE, 
        allowNull: false
    },
    dataEnd: {
        type: DataTypes.DATE,
        allowNull: false
    },
    locuriMaxime: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1
        }
    }
});

module.exports = Session;