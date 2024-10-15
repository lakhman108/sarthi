import React, { useState, useContext } from 'react';
import { UserContext } from '../../context/Usercontex';
import { updateUserProfilePicture } from '../../utils/userApi';
import { Image } from 'lucide-react';

const ChangeProfilePictureForm = () => {
  const [file, setFile] = useState(null);
  const { user, setUser } = useContext(UserContext);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append('profilePicture', file);

    try {
      const updatedUser = await updateUserProfilePicture(user._id, formData);
      setUser(updatedUser);
      setFile(null);
    } catch (error) {
      console.error('Error updating profile picture:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
      <h2 className="text-xl font-semibold mb-4">Change Profile Picture</h2>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="profilePicture">
          New Profile Picture
        </label>
        <div className="flex items-center">
          <Image className="text-gray-500 mr-2" />
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="profilePicture"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
          />
        </div>
      </div>
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        type="submit"
      >
        Update Profile Picture
      </button>
    </form>
  );
};

export default ChangeProfilePictureForm;
