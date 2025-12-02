import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { useContext } from 'react';

// Vom crea aceste pagini in pasul urmator, momentan facem doar importurile
// (Daca iti da eroare ca nu exista, creeaza fisiere goale in 'pages' pentru ele)
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import ProfDashboard from './pages/ProfDashboard';

// O componenta care protejeaza rutele (te trimite la login daca nu esti autentificat)
const PrivateRoute = ({ children, roleRequired }) => {
    const { user, token } = useContext(AuthContext);

    if (!token) {
        return <Navigate to="/login" />;
    }

    if (roleRequired && user.rol !== roleRequired) {
        return <Navigate to="/" />; // Redirect daca nu ai rolul potrivit
    }

    return children;
};

function App() {
    return (
        <AuthProvider>
            <Router>
                <div className="app-container" style={{ padding: '20px', fontFamily: 'Arial' }}>
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        
                        {/* Rute Protejate */}
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

                        {/* Redirect default */}
                        <Route path="*" element={<Navigate to="/login" />} />
                    </Routes>
                </div>
            </Router>
        </AuthProvider>
    );
}

export default App;