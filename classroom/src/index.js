import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';


import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { UserProvider } from "./context/Usercontex";
import { SidebarProvider } from './context/SidebarContext';


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <UserProvider>
      <SidebarProvider>
        <Router>
          <App />
           
        </Router>
      </SidebarProvider>
    </UserProvider>
  </React.StrictMode>
);

reportWebVitals();
