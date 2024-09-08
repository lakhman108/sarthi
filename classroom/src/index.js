import ReactDOM from 'react-dom/client';
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import ClassroomUI from './components/LoadingClassroomUI';
import ClassUI from './components/FullScreenClassUI';
import { UserProvider } from "./context/Usercontex";

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
    <React.StrictMode>
        <UserProvider>
    <Router>

      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/classroom" element={<ClassroomUI />} />
        <Route path="/classroom/:id" element={<ClassUI />} />
      </Routes>
    </Router>
    </UserProvider>
    </React.StrictMode>

);

reportWebVitals();
