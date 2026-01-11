const sequelize = require('../config/db');
const User = require('./User');
const Session = require('./Session');
const Application = require('./Application');

// Definirea relatiilor intre tabele

// Un profesor poate crea mai multe sesiuni
User.hasMany(Session, { foreignKey: 'profesorId', as: 'sesiuniCreate' });
Session.belongsTo(User, { foreignKey: 'profesorId', as: 'profesor' });

// Un student poate avea mai multe aplicatii (dar aprobata doar una finala)
User.hasMany(Application, { foreignKey: 'studentId', as: 'aplicatiiStudent' });
Application.belongsTo(User, { foreignKey: 'studentId', as: 'student' });

// O sesiune poate avea mai multe aplicatii
Session.hasMany(Application, { foreignKey: 'sessionId', as: 'aplicatiiSesiune' });
Application.belongsTo(Session, { foreignKey: 'sessionId', as: 'sesiune' });

module.exports = {
    sequelize,
    User,
    Session,
    Application
};