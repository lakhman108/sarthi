import ReactDOM from 'react-dom/client';
import { React } from "react";
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import ClassroomUI from './components/LoadingClassroomUI';

import ClassUI from './components/FullScreenClassUI';


const root = ReactDOM.createRoot(document.getElementById('root'));


root.render(

    <Router>
        <Routes path="/v1">
          <Route path="/" element={<App />} />
          <Route path="/classroom" element={<ClassroomUI />} />
          <Route path="classroom/:id" element={<ClassUI />} />
        </Routes>
      </Router>
);


reportWebVitals();
