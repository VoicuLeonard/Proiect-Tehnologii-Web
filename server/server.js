const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');
const sessionRoutes = require('./routes/sessionRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const path = require('path');
const fs = require('fs');

const authRoutes = require('./routes/authRoutes'); 

// 1. Configurare folder Uploads (pentru fisierele studentilor)
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log('Directorul uploads a fost creat automat.');
}

const app = express();
const PORT = process.env.PORT || 8080;

// 2. Middleware de baza
app.use(cors({
    origin: '*', 
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// 3. Rutele API (Backend)
app.use('/api/auth', authRoutes); 
app.use('/api/sessions', sessionRoutes);
app.use('/api/applications', applicationRoutes);

// Servim fisierele incarcate (PDF-uri) public
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- INTEGRARE FRONTEND (Partea Noua) ---

// A. Definim calea catre folderul 'dist' creat de React (Vite)
// Navigam un nivel mai sus (..) si intram in folderul client/dist
const buildPath = path.join(__dirname, '..', 'client', 'dist');

// B. Spunem serverului sa serveasca fisierele statice (JS, CSS, Imagini) din acel folder
app.use(express.static(buildPath));

// C. Orice alta cerere care NU a fost prinsa de API sau de fisiere statice
// va returna index.html. Asta este vital pentru React Router (SPA).
app.get('*', (req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'));
});

// --- FINAL INTEGRARE ---

// 4. Pornire Server
sequelize.sync({ alter: true }).then(() => {
    console.log('Baza de date sincronizata.');
    app.listen(PORT, () => {
        console.log(`Serverul ruleaza pe portul ${PORT}`);
    });
}).catch(err => console.log(err));