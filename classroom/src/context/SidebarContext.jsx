
import React, { createContext, useContext, useReducer } from 'react';

const SidebarContext = createContext();

const initialState = {
  isExpanded: false,
  isHovered: false,
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'TOGGLE_EXPAND':
      return { ...state, isExpanded: !state.isExpanded };
    case 'SET_HOVER':
      return { ...state, isHovered: true };
    case 'UNSET_HOVER':
      return { ...state, isHovered: false };
    default:
      return state;
  }
};

export const SidebarProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <SidebarContext.Provider value={{ state, dispatch }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};
