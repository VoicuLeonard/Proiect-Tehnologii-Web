import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { useContext } from 'react';

import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import ProfDashboard from './pages/ProfDashboard';

const PrivateRoute = ({ children, roleRequired }) => {
    const { user, token } = useContext(AuthContext);

    if (!token) {
        return <Navigate to="/login" />;
    }

    if (roleRequired && user.rol !== roleRequired) {
        return <Navigate to="/" />; 
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

                        <Route path="*" element={<Navigate to="/login" />} />
                    </Routes>
                </div>
            </Router>
        </AuthProvider>
    );
}

export default App;