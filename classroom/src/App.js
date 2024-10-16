import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './components/Auth/LoginPage';
import SignupPage from './components/Auth/SignupPage';
import ClassroomUI from './components/ClassroomHome';
import ClassUI from './components/SingleClassroomLandingpage';
import SettingsPage from './components/settings/SettingsPage';
import { UserContext } from './context/Usercontex';
import Loader from './components/layout/Loader';

function App() {
  const { isAuthenticated, loading } = useContext(UserContext);

  console.log("isAuthenticated:", isAuthenticated);
  console.log("loading:", loading);

  const ProtectedRoute = ({ children }) => {
    if (loading) {
      return <div><Loader/></div>;
    }
    return isAuthenticated ? children : <Navigate to="/login" replace />;
  };

  if (loading) {
    return <div><Loader/></div>;
  }

  return (
    <div className="App">
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/classroom" element={<ProtectedRoute><ClassroomUI /></ProtectedRoute>} />
        <Route path="/classroom/:id" element={<ProtectedRoute><ClassUI /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
        <Route path="/" element={isAuthenticated ? <Navigate to="/classroom" replace /> : <Navigate to="/login" replace />} />
      </Routes>
    </div>
  );
}

export default App;
