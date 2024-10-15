import React, { useContext } from 'react';
import AuthForm from './components/Auth/AuthForm';
import { UserContext } from './context/Usercontex';
import { useNavigate } from 'react-router-dom';
function App() {



  return (
    <div className="App">
     <AuthForm/>
    </div>
  );
}

export default App;
