import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './components/Auth/LoginPage';
import SignupPage from './components/Auth/SignupPage';
import ClassroomUI from './components/ClassroomHome';
import ClassUI from './components/SingleClassroomLandingpage';
import SettingsPage from './components/settings/SettingsPage';
import { UserContext } from './context/Usercontex';
import Loader from './components/layout/Loader';
import NotFound from './components/Auth/NotFound';
import ShareClassroom from './components/ShareClassroom';
import JoinClassroomWithQr from './utils/JoinClassroomWithQr';
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
        <Route path="/join/:inviteCode" element={<JoinClassroomWithQr />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/classroom" element={<ProtectedRoute><ClassroomUI /></ProtectedRoute>} />
        <Route path="/classroom/:id" element={<ProtectedRoute><ClassUI /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
        <Route path="/" element={isAuthenticated ? <Navigate to="/classroom" replace /> : <Navigate to="/login" replace />} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default App;
