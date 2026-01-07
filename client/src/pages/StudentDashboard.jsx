import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import './Dashboard.css'; 

export default function StudentDashboard() {
    const { user, api, logout } = useContext(AuthContext);
    const [sessions, setSessions] = useState([]);
    const [myApplications, setMyApplications] = useState([]);
    const [message, setMessage] = useState('');
    
    const [selectedFile, setSelectedFile] = useState(null);

    useEffect(() => {
        fetchSessions();
        fetchMyApplications();

        const interval = setInterval(() => {
            fetchSessions();
            fetchMyApplications();
        }, 3000);

        return () => clearInterval(interval);
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
            setTimeout(() => setMessage(''), 3000);
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

    const getStatusClass = (status) => {
        if (status.includes('ACCEPTAT') || status.includes('APROBAT')) return 'status-badge status-approved';
        if (status.includes('RESPINS')) return 'status-badge status-rejected';
        return 'status-badge status-pending';
    };

    return (
        <div className="page-wrapper">
            <nav className="navbar">
                <div className="nav-brand">
                    <h1>🎓 Panou Student</h1>
                </div>
                <div className="nav-user">
                    <span className="user-name">Salut, {user?.nume}</span>
                    <button onClick={logout} className="btn-logout">Deconectare</button>
                </div>
            </nav>

            <div className="dashboard-container">
                {message && <div className="alert-success">{message}</div>}

                <h2 className="section-title">Sesiuni Disponibile</h2>
                
                <div className="sessions-grid">
                    {sessions.map(session => {
                        const isFull = session.locuriOcupate >= session.locuriMaxime;
                        const applied = hasApplied(session.id);

                        return (
                            <div key={session.id} className="card">
                                <div>
                                    <h4>{session.titlu}</h4>
                                    <p className="card-desc">{session.descriere}</p>
                                    <div style={{display: 'flex', justifyContent: 'space-between', color: '#888', fontSize: '0.9rem'}}>
                                        <span>Locuri totale: {session.locuriMaxime}</span>
                                        <span style={{fontWeight: 'bold', color: isFull ? 'red' : 'green'}}>
                                            Ocupate: {session.locuriOcupate || 0}
                                        </span>
                                    </div>
                                </div>
                                
                                <div style={{marginTop: '15px'}}>
                                    {applied ? (
                                        <button disabled className="btn-disabled">Ai aplicat deja</button>
                                    ) : isFull ? (
                                        <button disabled className="btn-disabled" style={{backgroundColor: '#e74c3c', color: 'white'}}>
                                            ⛔ Nu mai sunt locuri
                                        </button>
                                    ) : (
                                        <button onClick={() => handleApply(session.id)} className="btn-primary">
                                            Trimite Cerere
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                <h2 className="section-title">Cererile Mele</h2>
                
                {myApplications.length === 0 ? (
                    <div className="card">
                        <p style={{margin: 0, color: '#666'}}>Nu ai trimis nicio cerere momentan.</p>
                    </div>
                ) : (
                    <ul className="applications-list">
                        {myApplications.map(app => (
                            <li key={app.id} className="app-item">
                                
                                <div className="app-info">
                                    <h3>{app.sesiune?.titlu || "Sesiune stearsa"}</h3>
                                    <div className="app-meta">
                                        <span>Status:</span>
                                        <span className={getStatusClass(app.status)}>
                                            {app.status}
                                        </span>
                                    </div>
                                    {app.justificare && (
                                        <p style={{color: '#d63031', fontSize: '0.85rem', marginTop: '5px', background: '#ffe6e6', padding: '5px', borderRadius: '4px'}}>
                                            ⚠️ Motiv: {app.justificare}
                                        </p>
                                    )}
                                </div>

                                <div className="app-actions">
                                    {(app.status === 'ACCEPTAT_PRELIMINAR' || app.status === 'RESPINS_FINAL') && (
                                        <div className="upload-wrapper">
                                            <input 
                                                type="file" 
                                                id={`file-${app.id}`} 
                                                onChange={(e) => setSelectedFile(e.target.files[0])} 
                                            />
                                            <label htmlFor={`file-${app.id}`} className="custom-file-label">
                                                📁 Alege Fisier
                                            </label>

                                            <span className="file-name-display">
                                                {selectedFile ? selectedFile.name : "Niciun fisier ales"}
                                            </span>

                                            <button onClick={() => handleUpload(app.id)} className="btn-upload">
                                                Incarca
                                            </button>
                                        </div>
                                    )}
                                    
                                    {app.status === 'FISIER_INCARCAT' && (
                                        <span style={{color: '#0984e3', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px'}}>
                                            ⏳ Fisier trimis. Se asteapta validarea.
                                        </span>
                                    )}
                                    
                                    {app.status === 'APROBAT_FINAL' && (
                                        <span style={{color: '#00b894', fontWeight: 'bold', fontSize: '1.1rem'}}>
                                              ✅ Dosar Complet
                                        </span>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}