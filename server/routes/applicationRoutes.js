const express = require('express');
const router = express.Router();
const { Application, Session, User } = require('../models');
const { verifyToken, isProfessor } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');

// Configurare stocare fisiere
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '_' + file.originalname);
    }
});

const upload = multer({ storage: storage });

/**
 * RUTA: POST /
 * DESCRIERE: Studentul trimite o cerere de aplicare la o sesiune.
 */
router.post('/', verifyToken, async (req, res) => {
    try {
        const { sessionId } = req.body;
        const studentId = req.userId; 

        const existingApp = await Application.findOne({
            where: { studentId, sessionId }
        });

        if (existingApp) {
            return res.status(400).json({ message: 'Ai aplicat deja la aceasta sesiune!' });
        }

        const application = await Application.create({
            studentId,
            sessionId,
            status: 'IN_ASTEPTARE'
        });

        res.status(201).json({ message: 'Cerere trimisa cu succes!', application });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Eroare server' });
    }
});

/**
 * RUTA: GET /
 * DESCRIERE: Returneaza lista de aplicatii in functie de rolul utilizatorului (Student/Profesor).
 */
router.get('/', verifyToken, async (req, res) => {
    try {
        if (req.userRol === 'STUDENT') {
            const apps = await Application.findAll({
                where: { studentId: req.userId },
                include: [{ 
                    model: Session, 
                    as: 'sesiune',
                    include: [{ model: User, as: 'profesor', attributes: ['nume', 'email'] }]
                }]
            });
            return res.json(apps);
        } 
        
        if (req.userRol === 'PROFESOR') {
            const mySessions = await Session.findAll({ where: { profesorId: req.userId } });
            const sessionIds = mySessions.map(s => s.id);
            const apps = await Application.findAll({
                where: { sessionId: sessionIds },
                include: [
                    { model: User, as: 'student', attributes: ['nume', 'email'] },
                    { model: Session, as: 'sesiune', attributes: ['titlu'] }
                ]
            });
            return res.json(apps);
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Eroare server' });
    }
});

/**
 * RUTA: PUT /:id/status
 * DESCRIERE: Profesorul schimba statusul unei cereri (Accepta/Respinge).
 */
router.put('/:id/status', [verifyToken, isProfessor], async (req, res) => {
    try {
        const { id } = req.params; 
        const { status, justificare } = req.body;

        const application = await Application.findByPk(id);
        if (!application) return res.status(404).json({ message: 'Cererea nu exista' });

        if (status === 'ACCEPTAT_PRELIMINAR') {
            // Verificare: Studentul are deja o alta cerere aprobata?
            const alreadyApproved = await Application.findOne({
                where: { 
                    studentId: application.studentId,
                    status: 'ACCEPTAT_PRELIMINAR',
                }
            });

            if (alreadyApproved) {
                return res.status(400).json({ message: 'Studentul este deja aprobat la o alta sesiune!' });
            }

            // Verificare: Mai sunt locuri disponibile?
            const session = await Session.findByPk(application.sessionId);
            const approvedCount = await Application.count({
                where: { sessionId: application.sessionId, status: 'ACCEPTAT_PRELIMINAR' }
            });

            if (approvedCount >= session.locuriMaxime) {
                return res.status(400).json({ message: 'Nu mai sunt locuri disponibile in aceasta sesiune!' });
            }
        }

        application.status = status;
        
        // Daca exista o justificare noua (ex: la respingere), o salvam.
        // Daca nu (ex: la acceptare), setam campul pe NULL pentru a sterge mesajele vechi.
        if (justificare) {
            application.justificare = justificare;
        } else {
            application.justificare = null;
        }


        await application.save();

        res.json({ message: `Cerere actualizata: ${status}`, application });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Eroare server' });
    }
});

/**
 * RUTA: POST /:id/upload
 * DESCRIERE: Studentul incarca fisierul cu cererea.
 */
router.post('/:id/upload', [verifyToken, upload.single('fisier')], async (req, res) => {
    try {
        const { id } = req.params;
        const application = await Application.findByPk(id);

        if (!application) return res.status(404).json({ message: 'Cererea nu exista' });

        if (application.status !== 'ACCEPTAT_PRELIMINAR' && application.status !== 'RESPINS_FINAL') {
            return res.status(400).json({ message: 'Nu poti incarca fisier in acest stadiu!' });
        }

        application.caleFisier = req.file.path; 
        application.status = 'FISIER_INCARCAT';   
        await application.save();

        res.json({ message: 'Fisier incarcat cu succes!', caleFisier: application.caleFisier });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Eroare la upload' });
    }
});

/**
 * RUTA: POST /:id/upload-signed
 * DESCRIERE: Profesorul incarca fisierul semnat si finalizeaza aprobarea.
 */
router.post('/:id/upload-signed', [verifyToken, isProfessor, upload.single('fisier')], async (req, res) => {
    try {
        const { id } = req.params;
        const application = await Application.findByPk(id);

        if (!application) return res.status(404).json({ message: 'Cererea nu exista' });

        application.caleFisierSemnat = req.file.path; 
        application.status = 'APROBAT_FINAL';
        
        application.justificare = null;

        
        await application.save();

        res.json({ message: 'Fisier semnat incarcat si cerere aprobata!', caleFisierSemnat: application.caleFisierSemnat });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Eroare la upload profesor' });
    }
});

module.exports = router;