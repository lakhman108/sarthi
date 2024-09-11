import ReactDOM from 'react-dom/client';
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import ClassroomUI from './components/ClassroomHome';
import ClassUI from './components/SingleClassroomLandingpage';
import { UserProvider } from "./context/Usercontex";
import { SidebarProvider } from './context/SidebarContext';


const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
    <React.StrictMode>
        <UserProvider>
<SidebarProvider>
    <Router>

      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/classroom" element={<ClassroomUI />} />
        <Route path="/classroom/:id" element={<ClassUI />} />
      </Routes>
    </Router>
    </SidebarProvider>
    </UserProvider>
    </React.StrictMode>

);

reportWebVitals();
