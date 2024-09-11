import React from 'react';

const FileInput = ({ onChange }) => (
  <div>
    <label htmlFor="video" className="block text-xl font-medium text-gray-700">
      Video File
    </label>
    <input
      type="file"
      id="video"
      onChange={onChange}
      className="mt-1 block w-full text-sm text-gray-500
        file:mr-4 file:py-2 file:px-4
        file:rounded-full file:border-0
        file:text-sm file:font-semibold
        file:bg-blue-50 file:text-blue-700
        hover:file:bg-blue-100"
      required
    />
  </div>
);

export default FileInput;
