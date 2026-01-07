import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import './ProfDashboard.css';

export default function ProfDashboard() {
    const { user, api, logout } = useContext(AuthContext);
    const [newSession, setNewSession] = useState({ titlu: '', descriere: '', dataStart: '', dataEnd: '', locuriMaxime: 5 });
    const [applications, setApplications] = useState([]);
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchApplications();

        const interval = setInterval(() => {
            fetchApplications();
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    const fetchApplications = async () => {
        try { const res = await api.get('/applications'); setApplications(res.data); } catch (err) {}
    };

    const handleCreateSession = async (e) => {
        e.preventDefault();
        try {
            await api.post('/sessions', newSession);
            setMessage('Sesiune creata cu succes!');
            setNewSession({ titlu: '', descriere: '', dataStart: '', dataEnd: '', locuriMaxime: 5 });
            setTimeout(() => setMessage(''), 3000);
        } catch (err) { alert('Eroare la creare sesiune'); }
    };

    const handleVerdict = async (appId, status, justificare = null) => {
        try {
            await api.put(`/applications/${appId}/status`, { status, justificare });
            fetchApplications();
        } catch (err) { alert('Eroare la procesare'); }
    };

    const getFileUrl = (path) => {
        if (!path) return '#';
        const cleanPath = path.replace(/\\/g, '/'); 
        return `http://localhost:8080/${cleanPath}`;
    };

    const getStatusColor = (status) => {
        if (status.includes('ACCEPTAT') || status.includes('APROBAT')) return { background: '#d4edda', color: '#155724' };
        if (status.includes('RESPINS')) return { background: '#f8d7da', color: '#721c24' }; 
        return { background: '#fff3cd', color: '#856404' }; 
    };

    return (
        <div className="prof-page-wrapper">
            <nav className="prof-navbar">
                <div className="prof-brand">
                    <h1>🎓 Panou Profesor</h1>
                </div>
                <div style={{display: 'flex', alignItems: 'center', gap: '20px'}}>
                    <span>Prof. <strong>{user?.nume}</strong></span>
                    <button onClick={logout} className="btn-logout">Deconectare</button>
                </div>
            </nav>

            <div className="prof-container">
                {message && <div style={{gridColumn: '1 / -1', padding: '15px', background: '#d4edda', color: 'green', borderRadius: '5px'}}>{message}</div>}

                <div className="prof-card">
                    <h3>Creeaza o Sesiune Noua</h3>
                    <form onSubmit={handleCreateSession}>
                        <div className="form-group">
                            <input placeholder="Titlu Sesiune" required className="prof-input" 
                                value={newSession.titlu} onChange={e => setNewSession({...newSession, titlu: e.target.value})} />
                        </div>
                        <div className="form-group">
                            <textarea placeholder="Descriere tema/proiect..." rows="4" className="prof-input" 
                                value={newSession.descriere} onChange={e => setNewSession({...newSession, descriere: e.target.value})} />
                        </div>
                        
                        <div style={{display: 'flex', gap: '10px'}}>
                            <div className="form-group" style={{flex: 1}}>
                                <label>Data Start:</label>
                                <input type="date" required className="prof-input" 
                                    value={newSession.dataStart} onChange={e => setNewSession({...newSession, dataStart: e.target.value})} />
                            </div>
                            <div className="form-group" style={{flex: 1}}>
                                <label>Data Final:</label>
                                <input type="date" required className="prof-input" 
                                    value={newSession.dataEnd} onChange={e => setNewSession({...newSession, dataEnd: e.target.value})} />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Numar Locuri:</label>
                            <input type="number" min="1" required className="prof-input" 
                                value={newSession.locuriMaxime} onChange={e => setNewSession({...newSession, locuriMaxime: e.target.value})} />
                        </div>

                        <button type="submit" className="btn-publish">Publica Sesiunea</button>
                    </form>
                </div>

                <div className="prof-card">
                    <h3>Cereri de la Studenti</h3>
                    {applications.length === 0 ? <p>Nu exista cereri in asteptare.</p> : (
                        <ul className="requests-list">
                            {applications.map(app => (
                                <li key={app.id} className="request-item">
                                    <div className="req-header">
                                        <div>
                                            <span className="student-name">{app.student?.nume}</span>
                                            <br/>
                                            <small style={{color: '#666'}}>Pt: {app.sesiune?.titlu}</small>
                                        </div>
                                        <span className="status-pill" style={getStatusColor(app.status)}>
                                            {app.status}
                                        </span>
                                    </div>

                                    {app.status === 'IN_ASTEPTARE' && (
                                        <div className="actions-row">
                                            <button onClick={() => handleVerdict(app.id, 'ACCEPTAT_PRELIMINAR')} className="btn-action btn-accept">Accepta Preliminar</button>
                                            <button onClick={() => handleVerdict(app.id, 'RESPINS_PRELIMINAR', 'Nu indeplinesti conditiile')} className="btn-action btn-reject">Respinge</button>
                                        </div>
                                    )}

                                    {app.status === 'FISIER_INCARCAT' && (
                                        <div style={{background: '#e3f2fd', padding: '10px', borderRadius: '5px'}}>
                                            <p style={{margin: '0 0 10px 0'}}>📄 Cerere semnata incarcata.</p>
                                            <div className="actions-row">
                                                <a href={getFileUrl(app.caleFisier)} target="_blank" rel="noopener noreferrer" className="btn-action btn-file">
                                                    Descarca Document
                                                </a>
                                            </div>
                                            <div className="actions-row" style={{marginTop: '10px', borderTop: '1px solid #ccc', paddingTop: '10px'}}>
                                                <button onClick={() => handleVerdict(app.id, 'APROBAT_FINAL')} className="btn-action btn-accept">✅ Aproba Final</button>
                                                <button onClick={() => handleVerdict(app.id, 'RESPINS_FINAL', 'Semnatura invalida')} className="btn-action btn-reject">❌ Respinge</button>
                                            </div>
                                        </div>
                                    )}

                                    {app.status === 'APROBAT_FINAL' && <p style={{color: 'green', fontWeight: 'bold', margin: 0}}>Dosar Complet!</p>}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
}