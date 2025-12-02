import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export default function ProfDashboard() {
    const { user, api, logout } = useContext(AuthContext);
    const [newSession, setNewSession] = useState({ titlu: '', descriere: '', dataStart: '', dataEnd: '', locuriMaxime: 5 });
    const [applications, setApplications] = useState([]);
    const [message, setMessage] = useState('');

    useEffect(() => { fetchApplications(); }, []);

    const fetchApplications = async () => {
        try { const res = await api.get('/applications'); setApplications(res.data); } catch (err) {}
    };

    const handleCreateSession = async (e) => {
        e.preventDefault();
        try {
            await api.post('/sessions', newSession);
            setMessage('Sesiune creată cu succes!');
            setNewSession({ titlu: '', descriere: '', dataStart: '', dataEnd: '', locuriMaxime: 5 });
        } catch (err) { alert('Eroare la creare sesiune'); }
    };

    const handleVerdict = async (appId, status, justificare = null) => {
        try {
            await api.put(`/applications/${appId}/status`, { status, justificare });
            fetchApplications();
        } catch (err) { alert('Eroare la procesare'); }
    };

    // Functie pentru a repara calea fisierului (Windows foloseste \ dar web-ul vrea /)
    const getFileUrl = (path) => {
        if (!path) return '#';
        // Backend-ul serveste static folderul 'uploads', deci stergem 'uploads\' din cale daca exista
        // Si ne asiguram ca folosim /
        const cleanPath = path.replace(/\\/g, '/'); 
        return `http://localhost:8080/${cleanPath}`;
    };

    return (
        <div style={styles.container}>
            <header style={styles.header}>
                <h1>Panou Profesor: {user?.nume}</h1>
                <button onClick={logout} style={styles.logoutBtn}>Deconectare</button>
            </header>

            {message && <div style={styles.success}>{message}</div>}

            <div style={styles.mainGrid}>
                {/* Creare Sesiune */}
                <div style={styles.section}>
                    <h3>Creează o Sesiune Nouă</h3>
                    <form onSubmit={handleCreateSession} style={styles.form}>
                        <input placeholder="Titlu" required style={styles.input} value={newSession.titlu} onChange={e => setNewSession({...newSession, titlu: e.target.value})} />
                        <textarea placeholder="Descriere" style={styles.input} value={newSession.descriere} onChange={e => setNewSession({...newSession, descriere: e.target.value})} />
                        <label>Data Start:</label>
                        <input type="date" required style={styles.input} value={newSession.dataStart} onChange={e => setNewSession({...newSession, dataStart: e.target.value})} />
                        <label>Data Final:</label>
                        <input type="date" required style={styles.input} value={newSession.dataEnd} onChange={e => setNewSession({...newSession, dataEnd: e.target.value})} />
                        <label>Locuri:</label>
                        <input type="number" min="1" required style={styles.input} value={newSession.locuriMaxime} onChange={e => setNewSession({...newSession, locuriMaxime: e.target.value})} />
                        <button type="submit" style={styles.createBtn}>Publică Sesiunea</button>
                    </form>
                </div>

                {/* Lista Cereri */}
                <div style={styles.section}>
                    <h3>Cereri de la Studenți</h3>
                    {applications.length === 0 ? <p>Nicio cerere.</p> : (
                        <ul style={styles.list}>
                            {applications.map(app => (
                                <li key={app.id} style={styles.card}>
                                    <p><strong>{app.student?.nume}</strong> - {app.sesiune?.titlu}</p>
                                    <p>Status: <span style={getStatusStyle(app.status)}>{app.status}</span></p>
                                    
                                    {/* BUTOANE APROBARE INITIALA */}
                                    {app.status === 'PENDING' && (
                                        <div style={{marginTop: '10px'}}>
                                            <button onClick={() => handleVerdict(app.id, 'APPROVED_PRELIM')} style={{...styles.btn, background: 'green'}}>Acceptă Preliminar</button>
                                            <button onClick={() => handleVerdict(app.id, 'REJECTED_PRELIM', 'Nu indeplinesti conditiile')} style={{...styles.btn, background: 'red', marginLeft: '5px'}}>Respinge</button>
                                        </div>
                                    )}

                                    {/* ZONA DECIZIE FINALA (Dupa ce studentul a incarcat fisierul) */}
                                    {app.status === 'FILE_UPLOADED' && (
                                        <div style={{marginTop: '10px', padding: '10px', background: '#e9ecef', borderRadius: '5px'}}>
                                            <p style={{marginBottom: '5px'}}>📄 Studentul a încărcat cererea.</p>
                                            <a href={getFileUrl(app.caleFisier)} target="_blank" rel="noopener noreferrer" style={styles.downloadLink}>
                                                Descarcă Documentul
                                            </a>
                                            <div style={{marginTop: '10px'}}>
                                                <button onClick={() => handleVerdict(app.id, 'APPROVED_FINAL')} style={{...styles.btn, background: '#28a745'}}>✅ Aprobă Final</button>
                                                <button onClick={() => handleVerdict(app.id, 'REJECTED_FINAL', 'Semnatura lipsa sau gresita')} style={{...styles.btn, background: '#dc3545', marginLeft: '5px'}}>❌ Respinge (Cere reîncărcare)</button>
                                            </div>
                                        </div>
                                    )}

                                    {app.status === 'APPROVED_FINAL' && <p style={{color: 'green', fontWeight: 'bold'}}>Dosar Complet!</p>}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
}

const getStatusStyle = (status) => ({
    fontWeight: 'bold',
    color: status.includes('APPROVED') ? 'green' : status.includes('REJECTED') ? 'red' : 'orange'
});

const styles = {
    container: { maxWidth: '1000px', margin: '0 auto', padding: '20px' },
    header: { display: 'flex', justifyContent: 'space-between', marginBottom: '30px' },
    logoutBtn: { background: '#dc3545', color: '#fff', border: 'none', padding: '8px 15px', cursor: 'pointer' },
    success: { padding: '10px', background: '#d4edda', color: '#155724', marginBottom: '15px' },
    mainGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' },
    section: { background: '#f9f9f9', padding: '20px', borderRadius: '8px' },
    form: { display: 'flex', flexDirection: 'column', gap: '10px' },
    input: { padding: '8px', border: '1px solid #ccc', borderRadius: '4px' },
    createBtn: { padding: '10px', background: '#007bff', color: '#fff', border: 'none', cursor: 'pointer', marginTop: '10px' },
    list: { listStyle: 'none', padding: 0 },
    card: { background: '#fff', padding: '10px', marginBottom: '10px', border: '1px solid #ddd', borderRadius: '4px' },
    btn: { padding: '5px 10px', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: '3px', fontSize: '14px' },
    downloadLink: { color: '#0056b3', textDecoration: 'underline', fontWeight: 'bold', display: 'block', marginBottom: '10px' }
};