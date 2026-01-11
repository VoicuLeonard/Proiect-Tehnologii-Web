const { Sequelize } = require('sequelize');

/**
 * CONFIGURARE: Baza de date SQLite
 * Initializeaza conexiunea la baza de date folosind Sequelize ORM.
 * Baza de date va fi stocata in fisierul 'database.sqlite'.
 */
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './database.sqlite',
    logging: false // Dezactiveaza logurile SQL in consola pentru claritate
});

module.exports = sequelize;