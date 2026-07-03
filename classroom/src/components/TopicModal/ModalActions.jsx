import React from 'react';
import { Loader2 } from 'lucide-react';

const ModalActions = ({ onClose, isUploading }) => (
  <div className="flex gap-2 pt-4">
    <button
      type="button"
      onClick={onClose}
      className="flex-1 bg-claude-100 hover:bg-claude-200 text-claude-900 py-2.5 px-4 rounded-lg font-medium font-body transition-colors text-sm"
      disabled={isUploading}
    >
      Cancel
    </button>
    <button
      type="submit"
      disabled={isUploading}
      className={`flex-1 bg-claude-900 hover:bg-claude-800 text-white py-2.5 px-4 rounded-lg font-medium font-body transition-colors flex items-center justify-center gap-2 text-sm ${
        isUploading ? 'opacity-75 cursor-not-allowed' : ''
      }`}
    >
      {isUploading ? (
        <>
          <Loader2 className="animate-spin" size={16} />
          Uploading...
        </>
      ) : (
        'Save'
      )}
    </button>
  </div>
);

export default ModalActions;
