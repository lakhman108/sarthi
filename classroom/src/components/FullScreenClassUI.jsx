import React, { useCallback } from 'react';
import { useParams } from 'react-router-dom';
import Sidebar from './Sidebar';
import useFetch from '../utils/useFetch';
import VideoClassroomUI from "./VideoClassroomUI";




const Classui = () => {
  const { id } = useParams(); // Get the 'id' parameter from the URL
  const data = useFetch(`http://localhost:3000/api/courses/${id}`, {}); // Use the 'id' parameter in your fetch request
  console.log(data);

  return (
    <div className="flex h-screen">
      <Sidebar />
      <VideoClassroomUI />
    </div>
  );
}

export default Classui;
