import React from 'react';
import { Link } from 'react-router-dom';

function App() {
  return (
    <div className="App">
      <h1>Welcome to the App</h1>
      <nav>
        <ul>
          <li>
            <Link to="/classroom">Go to Classroom</Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}

export default App;
