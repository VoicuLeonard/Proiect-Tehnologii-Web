const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Application = sequelize.define('Application', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    status: {
        type: DataTypes.ENUM(
            'IN_ASTEPTARE',
            'ACCEPTAT_PRELIMINAR',
            'RESPINS_PRELIMINAR',
            'FISIER_INCARCAT',
            'APROBAT_FINAL',
            'RESPINS_FINAL'     
        ),
        defaultValue: 'IN_ASTEPTARE'
    },
    justificare: {
        type: DataTypes.TEXT, 
        allowNull: true
    },
    caleFisier: {
        type: DataTypes.STRING, 
        allowNull: true
    }
});

module.exports = Application;