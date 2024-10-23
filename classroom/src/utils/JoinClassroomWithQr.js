import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import  Cookies from 'js-cookie';
const JoinClassroomWithQr = () => {
  const { inviteCode } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('initializing');
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState({});

  useEffect(() => {
    const joinClass = async () => {
      // Debug log
      console.log('Starting join process');
      console.log('Invite code:', inviteCode);

      try {
        setStatus('joining');
        const token = Cookies.get('token')

        // Debug log
        console.log('Auth token exists:', !!token);

        if (!token) {
          console.log('No token found - redirecting to login');
          // Save the invite code to return after login
          localStorage.setItem('pendingInviteCode', inviteCode);
          navigate('/login');
          return;
        }

        // Debug log
        console.log('Making join request to server');

        const response = await axios.post('http://localhost:3000/api/enrollments/join',
          { inviteCode },
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        // Debug log
        console.log('Server response:', response.data);

        setStatus('joined');
        // Navigate to the course page
        navigate(`/classroom`);
      } catch (error) {
        console.error('Join error:', error);
        console.error('Error response:', error.response?.data);

        setStatus('error');
        setError(error.response?.data?.error || 'Failed to join classroom');

        // Set detailed debug info
        setDebugInfo({
          errorMessage: error.message,
          responseData: error.response?.data,
          statusCode: error.response?.status
        });
      }
    };

    if (inviteCode) {
      joinClass();
    }
  }, [inviteCode, navigate]);

  // Function to display debug information
  const renderDebugInfo = () => {
    if (process.env.NODE_ENV !== 'development') return null;

    return (
      <div className="mt-4 p-4 bg-gray-100 rounded text-sm">
        <h3 className="font-bold mb-2">Debug Information:</h3>
        <ul className="space-y-1">
          <li>Status: {status}</li>
          <li>Invite Code: {inviteCode || 'Not provided'}</li>
          <li>Error: {error || 'None'}</li>
          {Object.entries(debugInfo).map(([key, value]) => (
            <li key={key}>
              {key}: {JSON.stringify(value)}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-xl font-semibold mb-4 text-center">
          {status === 'error' ? 'Error Joining Classroom' : 'Joining Classroom'}
        </h1>

        {status === 'initializing' && (
          <div className="text-center text-gray-600">
            <p>Initializing join process...</p>
          </div>
        )}

        {status === 'joining' && (
          <div className="text-center text-gray-600">
            <p>Joining classroom...</p>
            <div className="mt-4 w-8 h-8 border-t-2 border-blue-500 border-solid rounded-full animate-spin mx-auto"></div>
          </div>
        )}

        {status === 'error' && (
          <div className="bg-red-50 border border-red-200 rounded p-4">
            <p className="text-red-700 mb-4">{error}</p>
            <div className="flex justify-between">
              <button
                onClick={() => navigate(-1)}
                className="px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
              >
                Go Back
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {renderDebugInfo()}
      </div>
    </div>
  );
};

export default JoinClassroomWithQr;
