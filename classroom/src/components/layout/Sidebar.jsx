// Sidebar.js
import React, { useEffect } from 'react';
import { Home, Settings, Menu,History,GraduationCap, NotebookIcon, Notebook, LucideNotebookPen } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSidebar } from '../../context/SidebarContext';

const Sidebar = () => {
  const { state, dispatch } = useSidebar();
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    if (window.innerWidth < 768) {
      dispatch({ type: 'COLLAPSE' }); // Add this action in your reducer
    }
  }, [location.pathname]);

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
    if (window.innerWidth < 768) {
      dispatch({ type: 'COLLAPSE' });
    }
  };


  const sidebarClass = state.isExpanded || state.isHovered ? 'w-56' : 'w-16';
  const iconClass = state.isHovered || state.isExpanded ? 'self-start ml-4' : 'self-center';

  return (
    <div>
      <div className={`${sidebarClass} bg-white border-r border-claude-200 flex flex-col items-center py-4 space-y-6 transition-width duration-300`}>
        <button className={`p-2 rounded-lg hover:bg-claude-100 ${iconClass}`} onClick={handleMenuClick}>
          <Menu size={20} className="text-claude-700" />
        </button>
      </div>
      <div className={`${sidebarClass} h-screen bg-white border-r border-claude-200 flex flex-col items-center py-4 space-y-4 transition-width duration-300`} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>

        <button className={`p-2 hover:bg-claude-100 rounded-lg ${iconClass} inline-flex items-center text-claude-700 text-sm`} onClick={e=>changeRoute("classroom")}>
          <Home size={20} />
          {(state.isExpanded || state.isHovered) && <span className="ml-3">Home</span>}
        </button>

        <button className={`p-2 hover:bg-claude-100 rounded-lg ${iconClass} inline-flex items-center text-claude-700 text-sm`}>
          <History size={20} onClick={e=>changeRoute("history")}/>
          {(state.isExpanded || state.isHovered) && <span className="ml-3">History</span>}
        </button>
        
        <button className={`p-2 hover:bg-claude-100 rounded-lg ${iconClass} inline-flex items-center text-claude-700 text-sm`}
        onClick={() => changeRoute('settings')}>
          <Settings size={20} />
          {(state.isExpanded || state.isHovered) && <span className="ml-3">Settings</span>}
        </button>

      </div>
    </div>
  );
};

export default Sidebar;
