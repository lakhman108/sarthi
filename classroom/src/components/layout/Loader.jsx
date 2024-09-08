
import React from 'react';
import { Loader as LoaderIcon } from 'lucide-react';

const Loader = () => {
  return (
    <div className="flex justify-center items-center h-screen">
      <LoaderIcon className="animate-spin text-blue-500" size={48} />
    </div>
  );
};

export default Loader;