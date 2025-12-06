import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export default function StudentDashboard() {
    const { user, api, logout } = useContext(AuthContext);
    const [sessions, setSessions] = useState([]);
    const [myApplications, setMyApplications] = useState([]);
    const [message, setMessage] = useState('');
    
    const [selectedFile, setSelectedFile] = useState(null);

    useEffect(() => {
        fetchSessions();
        fetchMyApplications();
    }, []);

    const fetchSessions = async () => {
        try { const res = await api.get('/sessions'); setSessions(res.data); } catch (err) {}
    };

    const fetchMyApplications = async () => {
        try { const res = await api.get('/applications'); setMyApplications(res.data); } catch (err) {}
    };

    const handleApply = async (sessionId) => {
        try {
            await api.post('/applications', { sessionId });
            setMessage('Ai aplicat cu succes!');
            fetchMyApplications();
        } catch (err) { alert('Eroare la aplicare'); }
    };

    const handleUpload = async (appId) => {
        if (!selectedFile) return alert("Selecteaza un fisier!");

        const formData = new FormData();
        formData.append('fisier', selectedFile); 

        try {
            await api.post(`/applications/${appId}/upload`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert("Fisier incarcat cu succes!");
            fetchMyApplications(); 
            setSelectedFile(null);
        } catch (err) {
            console.error(err);
            alert("Eroare la upload");
        }
    };

    const hasApplied = (sessionId) => myApplications.some(app => app.sessionId === sessionId);

    return (
        <div style={styles.container}>
            <header style={styles.header}>
                <h1>Panou Student: {user?.nume}</h1>
                <button onClick={logout} style={styles.logoutBtn}>Deconectare</button>
            </header>

            {message && <div style={styles.success}>{message}</div>}

            <h3>Sesiuni Disponibile</h3>
            <div style={styles.grid}>
                {sessions.map(session => (
                    <div key={session.id} style={styles.card}>
                        <h4>{session.titlu}</h4>
                        <p>{session.descriere}</p>
                        {hasApplied(session.id) ? 
                            <button disabled style={styles.disabledBtn}>Ai aplicat deja</button> : 
                            <button onClick={() => handleApply(session.id)} style={styles.applyBtn}>Trimite Cerere</button>
                        }
                    </div>
                ))}
            </div>

            <hr style={{margin: '30px 0'}} />
            
            <h3>Cererile Mele</h3>
            <ul style={styles.list}>
                {myApplications.map(app => (
                    <li key={app.id} style={styles.listItem}>
                        <div>
                            <strong>{app.sesiune?.titlu}</strong> - Status: <span style={getStatusStyle(app.status)}>{app.status}</span>
                            {app.justificare && <p style={{color: 'red', fontSize: '0.9em'}}>Motiv respingere: {app.justificare}</p>}
                        </div>

                        {}
                        {(app.status === 'APPROVED_PRELIM' || app.status === 'REJECTED_FINAL') && (
                            <div style={{display: 'flex', gap: '10px', alignItems: 'center'}}>
                                <input type="file" onChange={(e) => setSelectedFile(e.target.files[0])} />
                                <button onClick={() => handleUpload(app.id)} style={styles.uploadBtn}>Incarca Cerere Semnata</button>
                            </div>
                        )}
                        
                        {app.status === 'FILE_UPLOADED' && <span style={{color: 'blue'}}>Fisier incarcat. Se asteapta validarea finala.</span>}
                        {app.status === 'APPROVED_FINAL' && <span style={{color: 'green', fontWeight: 'bold'}}>🎉 Felicitari! Cerere acceptata final.</span>}
                    </li>
                ))}
            </ul>
        </div>
    );
}

const getStatusStyle = (status) => ({
    fontWeight: 'bold',
    color: status.includes('APPROVED') ? 'green' : status.includes('REJECTED') ? 'red' : 'orange',
    marginLeft: '5px'
});

const styles = {
    container: { maxWidth: '800px', margin: '0 auto', padding: '20px' },
    header: { display: 'flex', justifyContent: 'space-between', marginBottom: '20px' },
    logoutBtn: { background: '#dc3545', color: '#fff', border: 'none', padding: '5px 10px', cursor: 'pointer' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '15px' },
    card: { border: '1px solid #ddd', padding: '15px', borderRadius: '5px' },
    applyBtn: { background: '#007bff', color: '#fff', border: 'none', padding: '8px', width: '100%', cursor: 'pointer' },
    disabledBtn: { background: '#ccc', color: '#fff', border: 'none', padding: '8px', width: '100%', cursor: 'not-allowed' },
    uploadBtn: { background: '#28a745', color: '#fff', border: 'none', padding: '5px 10px', cursor: 'pointer' },
    list: { listStyle: 'none', padding: 0 },
    listItem: { borderBottom: '1px solid #eee', padding: '15px 0', display: 'flex', flexDirection: 'column', gap: '10px' },
    success: { background: '#d4edda', padding: '10px', marginBottom: '15px' }
};