import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import Header from './Header';
import useFetch from '../utils/useFetch';
import VideoPlayer from './VideoPlayer';
import LectureInfo from './LectureInfo';
import CommentSection from './CommentSection';
import PlaylistItem from './PlaylistItem';

const VideoClassroomUI = () => {
  const { id } = useParams(); // Assuming you're using React Router and the course ID is in the URL
  const [currentLectureIndex, setCurrentLectureIndex] = useState(0);

  const lectures = useFetch(`http://localhost:3000/api/lectures/course/${id}`, {});

  if(lectures){
    for(let some of lectures){
        console.log(some);
        }
  }
  const currentLecture = lectures && lectures.length > 0 ? lectures[currentLectureIndex] : null;

  const handleLike = () => {

    console.log('Liked video:', currentLecture._id);
  };

  if (!lectures) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!lectures || lectures.length === 0) {
    return <div className="flex justify-center items-center h-screen">No lectures found for this course.</div>;
  }

  return (
    <div className="flex bg-gray-50 min-h-screen w-full">
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header courseTitle="Operating Systems" /> {/* You might want to fetch the course name separately */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Operating Systems</h1>
              <p className="text-gray-600">Course ID: {id}</p>
            </div>
            <div className="flex flex-col lg:flex-row space-y-6 lg:space-y-0 lg:space-x-6">
              <div className="lg:w-3/4">
                {currentLecture && (
                  <>
                    <VideoPlayer videoLink={""} />
                    <LectureInfo lecture={currentLecture} onLike={handleLike} />
                    <CommentSection comments={currentLecture.comments} />
                  </>
                )}
              </div>
              <div className="lg:w-1/4">
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <h3 className="font-bold p-4 bg-gray-100 text-gray-800">Course Playlist</h3>
                  <div className="overflow-y-auto max-h-[calc(100vh-20rem)]">
                    {lectures.map((lecture, index) => (
                      <PlaylistItem
                        key={lecture._id}
                        lecture={lecture}
                        isActive={index === currentLectureIndex}
                        onClick={() => setCurrentLectureIndex(index)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default VideoClassroomUI;
