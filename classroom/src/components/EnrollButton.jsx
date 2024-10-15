import React, { useContext, useState } from 'react';
import axios from 'axios';
import { UserContext } from '../context/Usercontex';

const EnrollButton = ({ courseId }) => {
  const { user } = useContext(UserContext);
  const [isEnrolled, setIsEnrolled] = useState(false);

  const handleEnroll = async () => {
    try {
        console.log(user);
      await axios.post('http://localhost:3000/api/enrollments', {
        studentId: user._id,
        courseId: courseId
      });
      setIsEnrolled(true);
    } catch (error) {
      console.error('Error enrolling in course:', error);
    }
  };

  return (
    <button
      onClick={handleEnroll}
      disabled={isEnrolled}
      className={`px-4 py-2 rounded ${isEnrolled ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
    >
      {isEnrolled ? 'Enrolled' : 'Enroll'}
    </button>
  );
};

export default EnrollButton;
