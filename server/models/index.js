const sequelize = require('../config/db');
const User = require('./User');
const Session = require('./Session');
const Application = require('./Application');

User.hasMany(Session, { foreignKey: 'profesorId', as: 'sesiuniCreate' });
Session.belongsTo(User, { foreignKey: 'profesorId', as: 'profesor' });

User.hasMany(Application, { foreignKey: 'studentId', as: 'aplicatiiStudent' });
Application.belongsTo(User, { foreignKey: 'studentId', as: 'student' });

Session.hasMany(Application, { foreignKey: 'sessionId', as: 'aplicatiiSesiune' });
Application.belongsTo(Session, { foreignKey: 'sessionId', as: 'sesiune' });

module.exports = {
    sequelize,
    User,
    Session,
    Application
};