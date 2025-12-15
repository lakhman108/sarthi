import React from 'react';
import { X } from 'lucide-react';

const ModalWrapper = ({ children, onClose, title }) => (
  <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex justify-center items-center z-50 animate-fade-in">
    <div className="bg-white rounded-2xl p-8 w-full max-w-lg mx-4 shadow-2xl animate-slide-up">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-display font-bold text-gray-900">{title}</h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-lg"
        >
          <X size={24} />
        </button>
      </div>
      {children}
    </div>
  </div>
);

export default ModalWrapper;
