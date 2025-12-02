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
            'PENDING',           
            'APPROVED_PRELIM',   
            'REJECTED_PRELIM',   
            'FILE_UPLOADED',     
            'APPROVED_FINAL',    
            'REJECTED_FINAL'     
        ),
        defaultValue: 'PENDING'
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