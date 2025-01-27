import React from 'react';

const ModalActions = ({ onClose, isUploading }) => (
  <div className="flex justify-end space-x-2">
    <button
      type="button"
      onClick={onClose}
      className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
    >
      Cancel
    </button>
    <button
      type="submit"
      disabled={isUploading}
      className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
        isUploading ? 'opacity-50 cursor-not-allowed' : ''
      }`}
    >
      {isUploading ? 'Uploading...' : 'Edit Topic'}
    </button>
  </div>
);

export default ModalActions;
