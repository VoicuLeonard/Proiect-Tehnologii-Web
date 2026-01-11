const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

/**
 * MODEL: Application
 * Defineste structura tabelului pentru cererile studentilor.
 * Gestioneaza statusul cererii si fisierele asociate.
 */
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
        type: DataTypes.STRING, // Calea catre fisierul incarcat de student
        allowNull: true
    },
    caleFisierSemnat: {
        type: DataTypes.STRING, // Calea catre fisierul semnat de profesor
        allowNull: true
    }
});

module.exports = Application;