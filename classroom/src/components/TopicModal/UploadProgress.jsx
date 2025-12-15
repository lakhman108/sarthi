import React from 'react';
import { Loader } from 'lucide-react';

const UploadProgress = ({ isUploading, progress }) => {
  if (!isUploading) return null;

  return (
    <div className="flex items-center space-x-2">
      <Loader className="animate-spin" />
      <span>Uploading: {progress}%</span>
    </div>
  );
};

export default UploadProgress;
