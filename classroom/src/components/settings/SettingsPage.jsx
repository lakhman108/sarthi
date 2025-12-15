import React, { useState, useContext } from 'react';
import { UserContext } from '../../context/Usercontex';
import Sidebar from '../layout/Sidebar';
import Header from '../layout/Header';
import ChangeProfilePictureForm from './ChangeProfilePictureForm';
import ChangePasswordForm from './ChangePasswordForm';
import ChangeNameForm from './ChangeNameForm';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { LogOut,Menu } from 'lucide-react';
import Cookies from "js-cookie";
const SettingsPage = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('picture');
  const { user, setUser } = useContext(UserContext);
  const [refresh, setRefresh] = useState(false);

  const handleLogout = async () => {
    try {
      // Make API call to logout endpoint if you have one

        // Clear user context
        setUser(null);

        // Clear any cookies
        Cookies.remove('token');
        // Redirect to login page
        window.location.href = '/login';

        toast.success('Logged out successfully');

    } catch (error) {
      console.error('Error logging out:', error);
      toast.error('Error logging out');
    }
  };


  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar - Responsive */}
      <div className={`fixed inset-y-0 left-0 transform ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:relative lg:translate-x-0 transition-transform duration-300 ease-in-out z-30`}>
        <Sidebar />
      </div>

      {/* Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 lg:hidden z-20"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1">
        <Header>
          <button
            className="lg:hidden p-2 rounded-md hover:bg-gray-200"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            <Menu size={24} />
          </button>
        </Header>

        <main className="p-4 sm:p-6 max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Profile Header */}
            <div className="p-6 sm:p-8 bg-gradient-to-r from-blue-500 to-purple-600 text-white relative">
              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2
                         bg-white text-red-600 rounded-lg hover:bg-red-50 transition-colors duration-200"
              >
                <LogOut size={18} className="sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Logout</span>
              </button>

              <div className="flex flex-col items-center space-y-4">
                <img
                  src={user.profilePictureImageLink || 'https://via.placeholder.com/150'}
                  alt="Profile"
                  className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-white shadow-lg"
                />
                <div className="text-center">
                  <h1 className="text-2xl sm:text-3xl font-bold">{user.username}</h1>
                  <p className="text-blue-100 text-sm sm:text-base">{user.email}</p>
                </div>
              </div>
            </div>

            {/* Settings Navigation */}
            <div className="p-4 sm:p-6">
              <div className="flex flex-wrap gap-2 sm:gap-0 border-b overflow-x-auto">
                <button
                  className={`px-3 py-2 sm:px-4 font-semibold whitespace-nowrap text-sm sm:text-base
                           ${activeSection === 'profile'
                             ? 'text-blue-500 border-b-2 border-blue-500'
                             : 'text-gray-500'}`}
                  onClick={() => setActiveSection('profile')}
                >
                  Profile Info
                </button>
                <button
                  className={`px-3 py-2 sm:px-4 font-semibold whitespace-nowrap text-sm sm:text-base
                           ${activeSection === 'security'
                             ? 'text-blue-500 border-b-2 border-blue-500'
                             : 'text-gray-500'}`}
                  onClick={() => setActiveSection('security')}
                >
                  Security
                </button>
                <button
                  className={`px-3 py-2 sm:px-4 font-semibold whitespace-nowrap text-sm sm:text-base
                           ${activeSection === 'picture'
                             ? 'text-blue-500 border-b-2 border-blue-500'
                             : 'text-gray-500'}`}
                  onClick={() => setActiveSection('picture')}
                >
                  Profile Picture
                </button>
              </div>

              {/* Settings Content */}
              <div className="mt-6">
                {activeSection === 'profile' && <ChangeNameForm user={user} setUser={setUser} />}
                {activeSection === 'security' && <ChangePasswordForm user={user} />}
                {activeSection === 'picture' && <ChangeProfilePictureForm user={user} setUser={setUser} />}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SettingsPage;
