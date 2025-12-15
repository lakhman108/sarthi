import React, { useState } from 'react';
import { Edit2, Trash2, X } from 'lucide-react';

const OptionsModal = ({ onClose, onDelete, onEdit, currentTitle }) => {
  const [editMode, setEditMode] = useState(false);
  const [newTitle, setNewTitle] = useState(currentTitle);

  const handleEdit = () => {
    onEdit(newTitle);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex justify-center items-center z-50 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-slide-up">
        {!editMode ? (
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-display font-bold text-gray-900">Options</h3>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-2">
              <button 
                onClick={() => setEditMode(true)} 
                className="flex items-center gap-3 w-full text-left p-4 hover:bg-sarthi-purple-50 rounded-lg transition-colors font-body"
              >
                <Edit2 size={18} className="text-sarthi-purple-600" />
                <span className="font-semibold text-gray-700">Edit</span>
              </button>
              <button 
                onClick={onDelete} 
                className="flex items-center gap-3 w-full text-left p-4 hover:bg-red-50 rounded-lg transition-colors font-body"
              >
                <Trash2 size={18} className="text-red-600" />
                <span className="font-semibold text-red-600">Delete</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-display font-bold text-gray-900">Edit Title</h3>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sarthi-purple-500 mb-4 font-body"
              placeholder="Enter new title"
            />
            <div className="flex gap-3">
              <button 
                onClick={() => setEditMode(false)} 
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold font-body transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleEdit} 
                className="flex-1 bg-sarthi-purple-600 hover:bg-sarthi-purple-700 text-white py-3 rounded-lg font-semibold font-body transition-all shadow-lg shadow-sarthi-purple-500/30"
              >
                Save
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OptionsModal;
