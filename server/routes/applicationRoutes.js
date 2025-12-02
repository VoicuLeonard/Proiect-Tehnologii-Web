const express = require('express');
const router = express.Router();
const { Application, Session, User } = require('../models');
const { verifyToken, isProfessor } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {

        cb(null, Date.now() + '_' + file.originalname);
    }
});


const upload = multer({ storage: storage });

// ==========================================
// 1. STUDENTUL APLICA (POST /api/applications)
// ==========================================
router.post('/', verifyToken, async (req, res) => {
    try {
        const { sessionId } = req.body;
        const studentId = req.userId; // Luat din token

        // Verificam daca studentul a aplicat deja la aceasta sesiune
        const existingApp = await Application.findOne({
            where: { studentId, sessionId }
        });

        if (existingApp) {
            return res.status(400).json({ message: 'Ai aplicat deja la aceasta sesiune!' });
        }

        // Cream cererea cu status PENDING (implicit din model)
        const application = await Application.create({
            studentId,
            sessionId
        });

        res.status(201).json({ message: 'Cerere trimisa cu succes!', application });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Eroare server' });
    }
});

// ==========================================
// 2. VIZUALIZARE CERERI (GET /api/applications)
// ==========================================
router.get('/', verifyToken, async (req, res) => {
    try {
        if (req.userRol === 'STUDENT') {
            // Studentul isi vede doar cererile lui + detalii despre sesiune si profesor
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
            // Profesorul vede cererile pentru sesiunile LUI
            // Pas 1: Gasim toate sesiunile profesorului
            const mySessions = await Session.findAll({ where: { profesorId: req.userId } });
            const sessionIds = mySessions.map(s => s.id);

            // Pas 2: Gasim aplicatiile pentru acele sesiuni
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

// ==========================================
// 3. PROFESORUL DECIDE (PUT /api/applications/:id/status)
// ==========================================
router.put('/:id/status', [verifyToken, isProfessor], async (req, res) => {
    try {
        const { id } = req.params; // ID-ul cererii
        const { status, justificare } = req.body; // Statusul nou (APPROVED_PRELIM / REJECTED_PRELIM)

        const application = await Application.findByPk(id);
        if (!application) return res.status(404).json({ message: 'Cererea nu exista' });

        // LOGICA DE APROBARE
        if (status === 'APPROVED_PRELIM') {
            
            // Regula 1: Verificam daca studentul e deja aprobat in alta parte
            const alreadyApproved = await Application.findOne({
                where: { 
                    studentId: application.studentId,
                    status: 'APPROVED_PRELIM',
                    // Excludem cererea curenta (caz de dublu click)
                    // Op este operatorul Sequelize pentru "not equal"
                }
            });

            if (alreadyApproved) {
                return res.status(400).json({ message: 'Studentul este deja aprobat la o alta sesiune!' });
            }

            // Regula 2: Verificam daca mai sunt locuri in sesiune
            const session = await Session.findByPk(application.sessionId);
            const approvedCount = await Application.count({
                where: { sessionId: application.sessionId, status: 'APPROVED_PRELIM' }
            });

            if (approvedCount >= session.locuriMaxime) {
                return res.status(400).json({ message: 'Nu mai sunt locuri disponibile in aceasta sesiune!' });
            }
        }

        // Actualizam statusul
        application.status = status;
        if (justificare) application.justificare = justificare;
        await application.save();

        res.json({ message: `Cerere actualizata: ${status}`, application });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Eroare server' });
    }
});


// ==========================================
// 4. UPLOAD FISIER (POST /api/applications/:id/upload)
// ==========================================
// upload.single('fisier') inseamna ca asteptam un camp numit 'fisier' in form-data
router.post('/:id/upload', [verifyToken, upload.single('fisier')], async (req, res) => {
    try {
        const { id } = req.params;
        const application = await Application.findByPk(id);

        if (!application) return res.status(404).json({ message: 'Cererea nu exista' });

        // Verificam daca studentul are voie sa incarce (doar daca e APPROVED_PRELIM sau REJECTED_FINAL pt reincarcare)
        if (application.status !== 'APPROVED_PRELIM' && application.status !== 'REJECTED_FINAL') {
            return res.status(400).json({ message: 'Nu poti incarca fisier in acest stadiu!' });
        }

        // Salvam calea in baza de date
        // req.file contine informatiile despre fisierul incarcat
        application.caleFisier = req.file.path; // ex: uploads/17432...pdf
        application.status = 'FILE_UPLOADED';   // Schimbam statusul
        await application.save();

        res.json({ message: 'Fisier incarcat cu succes!', caleFisier: application.caleFisier });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Eroare la upload' });
    }
});

module.exports = router;