const jwt = require('jsonwebtoken');

/**
 * MIDDLEWARE: verifyToken
 * Verifica validitatea token-ului JWT din header-ul cererii.
 * Daca token-ul este valid, adauga informatiile utilizatorului (ID, rol) in obiectul request.
 */
const verifyToken = (req, res, next) => {
    // Extrage token-ul din header-ul Authorization
    const tokenHeader = req.headers['authorization'];
    
    if (!tokenHeader) {
        return res.status(403).json({ message: 'Nu ai furnizat un token de autentificare!' });
    }

    // Formatul asteptat este "Bearer <token>"
    const token = tokenHeader.split(' ')[1];

    if (!token) {
        return res.status(403).json({ message: 'Format token incorect!' });
    }

    const JWT_SECRET = 'secretul_meu_super_secret_pentru_proiect';

    // Verificarea token-ului
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Token invalid sau expirat!' });
        }

        // Atasam datele decodificate la request pentru a fi folosite in rute
        req.userId = decoded.id;
        req.userRol = decoded.rol;
        next();
    });
};

/**
 * MIDDLEWARE: isProfessor
 * Verifica daca utilizatorul autentificat are rolul de PROFESOR.
 * Se foloseste dupa verifyToken.
 */
const isProfessor = (req, res, next) => {
    if (req.userRol !== 'PROFESOR') {
        return res.status(403).json({ message: 'Acces interzis! Doar profesorii pot face asta.' });
    }
    next();
};

module.exports = { verifyToken, isProfessor };