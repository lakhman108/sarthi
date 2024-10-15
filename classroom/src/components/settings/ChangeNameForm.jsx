import React, { useState, useContext } from 'react';
import { UserContext } from '../../context/Usercontex';
import { updateUserName } from '../../utils/userApi';
import { User } from 'lucide-react';

const ChangeNameForm = () => {
  const [newName, setNewName] = useState('');
  const { user, setUser } = useContext(UserContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const updatedUser = await updateUserName(user._id, newName);
      console.log('Name updated:', updatedUser);
      setUser(updatedUser);
      setNewName('');
    } catch (error) {
      console.error('Error updating name:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
      <h2 className="text-xl font-semibold mb-4">Change Name</h2>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="newName">
          New Name
        </label>
        <div className="flex items-center">
          <User className="text-gray-500 mr-2" />
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="newName"
            type="text"
            placeholder="Enter new name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
        </div>
      </div>
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        type="submit"
      >
        Update Name
      </button>
    </form>
  );
};

export default ChangeNameForm;
