import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
    const [formData, setFormData] = useState({
        nume: '',
        email: '',
        parola: '',
        rol: 'STUDENT' // Implicit e student
    });
    const [message, setMessage] = useState('');
    
    const { api } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/auth/register', formData);
            setMessage('Cont creat cu succes! Te redirectionam...');
            
            // Dupa 2 secunde il trimitem la login
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setMessage(err.response?.data?.message || 'Eroare la inregistrare');
        }
    };

    return (
        <div style={styles.container}>
            <h2>Înregistrare</h2>
            {message && <p style={{ color: message.includes('succes') ? 'green' : 'red' }}>{message}</p>}
            
            <form onSubmit={handleSubmit} style={styles.form}>
                <input name="nume" placeholder="Nume complet" onChange={handleChange} required style={styles.input} />
                <input name="email" type="email" placeholder="Email" onChange={handleChange} required style={styles.input} />
                <input name="parola" type="password" placeholder="Parola" onChange={handleChange} required style={styles.input} />
                
                <select name="rol" onChange={handleChange} style={styles.input}>
                    <option value="STUDENT">Student</option>
                    <option value="PROFESOR">Profesor</option>
                </select>

                <button type="submit" style={styles.button}>Creează cont</button>
            </form>
            <p>Ai deja cont? <Link to="/login">Loghează-te</Link></p>
        </div>
    );
}

const styles = {
    container: { maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' },
    form: { display: 'flex', flexDirection: 'column', gap: '15px' },
    input: { padding: '8px', fontSize: '16px' },
    button: { padding: '10px', backgroundColor: '#28a745', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '16px' }
};