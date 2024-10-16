import React, { useState } from 'react';

import { updateUserProfilePicture } from '../../utils/userApi';
import {  Upload } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';


const ChangeProfilePictureForm = ({ user, setUser }) => {
    const [file, setFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState(null);

    const handleFileChange = (e) => {

      setFile(e.target.files[0]);
      setPreviewUrl(URL.createObjectURL(e.target.files[0]));
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      if (!file) {
        toast.error("Please select an image file to upload.");
        return;
      }
      setIsLoading(true);
      const formData = new FormData();
      formData.append('profilePicture', file);
      try {
        const updatedUser = await updateUserProfilePicture(formData);
        setUser(updatedUser);
        setFile(null);
        setPreviewUrl(null);
        toast.success("Profile picture updated successfully!");
      } catch (error) {
        console.error('Error updating profile picture:', error);
        toast.error("Failed to update profile picture. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        
        <h2 className="text-2xl font-semibold mb-4">Change Profile Picture</h2>
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="profilePicture">
            New Profile Picture
          </label>
          <div className="flex items-center">
            <Upload className="text-gray-500 mr-2" />
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="profilePicture"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>
        </div>
        {previewUrl && (
          <div className="mt-4">
            <img src={previewUrl} alt="Preview" className="w-32 h-32 object-cover rounded-full" />
          </div>
        )}
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300 disabled:opacity-50"
          type="submit"
          disabled={isLoading || !file}
        >
          {isLoading ? 'Updating...' : 'Update Profile Picture'}
        </button>
      </form>
    );
  };

export default ChangeProfilePictureForm;
