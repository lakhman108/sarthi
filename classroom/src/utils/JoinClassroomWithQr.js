import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';

const JoinClassroomWithQr = () => {
  const { inviteCode } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('initializing');
  const [error, setError] = useState(null);

  useEffect(() => {
    const joinClass = async () => {
      try {
        setStatus('joining');
        const token = Cookies.get('token')

        if (!token) {
          localStorage.setItem('pendingInviteCode', inviteCode);
          navigate('/login');
          return;
        }

        const response = await axios.post('http://localhost:3000/api/enrollments/join',
          { inviteCode },
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        setStatus('joined');
        navigate(`/classroom`);
      } catch (error) {
        setStatus('error');
        setError(error.response?.data?.error || 'Failed to join classroom');
      }
    };

    if (inviteCode) {
      joinClass();
    }
  }, [inviteCode, navigate]);

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
      </div>
    </div>
  );
};

export default JoinClassroomWithQr;
