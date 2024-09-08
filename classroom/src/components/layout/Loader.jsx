import React from 'react';
import { Loader as LoaderIcon } from 'lucide-react';

const Loader = () => {
  return (
    <div className="fixed inset-0 flex justify-center items-center">
      <LoaderIcon className="animate-spin text-blue-500" size={48} />
    </div>
  );
};

export default Loader;
