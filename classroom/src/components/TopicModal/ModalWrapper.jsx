import React from 'react';
import { X } from 'lucide-react';

const ModalWrapper = ({ children, onClose, title }) => (
  <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50 animate-fade-in">
    <div className="bg-white rounded-xl p-6 w-full max-w-lg mx-4 shadow-xl animate-slide-up border border-claude-200">
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-lg font-display font-semibold text-claude-900">{title}</h2>
        <button
          onClick={onClose}
          className="text-claude-600 hover:text-claude-900 transition-colors p-1 hover:bg-claude-100 rounded-lg"
        >
          <X size={20} />
        </button>
      </div>
      {children}
    </div>
  </div>
);

export default ModalWrapper;
