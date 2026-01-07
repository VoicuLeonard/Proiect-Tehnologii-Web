const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const tokenHeader = req.headers['authorization'];
    
    if (!tokenHeader) {
        return res.status(403).json({ message: 'Nu ai furnizat un token de autentificare!' });
    }

    const token = tokenHeader.split(' ')[1];

    if (!token) {
        return res.status(403).json({ message: 'Format token incorect!' });
    }

    const JWT_SECRET = 'secretul_meu_super_secret_pentru_proiect';

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Token invalid sau expirat!' });
        }

        req.userId = decoded.id;
        req.userRol = decoded.rol;
        next();
    });
};

const isProfessor = (req, res, next) => {
    if (req.userRol !== 'PROFESOR') {
        return res.status(403).json({ message: 'Acces interzis! Doar profesorii pot face asta.' });
    }
    next();
};

module.exports = { verifyToken, isProfessor };