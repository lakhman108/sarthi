import React from 'react';

export const DeleteAleart = ({ isOpen, onClose, onDelete }) => {
  if (!isOpen) return null;

  return (
    <div className="z-10 fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded shadow-lg max-w-sm w-full">
        <h2 className="text-xl font-semibold mb-4">Confirm Deletion</h2>
        <p className="mb-6">Are you sure you want to delete this lecture?</p>
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="mr-2 bg-gray-500 hover:bg-gray-600 text-white p-2 rounded"
          >
            Cancel
          </button>
          <button
            onClick={onDelete}
            className="bg-red-500 hover:bg-red-600 text-white p-2 rounded"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};
