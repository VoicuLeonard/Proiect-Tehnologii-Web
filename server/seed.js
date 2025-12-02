const { sequelize, User, Session } = require('./models');

const seedDatabase = async () => {
    try {
        await sequelize.sync({ force: true }); 

        const prof = await User.create({
            nume: 'Profesor Popescu',
            email: 'prof@test.com',
            parola: '1234', 
            rol: 'PROFESOR'
        });

        await User.create({
            nume: 'Student Ionescu',
            email: 'student1@test.com',
            parola: '1234',
            rol: 'STUDENT'
        });

        await User.create({
            nume: 'Student Georgescu',
            email: 'student2@test.com',
            parola: '1234',
            rol: 'STUDENT'
        });

        await Session.create({
            profesorId: prof.id,
            titlu: 'Sesiune Licenta Iunie 2026',
            descriere: 'Teme legate de AI si Web Dev',
            dataStart: new Date(),
            dataEnd: new Date(new Date().setMonth(new Date().getMonth() + 1)), 
            locuriMaxime: 5
        });

        console.log('Datele de test au fost adaugate!');
    } catch (err) {
        console.error(err);
    }
};

seedDatabase();