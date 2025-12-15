import React from 'react';

const Loader = () => {
  return (
    <div className="fixed inset-0 flex justify-center items-center bg-gradient-to-br from-sarthi-purple-50 to-purple-100">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-sarthi-purple-200 border-t-sarthi-purple-600 rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 bg-sarthi-purple-600 rounded-full animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

export default Loader;
