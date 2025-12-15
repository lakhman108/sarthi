import React from 'react';
import { Loader2 } from 'lucide-react';

const ModalActions = ({ onClose, isUploading }) => (
  <div className="flex gap-3 pt-4">
    <button
      type="button"
      onClick={onClose}
      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-semibold font-body transition-all"
      disabled={isUploading}
    >
      Cancel
    </button>
    <button
      type="submit"
      disabled={isUploading}
      className={`flex-1 bg-sarthi-purple-600 hover:bg-sarthi-purple-700 text-white py-3 px-6 rounded-lg font-semibold font-body transition-all shadow-lg shadow-sarthi-purple-500/30 flex items-center justify-center gap-2 ${
        isUploading ? 'opacity-75 cursor-not-allowed' : ''
      }`}
    >
      {isUploading ? (
        <>
          <Loader2 className="animate-spin" size={18} />
          Uploading...
        </>
      ) : (
        'Save'
      )}
    </button>
  </div>
);

export default ModalActions;
