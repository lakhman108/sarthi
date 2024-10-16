

import React, { useState, useContext } from 'react';
import { UserContext } from '../../context/Usercontex';
import Sidebar from '../layout/Sidebar';
import Header from '../layout/Header';
import ChangeProfilePictureForm from './ChangeProfilePictureForm';
import ChangePasswordForm from './ChangePasswordForm';
import ChangeNameForm from './ChangeNameForm';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

  const SettingsPage = () => {
    const [activeSection, setActiveSection] = useState('profile');
    const { user, setUser } = useContext(UserContext);
    const [refresh, setRefresh] = useState(false);


    const handleRefresh = () => {
          setRefresh(!refresh);
toast.success("Profile picture updated successfully!");
    };

    return (
      <div className="flex bg-gray-100 min-h-screen">
        <Sidebar />
        <div className="flex-1">
          <Header onRefresh={handleRefresh} />

          <main className="p-6 max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="p-8 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                <img
                  src={user.profilePictureImageLink || 'https://via.placeholder.com/150'}
                  alt="Profile"
                  className="w-32 h-32 rounded-full border-4 border-white shadow-lg mx-auto mb-4"
                />
                <h1 className="text-3xl font-bold text-center">{user.username}</h1>
                <p className="text-center text-blue-100">{user.email}</p>
              </div>
              <div className="p-6">
                <div className="flex mb-6 border-b">
                  <button
                    className={`px-4 py-2 font-semibold ${activeSection === 'profile' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-500'}`}
                    onClick={() => setActiveSection('profile')}
                  >
                    Profile Information
                  </button>
                  <button
                    className={`px-4 py-2 font-semibold ${activeSection === 'security' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-500'}`}
                    onClick={() => setActiveSection('security')}
                  >
                    Security
                  </button>
                  <button
                    className={`px-4 py-2 font-semibold ${activeSection === 'picture' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-500'}`}
                    onClick={() => setActiveSection('picture')}
                  >
                    Profile Picture
                  </button>
                </div>
                {activeSection === 'profile' && <ChangeNameForm user={user} setUser={setUser} />}
                {activeSection === 'security' && <ChangePasswordForm user={user} />}
                {activeSection === 'picture' && <ChangeProfilePictureForm user={user} setUser={setUser} />}
              </div>
            </div>
          </main>
        </div>
        <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
      </div>
    );
  };

  export default SettingsPage;
