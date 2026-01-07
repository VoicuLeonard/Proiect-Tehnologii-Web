const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

const JWT_SECRET = 'secretul_meu_super_secret_pentru_proiect';

router.post('/register', async (req, res) => {
    try {
        const { nume, email, parola, rol } = req.body;

        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'Exista deja un cont cu acest email.' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(parola, salt);

        const newUser = await User.create({
            nume,
            email,
            parola: hashedPassword,
            rol: rol || 'STUDENT' 
        });

        res.status(201).json({ message: 'Utilizator creat cu succes!', userId: newUser.id });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Eroare la server', error: err.message });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, parola } = req.body;

        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ message: 'Utilizatorul nu a fost gasit.' });
        }

        const isMatch = await bcrypt.compare(parola, user.parola);
        if (!isMatch) {
            return res.status(400).json({ message: 'Parola incorecta.' });
        }

        const token = jwt.sign(
            { id: user.id, rol: user.rol, email: user.email }, 
            JWT_SECRET,
            { expiresIn: '1h' } 
        );

        res.json({
            message: 'Autentificare reusita!',
            token,
            user: {
                id: user.id,
                nume: user.nume,
                email: user.email,
                rol: user.rol
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Eroare la server' });
    }
});

module.exports = router;