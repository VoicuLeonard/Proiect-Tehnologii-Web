const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

const JWT_SECRET = 'secretul_meu_super_secret_pentru_proiect';

/**
 * RUTA: POST /register
 * DESCRIERE: Inregistreaza un nou utilizator.
 * Include validari pentru nume, email si parola.
 */
router.post('/register', async (req, res) => {
    try {
        const { nume, email, parola, rol } = req.body;

        // Validare: Lungime nume
        if (!nume || nume.length < 3) {
            return res.status(400).json({ message: 'Numele trebuie sa aiba cel putin 3 caractere!' });
        }

        // Validare: Format email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email)) {
            return res.status(400).json({ message: 'Formatul adresei de email este invalid!' });
        }

        // Validare: Lungime parola
        if (!parola || parola.length < 6) {
            return res.status(400).json({ message: 'Parola trebuie sa aiba cel putin 6 caractere!' });
        }

        // Verificam daca utilizatorul exista deja
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'Exista deja un cont cu acest email.' });
        }

        // Criptam parola inainte de salvare
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(parola, salt);

        // Cream utilizatorul
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

/**
 * RUTA: POST /login
 * DESCRIERE: Autentifica un utilizator si returneaza un token JWT.
 */
router.post('/login', async (req, res) => {
    try {
        const { email, parola } = req.body;

        // Cautam utilizatorul dupa email
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ message: 'Utilizatorul nu a fost gasit.' });
        }

        // Verificam parola
        const isMatch = await bcrypt.compare(parola, user.parola);
        if (!isMatch) {
            return res.status(400).json({ message: 'Parola incorecta.' });
        }

        // Generam token-ul JWT
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