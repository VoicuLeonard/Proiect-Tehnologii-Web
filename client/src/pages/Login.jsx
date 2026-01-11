import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import './Login.css';

/**
 * PAGINA: Login
 * DESCRIERE: Formularul de autentificare pentru studenti si profesori.
 */
export default function Login() {
    // State-uri pentru campurile formularului
    const [email, setEmail] = useState('');
    const [parola, setParola] = useState('');
    
    // State pentru afisarea erorilor venite de la server
    const [error, setError] = useState('');

    // Accesam functia de login si instanta api din context
    const { login, api } = useContext(AuthContext);
    const navigate = useNavigate();

    /**
     * HANDLER: handleSubmit
     * Trimite datele de logare catre server.
     */
    const handleSubmit = async (e) => {
        e.preventDefault(); // Previne reincarcarea paginii
        try {
            // Trimitem cererea POST catre backend
            const res = await api.post('/auth/login', { email, parola });

            // Actualizam contextul global cu datele primite
            login(res.data.user, res.data.token);

            // Redirectionam utilizatorul in functie de rolul sau
            if (res.data.user.rol === 'PROFESOR') {
                navigate('/profesor');
            } else {
                navigate('/student');
            }
        } catch (err) {
            // Afisam mesajul de eroare primit de la server sau unul generic
            setError(err.response?.data?.message || 'A aparut o eroare');
        }
    };

    return (
        <div className="login-wrapper">
            <div className="login-card">
                <h2 className="login-title">Autentificare</h2>
                
                {error && <div className="error-message">{error}</div>}
                
                <form onSubmit={handleSubmit} className="login-form">
                    <div className="form-group">
                        <label>Email:</label>
                        <input 
                            type="email" 
                            placeholder="Introdu adresa de email"
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            required 
                            className="login-input"
                        />
                    </div>

                    <div className="form-group">
                        <label>Parola:</label>
                        <input 
                            type="password" 
                            placeholder="Introdu parola"
                            value={parola} 
                            onChange={(e) => setParola(e.target.value)} 
                            required 
                            className="login-input"
                        />
                    </div>

                    <button type="submit" className="login-button">Intra in cont</button>
                </form>

                <p className="register-link">
                    Nu ai cont? <Link to="/register">Inregistreaza-te aici</Link>
                </p>
            </div>
        </div>
    );
}