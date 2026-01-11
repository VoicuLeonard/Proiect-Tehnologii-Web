import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { useContext } from 'react';

import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import ProfDashboard from './pages/ProfDashboard';

/**
 * COMPONENTA: PrivateRoute
 * DESCRIERE: Un wrapper de securitate pentru rutele protejate.
 * Verifica daca utilizatorul este logat si daca are rolul necesar.
 * Daca nu, il redirectioneaza catre Login.
 */
const PrivateRoute = ({ children, roleRequired }) => {
    const { user, token } = useContext(AuthContext);

    // Daca nu exista token, redirectionam la Login
    if (!token) {
        return <Navigate to="/login" />;
    }

    // Daca rolul utilizatorului nu corespunde cu cel cerut de ruta, redirectionam
    if (roleRequired && user.rol !== roleRequired) {
        return <Navigate to="/" />; 
    }

    // Daca totul e ok, afisam pagina ceruta
    return children;
};

/**
 * COMPONENTA PRINCIPALA: App
 * DESCRIERE: Defineste structura de rutare a aplicatiei.
 */
function App() {
    return (
        <AuthProvider>
            <Router>
                <div className="app-container" style={{ padding: '0', fontFamily: 'Arial, sans-serif' }}>
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        
                        <Route 
                            path="/student" 
                            element={
                                <PrivateRoute roleRequired="STUDENT">
                                    <StudentDashboard />
                                </PrivateRoute>
                            } 
                        />
                        
                        <Route 
                            path="/profesor" 
                            element={
                                <PrivateRoute roleRequired="PROFESOR">
                                    <ProfDashboard />
                                </PrivateRoute>
                            } 
                        />

                        {/* Rutele necunoscute redirectioneaza la login */}
                        <Route path="*" element={<Navigate to="/login" />} />
                    </Routes>
                </div>
            </Router>
        </AuthProvider>
    );
}

export default App;