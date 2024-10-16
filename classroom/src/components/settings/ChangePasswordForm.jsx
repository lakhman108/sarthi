import React, { useState, useContext } from 'react';
import { UserContext } from '../../context/Usercontex';
import { updateUserPassword } from '../../utils/userApi';
import { Lock } from 'lucide-react';
import { toast } from 'react-toastify';

const ChangePasswordForm = ({ user }) => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleSubmit = async (e) => {
      e.preventDefault();
      if (newPassword !== confirmPassword) {
        toast.error("New passwords don't match");
        return;
      }
      try {
        await updateUserPassword(user._id, currentPassword, newPassword);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        toast.success('Password updated successfully');
      } catch (error) {
        console.error('Error updating password:', error);
        toast.error('Failed to update password. Please try again.');
      }
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <h2 className="text-2xl font-semibold mb-4">Change Password</h2>
        {['currentPassword', 'newPassword', 'confirmPassword'].map((field) => (
          <div key={field}>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor={field}>
              {field === 'currentPassword' ? 'Current Password' : field === 'newPassword' ? 'New Password' : 'Confirm New Password'}
            </label>
            <div className="flex items-center">
              <Lock className="text-gray-500 mr-2" />
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id={field}
                type="password"
                placeholder={`Enter ${field === 'currentPassword' ? 'current' : field === 'newPassword' ? 'new' : 'confirmed'} password`}
                value={field === 'currentPassword' ? currentPassword : field === 'newPassword' ? newPassword : confirmPassword}
                onChange={(e) => {
                  if (field === 'currentPassword') setCurrentPassword(e.target.value);
                  else if (field === 'newPassword') setNewPassword(e.target.value);
                  else setConfirmPassword(e.target.value);
                }}
              />
            </div>
          </div>
        ))}
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300"
          type="submit"
        >
          Update Password
        </button>
      </form>
    );
  };
export default ChangePasswordForm;
