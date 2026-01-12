import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import QuoteWidget from '../components/QuoteWidget'; 
import './ProfDashboard.css';

/**
 * PAGINA: ProfDashboard
 * DESCRIERE: Panoul principal pentru profesori.
 * * Functionalitati:
 * 1. Creeaza sesiuni noi de disertatie.
 * 2. Vizualizeaza sesiunile proprii create.
 * 3. Gestioneaza cererile studentilor (Acceptare Preliminara / Respingere).
 * 4. Aprobare finala prin incarcarea fisierului semnat.
 */
export default function ProfDashboard() {
    const { user, api, logout } = useContext(AuthContext);
    
    // State pentru formularul de creare sesiune
    const [newSession, setNewSession] = useState({ titlu: '', descriere: '', dataStart: '', dataEnd: '', locuriMaxime: 5 });
    
    // State-uri pentru datele afisate
    const [applications, setApplications] = useState([]);
    const [mySessions, setMySessions] = useState([]); 
    const [message, setMessage] = useState('');
    
    // State-uri pentru actiuni asupra cererilor (fisier upload si motiv respingere)
    const [profFile, setProfFile] = useState(null);
    const [rejectReason, setRejectReason] = useState('');

    // Polling pentru date proaspete
    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 3000);
        return () => clearInterval(interval);
    }, []);

    const fetchData = async () => {
        try { 
            const appsRes = await api.get('/applications'); 
            setApplications(appsRes.data);
            
            const sessionsRes = await api.get('/sessions');
            // Filtram sesiunile pentru a le arata doar pe ale profesorului curent
            const userSessions = sessionsRes.data.filter(s => s.profesorId === user.id);
            setMySessions(userSessions);
        } catch (err) {}
    };

    /**
     * HANDLER: handleCreateSession
     * Trimite datele pentru crearea unei sesiuni noi.
     */
    const handleCreateSession = async (e) => {
        e.preventDefault();
        try {
            await api.post('/sessions', newSession);
            setMessage('Sesiune creata cu succes!');
            // Resetare formular
            setNewSession({ titlu: '', descriere: '', dataStart: '', dataEnd: '', locuriMaxime: 5 });
            fetchData(); 
            setTimeout(() => setMessage(''), 3000);
        } catch (err) { 
            alert(err.response?.data?.message || 'Eroare la creare sesiune'); 
        }
    };

    /**
     * HANDLER: handleVerdict
     * Folosit pentru Acceptare Preliminara sau Respingere (fara upload fisier).
     */
    const handleVerdict = async (appId, status, justificare = null) => {
        try {
            await api.put(`/applications/${appId}/status`, { status, justificare });
            fetchData();
            setRejectReason(''); // Resetare camp motiv
        } catch (err) { alert('Eroare la procesare'); }
    };

    /**
     * HANDLER: handleApproveWithFile
     * Aprobarea finala care implica si incarcarea documentului semnat de profesor.
     */
    const handleApproveWithFile = async (appId) => {
        if (!profFile) return alert('Te rog alege un fisier semnat inainte de a aproba!');
        
        const formData = new FormData();
        formData.append('fisier', profFile);

        try {
            await api.post(`/applications/${appId}/upload-signed`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert('Cerere aprobata final si fisier trimis!');
            setProfFile(null); // Resetare input file
            fetchData();
        } catch (err) { alert('Eroare la upload fisier semnat'); }
    };

    const getFileUrl = (path) => {
        if (!path) return '#';
        // Inlocuim backslash cu slash
        const cleanPath = path.replace(/\\/g, '/');
        
        // LOGICA NOUA:
        // Verificam daca suntem in productie (pe Vercel) sau local
        const baseUrl = import.meta.env.PROD 
            ? 'https://proiect-tehnologii-web-0w6z.onrender.com' 
            : 'http://localhost:8080'; 

        return `${baseUrl}/${cleanPath}`;
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
                {/* Widget Extern */}
                <div style={{gridColumn: '1 / -1'}}>
                    <QuoteWidget />
                </div>

                {message && <div style={{gridColumn: '1 / -1', padding: '15px', background: '#d4edda', color: 'green', borderRadius: '5px'}}>{message}</div>}

                <div style={{display: 'flex', flexDirection: 'column', gap: '30px'}}>
                    <div className="prof-card">
                        <h3>Creeaza o Sesiune Noua</h3>
                        <form onSubmit={handleCreateSession}>
                            <div className="form-group">
                                <input placeholder="Titlu Sesiune" required className="prof-input" 
                                    value={newSession.titlu} onChange={e => setNewSession({...newSession, titlu: e.target.value})} />
                            </div>
                            <div className="form-group">
                                <textarea placeholder="Descriere tema/proiect..." rows="3" className="prof-input" 
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
                        <h3>Sesiunile Mele ({mySessions.length})</h3>
                        {mySessions.length === 0 ? <p style={{color: '#666'}}>Nu ai creat nicio sesiune.</p> : (
                            <ul className="requests-list">
                                {mySessions.map(s => (
                                    <li key={s.id} className="request-item" style={{borderLeft: '4px solid #2980b9'}}>
                                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                                            <strong>{s.titlu}</strong>
                                            <span style={{fontSize: '0.85rem', background: '#ecf0f1', padding: '2px 8px', borderRadius: '4px'}}>
                                                Locuri: {s.locuriOcupate}/{s.locuriMaxime}
                                            </span>
                                        </div>
                                        <div style={{fontSize: '0.85rem', color: '#7f8c8d', marginTop: '5px'}}>
                                            📅 {new Date(s.dataStart).toLocaleDateString()} - {new Date(s.dataEnd).toLocaleDateString()}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
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

                                    {/* Butoane pentru faza initiala */}
                                    {app.status === 'IN_ASTEPTARE' && (
                                        <div className="actions-row">
                                            <button onClick={() => handleVerdict(app.id, 'ACCEPTAT_PRELIMINAR')} className="btn-action btn-accept">Accepta Preliminar</button>
                                            <button onClick={() => handleVerdict(app.id, 'RESPINS_PRELIMINAR', 'Criterii neindeplinite')} className="btn-action btn-reject">Respinge</button>
                                        </div>
                                    )}

                                    {/* Zona de decizie finala (cu upload fisier) */}
                                    {app.status === 'FISIER_INCARCAT' && (
                                        <div style={{background: '#e3f2fd', padding: '10px', borderRadius: '5px'}}>
                                            <p style={{margin: '0 0 10px 0'}}>📄 Cerere semnata incarcata de student.</p>
                                            <div className="actions-row" style={{marginBottom: '15px'}}>
                                                <a href={getFileUrl(app.caleFisier)} target="_blank" rel="noopener noreferrer" className="btn-action btn-file">
                                                    Descarca Fisier Student
                                                </a>
                                            </div>
                                            
                                            <div style={{borderTop: '1px solid #ccc', paddingTop: '10px'}}>
                                                <label style={{display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 'bold'}}>1. Aproba si Incarca Fisier Semnat:</label>
                                                
                                                <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px'}}>
                                                    <input 
                                                        type="file" 
                                                        id={`file-upload-${app.id}`}
                                                        onChange={e => setProfFile(e.target.files[0])} 
                                                        style={{display: 'none'}} 
                                                    />
                                                    <label htmlFor={`file-upload-${app.id}`} className="btn-action" style={{backgroundColor: '#34495e', cursor: 'pointer', display: 'inline-block'}}>
                                                        📂 Alege Fisier
                                                    </label>
                                                    
                                                    <span style={{fontSize: '0.85rem', color: '#555', maxWidth: '120px', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis'}}>
                                                        {profFile ? profFile.name : "Niciun fisier"}
                                                    </span>

                                                    <button onClick={() => handleApproveWithFile(app.id)} className="btn-action btn-accept">Trimite & Aproba</button>
                                                </div>

                                                <label style={{display: 'block', marginBottom: '5px', fontSize: '0.9rem', fontWeight: 'bold'}}>2. Sau Respinge:</label>
                                                <div style={{display: 'flex', gap: '5px'}}>
                                                    <input 
                                                        type="text" 
                                                        placeholder="Motiv respingere..." 
                                                        value={rejectReason}
                                                        onChange={e => setRejectReason(e.target.value)}
                                                        className="prof-input"
                                                        style={{padding: '5px', fontSize: '0.9rem'}}
                                                    />
                                                    <button onClick={() => handleVerdict(app.id, 'RESPINS_FINAL', rejectReason || 'Fisier invalid')} className="btn-action btn-reject">Respinge</button>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {app.status === 'APROBAT_FINAL' && <p style={{color: 'green', fontWeight: 'bold', margin: 0}}>Dosar Complet! (Fisier semnat trimis)</p>}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
}