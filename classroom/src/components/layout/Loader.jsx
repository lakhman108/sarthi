import React from 'react';

const Loader = () => {
  return (
    <div className="fixed inset-0 flex justify-center items-center bg-claude-50">
      <div className="relative">
        <div className="w-12 h-12 border-3 border-claude-200 border-t-claude-700 rounded-full animate-spin"></div>
      </div>
    </div>
  );
};

export default Loader;
