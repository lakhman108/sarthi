import React from 'react';

const ModalWrapper = ({ children, onClose, title }) => (
  <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
    <div className="bg-white rounded-lg p-6 w-full max-w-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">{title}</h2>
        <button
          onClick={onClose}
          className="text-gray-600 hover:text-gray-800 text-2xl"
        >
          ×
        </button>
      </div>
      {children}
    </div>
  </div>
);

export default ModalWrapper;
