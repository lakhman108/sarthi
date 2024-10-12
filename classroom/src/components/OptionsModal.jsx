import React, { useState } from 'react';

const OptionsModal = ({ onClose, onDelete, onEdit, currentTitle }) => {
  const [editMode, setEditMode] = useState(false);
  const [newTitle, setNewTitle] = useState(currentTitle);

  const handleEdit = () => {
    onEdit(newTitle);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-4 rounded-lg">
        {!editMode ? (
          <>
            <button onClick={() => setEditMode(true)} className="block w-full text-left p-2 hover:bg-gray-100">
              Edit
            </button>
            <button onClick={onDelete} className="block w-full text-left p-2 hover:bg-gray-100 text-red-500">
              Delete
            </button>
          </>
        ) : (
          <>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="block w-full p-2 border rounded mb-2"
            />
            <button onClick={handleEdit} className="block w-full text-left p-2 hover:bg-gray-100">
              Save
            </button>
          </>
        )}
        <button onClick={onClose} className="block w-full text-left p-2 hover:bg-gray-100">
          Cancel
        </button>
      </div>
    </div>
  );
};

export default OptionsModal;
