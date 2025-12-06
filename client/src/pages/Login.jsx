import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
    const [email, setEmail] = useState('');
    const [parola, setParola] = useState('');
    const [error, setError] = useState('');

    const { login, api } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/auth/login', { email, parola });

            login(res.data.user, res.data.token);

            if (res.data.user.rol === 'PROFESOR') {
                navigate('/profesor');
            } else {
                navigate('/student');
            }
        } catch (err) {

            setError(err.response?.data?.message || 'A aparut o eroare');
        }
    };

    return (
        <div style={styles.container}>
            <h2>Autentificare</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            
            <form onSubmit={handleSubmit} style={styles.form}>
                <div style={styles.inputGroup}>
                    <label>Email:</label>
                    <input 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        required 
                        style={styles.input}
                    />
                </div>
                <div style={styles.inputGroup}>
                    <label>Parola:</label>
                    <input 
                        type="password" 
                        value={parola} 
                        onChange={(e) => setParola(e.target.value)} 
                        required 
                        style={styles.input}
                    />
                </div>
                <button type="submit" style={styles.button}>Intră în cont</button>
            </form>
            <p>Nu ai cont? <Link to="/register">Înregistrează-te aici</Link></p>
        </div>
    );
}

const styles = {
    container: { maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' },
    form: { display: 'flex', flexDirection: 'column', gap: '15px' },
    inputGroup: { display: 'flex', flexDirection: 'column' },
    input: { padding: '8px', fontSize: '16px' },
    button: { padding: '10px', backgroundColor: '#007BFF', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '16px' }
};