import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import './Register.css'; 

/**
 * PAGINA: Register
 * DESCRIERE: Formularul de inregistrare pentru noi utilizatori.
 * Permite selectarea rolului (Student sau Profesor).
 */
export default function Register() {
    // State pentru toate campurile formularului, initializat cu valori goale
    const [formData, setFormData] = useState({
        nume: '',
        email: '',
        parola: '',
        rol: 'STUDENT' // Rolul implicit
    });
    
    // State pentru mesaje de succes sau eroare
    const [message, setMessage] = useState('');
    
    const { api } = useContext(AuthContext);
    const navigate = useNavigate();

    /**
     * HANDLER: handleChange
     * Actualizeaza dinamic state-ul formData cand utilizatorul scrie in input-uri.
     */
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    /**
     * HANDLER: handleSubmit
     * Trimite datele de inregistrare catre server.
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/auth/register', formData);
            setMessage('Cont creat cu succes! Te redirectionam...');
            
            // Dupa 2 secunde, redirectionam utilizatorul catre Login
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setMessage(err.response?.data?.message || 'Eroare la inregistrare');
        }
    };

    return (
        <div className="register-wrapper">
            <div className="register-card">
                <h2 className="register-title">Inregistrare Cont</h2>
                
                {/* Afisare conditionata a mesajului de eroare/succes */}
                {message && (
                    <div className={`message ${message.includes('succes') ? 'success' : 'error'}`}>
                        {message}
                    </div>
                )}
                
                <form onSubmit={handleSubmit} className="register-form">
                    <div className="form-group">
                        <label>Nume Complet:</label>
                        <input 
                            name="nume" 
                            placeholder="Ex: Popescu Ion" 
                            onChange={handleChange} 
                            required 
                            className="register-input"
                        />
                    </div>

                    <div className="form-group">
                        <label>Adresa de Email:</label>
                        <input 
                            name="email" 
                            type="email" 
                            placeholder="email@exemplu.com" 
                            onChange={handleChange} 
                            required 
                            className="register-input"
                        />
                    </div>

                    <div className="form-group">
                        <label>Parola:</label>
                        <input 
                            name="parola" 
                            type="password" 
                            placeholder="Alege o parola sigura" 
                            onChange={handleChange} 
                            required 
                            className="register-input"
                        />
                    </div>

                    <div className="form-group">
                        <label>Rolul Tau:</label>
                        <select name="rol" onChange={handleChange} className="register-input register-select">
                            <option value="STUDENT">Student</option>
                            <option value="PROFESOR">Profesor</option>
                        </select>
                    </div>

                    <button type="submit" className="register-button">Creeaza cont</button>
                </form>

                <p className="login-link">
                    Ai deja cont? <Link to="/login">Autentifica-te aici</Link>
                </p>
            </div>
        </div>
    );
}