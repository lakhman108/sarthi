import React from 'react';
import { Upload } from 'lucide-react';

const FileInput = ({ onChange }) => (
  <div className="mb-6">
    <label htmlFor="video" className="block text-sm font-semibold text-gray-700 mb-2 font-body">
      Video File
    </label>
    <div className="relative">
      <input
        type="file"
        id="video"
        onChange={onChange}
        className="hidden"
        accept="video/*"
        required
      />
      <label 
        htmlFor="video"
        className="flex items-center justify-center gap-3 w-full px-4 py-8 border-2 border-dashed border-gray-300 rounded-lg hover:border-sarthi-purple-500 hover:bg-sarthi-purple-50 transition-all cursor-pointer group"
      >
        <Upload className="text-gray-400 group-hover:text-sarthi-purple-600 transition-colors" size={24} />
        <span className="text-gray-600 group-hover:text-sarthi-purple-600 font-body font-medium transition-colors">
          Click to upload video
        </span>
      </label>
    </div>
  </div>
);

export default FileInput;
