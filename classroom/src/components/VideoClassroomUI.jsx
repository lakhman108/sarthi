import React, { useContext, useEffect, useReducer, useState } from 'react';
import { useParams } from 'react-router-dom';
import Header from './layout/Header';
import VideoPlayer from './VideoPlayer';
import LectureInfo from './LectureInfo';
import CommentSection from './Comments/CommentSection';
import PlaylistItem from './PlaylistItem';
import { UserContext } from '../context/Usercontex';
import Loader from './layout/Loader';
import AddTopicModal from './TopicModal/AddTopicModal';
import axios from 'axios';



const VideoClassroomUI = ({ courseName }) => {

    const usercontex = useContext(UserContext);
    const { id } = useParams();
    const [currentLectureIndex, setCurrentLectureIndex] = useState(0);
    const [lectures, setLectures] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [like, setLike] = useState(false);

    const fetchLectures = async () => {
        setLoading(true);
        try {
            const response = await fetch(`http://localhost:3000/api/lectures/course/${id}`);
            const data = await response.json();
            setLectures(data);
        } catch (error) {
            console.error("Error fetching lectures:", error);
        } finally {
            setLoading(false);
        }
    };

    const refreshLecture = async (lectureId) => {
        try {
            const response = await fetch(`http://localhost:3000/api/lectures/${lectureId}`);
            const updatedLecture = await response.json();
            setLectures(prevLectures => prevLectures.map(lecture =>
                lecture._id === lectureId ? updatedLecture : lecture
            ));
        } catch (error) {
            console.error("Error refreshing lecture:", error);
        }
    };
    const handleLike = async () => {
        if (!currentLecture) {
            return;
        }
        try {
            //console.log(currentLecture);
            await axios.patch(`http://localhost:3000/api/lectures/${currentLecture._id}/like`);
            setLectures(
                prevLectures => prevLectures.map(lecture =>
                    lecture._id == currentLecture._id ? { ...lecture, noOfLikes: lecture.noOfLikes + 1 } : lecture
                )
            )
        } catch (error) {
            //console.log(error);
        }
    }

    useEffect(() => {
        fetchLectures();
    }, [id]);

    const handleLectureDeleted = (deletedLectureId) => {
        setLectures(prevLectures => prevLectures.filter(lecture => lecture._id !== deletedLectureId));
        if (currentLectureIndex >= lectures.length - 1) {
            setCurrentLectureIndex(Math.max(0, lectures.length - 2));
        }
    };

    const handleLectureEdited = (editedLectureId) => {
        refreshLecture(editedLectureId);
    };


    const currentLecture = lectures && lectures.length > 0 ? lectures[currentLectureIndex] : null;

    if (loading) {
        return (<Loader />);
    }

    return (
        <div className="flex bg-gray-50 min-h-screen w-full">
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header courseTitle={courseName} />
                <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
                    <div className="max-w-6xl mx-auto">
                        <div className="mb-6">
                            <h1 className="text-3xl font-bold text-gray-800 mb-2">{courseName}</h1>
                            <p className="text-gray-600">Course ID: {id}</p>
                        </div>
                        <div className="flex flex-col lg:flex-row space-y-6 lg:space-y-0 lg:space-x-6">
                            <div className="lg:w-3/4">
                                {currentLecture && (
                                    <>
                                        <VideoPlayer videoLink={currentLecture.videoLink} />
                                        <LectureInfo
                                            lecture={currentLecture}
                                            onLike={handleLike}

                                        />
                                        <CommentSection lectureId={currentLecture._id} />
                                    </>
                                )}
                            </div>
                            <aside className="w-80 bg-gray-100 p-2 overflow-y-auto">
                                <h3 className="font-bold p-4 bg-gray-100 text-gray-800">Course Playlist</h3>
                                <div className="overflow-y-auto max-h-[calc(100vh-20rem)]">
                                    {lectures.map((lecture, index) => (
                                        <PlaylistItem
                                            key={lecture._id}
                                            lecture={lecture}
                                            isActive={index === currentLectureIndex}
                                            onClick={() => setCurrentLectureIndex(index)}
                                            onLectureDeleted={handleLectureDeleted}
                                            onLectureEdited={() => handleLectureEdited(lecture._id)}
                                        />
                                    ))}
                                    {usercontex.user.role === "teacher" && (
                                        <button className="mt-4 w-full bg-green-500 hover:bg-green-600 text-white p-2 rounded" onClick={() => setIsModalOpen(true)}>
                                            Add New Topic
                                        </button>
                                    )}
                                    <AddTopicModal isOpen={isModalOpen} courseId={id} onClose={() => setIsModalOpen(false)} onTopicAdded={fetchLectures} />
                                </div>
                            </aside>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default VideoClassroomUI;
