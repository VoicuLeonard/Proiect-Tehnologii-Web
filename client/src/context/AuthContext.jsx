import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

// Crearea contextului pentru a fi accesibil in toata aplicatia
export const AuthContext = createContext();

/**
 * PROVIDER: AuthProvider
 * DESCRIERE: Gestioneaza starea globala de autentificare a utilizatorului.
 * Ofera functii pentru login, logout si acces la datele utilizatorului curent.
 * * @param {object} children - Componentele copil care vor avea acces la context.
 */
export const AuthProvider = ({ children }) => {
    // State pentru datele utilizatorului logat (id, nume, rol)
    const [user, setUser] = useState(null);
    
    // State pentru token-ul JWT (JSON Web Token)
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    
    // State pentru a preveni randarea aplicatiei inainte de verificarea token-ului
    const [loading, setLoading] = useState(true);

    // Configuram o instanta Axios globala cu URL-ul serverului
    // CORECT
    const api = axios.create({
        baseURL: 'https://proiect-tehnologii-web-1.onrender.com/api', 
    });

    // Daca exista un token, il atasam automat la fiecare cerere HTTP (header Authorization)
    if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }

    /**
     * FUNCTIE: login
     * Actualizeaza state-ul si salveaza datele in LocalStorage pentru persistenta.
     */
    const login = (userData, newToken) => {
        setUser(userData);
        setToken(newToken);
        localStorage.setItem('token', newToken); 
        localStorage.setItem('user', JSON.stringify(userData));
    };

    /**
     * FUNCTIE: logout
     * Sterge datele din state si din LocalStorage, deconectand utilizatorul.
     */
    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Stergem header-ul de autorizare pentru securitate
        delete api.defaults.headers.common['Authorization'];
    };

    /**
     * EFECT: Verificare initiala
     * La incarcarea paginii, verifica daca exista o sesiune salvata in LocalStorage.
     */
    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
        }
        setLoading(false); // Am terminat verificarea
    }, []);

    return (
        <AuthContext.Provider value={{ user, token, login, logout, loading, api }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};