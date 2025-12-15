import React, { useState, useContext } from 'react';
import { UserContext } from '../../context/Usercontex';
import { joinClassroom } from './joinClassroomService';

const JoinClassroomModal = ({ isOpen, onClose, onJoinSuccess }) => {
  const [classCode, setClassCode] = useState('');
  const { user } = useContext(UserContext);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await joinClassroom(user._id, classCode);
      onJoinSuccess();
      onClose();
    } catch (err) {
      setError('Failed to join classroom. Please check the class code.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg">
        <h2 className="text-xl font-bold mb-4">Join Classroom</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={classCode}
            onChange={(e) => setClassCode(e.target.value)}
            placeholder="Enter class code"
            className="w-full p-2 border rounded mb-4"
            required
          />
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="mr-2 px-4 py-2 bg-gray-200 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded"
            >
              Join
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JoinClassroomModal;
