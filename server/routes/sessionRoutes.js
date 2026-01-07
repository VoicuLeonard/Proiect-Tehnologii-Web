const express = require('express');
const router = express.Router(); 
const { Session, Application } = require('../models');
const { verifyToken, isProfessor } = require('../middleware/authMiddleware');

router.post('/', [verifyToken, isProfessor], async (req, res) => {
    try {
        const { titlu, descriere, dataStart, dataEnd, locuriMaxime } = req.body;

        if (new Date(dataStart) >= new Date(dataEnd)) {
            return res.status(400).json({ message: 'Data de final trebuie sa fie dupa data de start!' });
        }

        const session = await Session.create({
            profesorId: req.userId, 
            titlu,
            descriere,
            dataStart,
            dataEnd,
            locuriMaxime
        });

        res.status(201).json({ message: 'Sesiune creata cu succes!', session });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Eroare server', error: err.message });
    }
});

router.get('/', verifyToken, async (req, res) => {
    try {
        const sessions = await Session.findAll({
            include: [{
                model: Application,
                as: 'aplicatiiSesiune'
            }]
        });

        const sessionsWithCounts = sessions.map(session => {
            const sessionJson = session.toJSON();
            
            const locuriOcupate = session.aplicatiiSesiune ? session.aplicatiiSesiune.filter(app => 
                ['ACCEPTAT_PRELIMINAR', 'FISIER_INCARCAT', 'APROBAT_FINAL'].includes(app.status)
            ).length : 0;

            return {
                ...sessionJson,
                locuriOcupate 
            };
        });

        res.json(sessionsWithCounts);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Eroare server' });
    }
});

module.exports = router;