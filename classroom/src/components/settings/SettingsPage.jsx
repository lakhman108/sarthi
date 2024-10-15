import React, { useState, useContext } from 'react';
import ChangeNameForm from './ChangeNameForm';
import ChangePasswordForm from './ChangePasswordForm';
import ChangeProfilePictureForm from './ChangeProfilePictureForm';
import Sidebar from '../layout/Sidebar';
import Header from '../layout/Header';
import { UserContext } from '../../context/Usercontex';

const SettingsPage = () => {
  const [refresh, setRefresh] = useState(false);
  const { user } = useContext(UserContext);

  const handleRefresh = () => {
    setRefresh(!refresh);
  };

  return (
    <div className="flex bg-gray-200">
      <Sidebar />
      <div className="flex-1">
        <Header refresh={handleRefresh} />
        <main className="p-6 max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-8 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
              <img
                src={user.profilePictureImageLink}
                alt="Profile"
                className="w-32 h-32 rounded-full border-4 border-white shadow-lg mx-auto mb-4"
              />
              <h1 className="text-3xl font-bold text-center">{user.username}</h1>
              <p className="text-center text-blue-100">{user.email}</p>
            </div>
            <div className="p-6">
              <div className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Profile Information</h2>
                <ChangeNameForm />
              </div>

              <div>
                <h2 className="text-2xl font-semibold mb-4">Security</h2>
                <ChangePasswordForm />
              </div>
              <div className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Profile Picture</h2>
                <ChangeProfilePictureForm />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SettingsPage;
