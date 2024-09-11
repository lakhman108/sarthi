// Sidebar.js
import React from 'react';
import { Home, Tv, Book, Settings, Menu,History,GraduationCap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSidebar } from '../../context/SidebarContext';

const Sidebar = () => {
  const { state, dispatch } = useSidebar();
  const navigate = useNavigate();

  const handleMenuClick = () => {
    dispatch({ type: 'TOGGLE_EXPAND' });
  };

  const handleMouseEnter = () => {
    dispatch({ type: 'SET_HOVER' });
  };

  const handleMouseLeave = () => {
    dispatch({ type: 'UNSET_HOVER' });
  };

  const changeRoute = (route) => {
    navigate(`/${route}`);
  };


  const sidebarClass = state.isExpanded || state.isHovered ? 'w-64' : 'w-16';
  const iconClass = state.isHovered || state.isExpanded ? 'self-start ml-4' : 'self-center';

  return (
    <div>
      <div className={`${sidebarClass} bg-gray-100 hover:bg-gray-200 flex flex-col items-center py-4 space-y-8 transition-width duration-300`}>
        <button className={`p-2 rounded-full ${iconClass}`} onClick={handleMenuClick}>
          <Menu size={24} />
        </button>
      </div>
      <div className={`${sidebarClass} h-screen bg-gray-100 flex flex-col items-center py-4 space-y-8 transition-width duration-300`} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>

        <button className={`p-2 hover:bg-gray-200 rounded-full ${iconClass} inline-flex`} onClick={e=>changeRoute("classroom")}>
          <Home size={24} />
          {(state.isExpanded || state.isHovered) && <span className="ml-2">Home</span>}
        </button>


        <button className={`p-2 hover:bg-gray-200 rounded-full ${iconClass} inline-flex`}>
        <GraduationCap  size={28}/>
          {(state.isExpanded || state.isHovered) && <span className="ml-2">Enrolled Classes</span>}
        </button>
        <button className={`p-2 hover:bg-gray-200 rounded-full ${iconClass} inline-flex`}>
          <History size={24} onClick={e=>changeRoute("history")}/>
          {(state.isExpanded || state.isHovered) && <span className="ml-2">History</span>}
        </button>
        <button className={`p-2 hover:bg-gray-200 rounded-full ${iconClass} inline-flex`}>
          <Settings size={24} />
          {(state.isExpanded || state.isHovered) && <span className="ml-2">Settings</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
