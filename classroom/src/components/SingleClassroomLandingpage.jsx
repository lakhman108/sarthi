import React from 'react';
import { useParams } from 'react-router-dom';
import Sidebar from './layout/Sidebar';
import useFetch from '../utils/useFetch';
import VideoClassroomUI from "./VideoClassroomUI";




const Classui = () => {
    const { id } = useParams(); // Get the 'id' parameter from the URL
    const data = useFetch(`https://superb-insight-production.up.railway.app/api/courses/${id}`); // Use the 'id' parameter in your fetch
    const classCode = data?.classCode;
    console.log(data);
    return (
        <div className="flex h-screen">
            <Sidebar />
            {data && <VideoClassroomUI courseName={data.courseName} classCode={classCode} />}
        </div>
    );
}

export default Classui;
