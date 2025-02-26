import React, { useState } from 'react';
import { ClassroomProvider } from './context/ClassroomContext';
import { Dashboard, Assignments, Discussions } from './pages';

const Classroom = (props) => {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const renderPage = () => {
    switch(currentPage) {
      case 'assignments':
        return <Assignments {...props} />;
      case 'discussions':
        return <Discussions {...props} />;
      default:
        return <Dashboard {...props} onNavigate={setCurrentPage} />;
    }
  };

  return (
    <ClassroomProvider>
      {renderPage()}
    </ClassroomProvider>
  );
};

export default Classroom;
