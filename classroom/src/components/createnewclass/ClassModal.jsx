import React, { useState } from 'react';
import { X } from 'lucide-react';
import addclass from './createclasservice';
import { Route, useHistory ,useLocation, useNavigate } from 'react-router-dom';

const ClassModal = ({ isCreateClassModalOpen, onClose, teacherId ,refresh}) => {
  const [className, setClassName] = useState('');
  const [semester, setSemester] = useState('');
  const navigate = useNavigate();
  const location = useLocation()
  const addingClass = () => {
    addclass(className, teacherId, semester);
   setClassName('');
   setSemester('')
    onClose();


    (location.pathname === '/classroom')  ? refresh() : navigate('/classroom')  ;
  };

  if (!isCreateClassModalOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999] ">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Create New Class</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>
        <form onSubmit={(e) => e.preventDefault()}>
          <div className="mb-4">
            <label htmlFor="className" className="block text-sm font-medium text-gray-700 mb-2">
              Class Name
            </label>
            <input
              type="text"
              id="className"
              name="className"
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter class name"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="semester" className="block text-sm font-medium text-gray-700 mb-2">
              Semester
            </label>
            <input
              type="number"
              id="semester"
              name="semester"
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter Semester"
            />
          </div>
          <button
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            onClick={addingClass}
          >
            Create Class
          </button>
        </form>
      </div>
    </div>
  );
};

export default ClassModal;
