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
import Cookies from 'js-cookie';
import { ToastContainer } from 'react-toastify';
import { handleNoteSave } from '../utils/notesService';
import ShareClassroom from './ShareClassroom';
import config from '../config/config';

const VideoClassroomUI = ({ courseName, classCode }) => {
    const usercontex = useContext(UserContext);
    const { id } = useParams();
    const [currentLectureIndex, setCurrentLectureIndex] = useState(0);
    const [lectures, setLectures] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [like, setLike] = useState(false);
    const [note, setNote] = useState('');
    const [showShare, setShowShare] = useState(false);

    
    const handleLectureSelect = async (index) => {
        setCurrentLectureIndex(index);
        const selectedLecture = lectures[index];

        try {
            // await axios.patch(`${process.env.REACT_APP_API_URL}/api/lectures/${selectedLecture._id}/view`);
            setLectures(prevLectures => prevLectures.map(lecture =>
                lecture._id === selectedLecture._id
                    ? { ...lecture, noOfViews: lecture.noOfViews + 1 }
                    : lecture
            ));
        } catch (error) {
            console.error("Error updating views:", error);
        }
    };

    useEffect(() => {
        // Fetch existing note when component mounts
        const fetchNote = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/enrollments/${id}/notes`,
                    {
                        headers: {
                            Authorization: `Bearer ${Cookies.get('token')}`,
                        },
                    }
                );
                setNote(response.data.notes || '');
            } catch (error) {
                console.error("Error fetching note:", error);
            }
        };
        fetchNote();
    }, [id]);


    const fetchLectures = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/lectures/course/${id}`);
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
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/lectures/${lectureId}`);
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
            await axios.patch(`${process.env.REACT_APP_API_URL}/api/lectures/${currentLecture._id}/like`);
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
            <ToastContainer />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header courseTitle={courseName} />
                <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6">
                    <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">
                        {/* Course Header */}
                        <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm p-4 sm:p-6">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">{courseName}</h1>
                                {usercontex.user.role === "teacher" && (
                                    <button
                                        onClick={() => setShowShare(!showShare)}
                                        className="w-full sm:w-auto inline-flex items-center justify-center px-4 sm:px-6 py-2 sm:py-2.5
                                                 bg-gradient-to-r from-blue-500 to-blue-600
                                                 hover:from-blue-600 hover:to-blue-700
                                                 text-white text-sm sm:text-base font-medium rounded-lg sm:rounded-xl
                                                 shadow-md hover:shadow-lg transition-all duration-200"
                                    >
                                        {showShare ? 'Hide Share' : 'Share Classroom'}
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Main Content Container */}
                        <div className="flex flex-col gap-4 sm:gap-6">
                            {/* Mobile Share Section */}
                            {showShare && (
                                <div className="block lg:hidden bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6">
                                    <h3 className="font-bold text-gray-800 mb-4">Share Classroom</h3>
                                    <ShareClassroom inviteCode={classCode} />
                                </div>
                            )}

                            {/* Video and Playlist Container */}
                            <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
                                {/* Video Player Section */}
                                <div className="w-full lg:w-3/4">
                                    {currentLecture && (
                                        <div className="space-y-4 sm:space-y-6">
                                            <VideoPlayer videoLink={currentLecture.videoLink}
                                            lectureId={currentLecture._id}
                                            />
                                            <LectureInfo lecture={currentLecture} onLike={handleLike} />
                                            <CommentSection lectureId={currentLecture._id} />
                                        </div>
                                    )}
                                </div>

                                {/* Playlist/Share Sidebar */}
                                <aside className="w-full lg:w-80 bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden">
                                    {(showShare && window.innerWidth >= 1024) ? (
                                        <div className="p-4 sm:p-6">
                                            <h3 className="font-bold text-gray-800 mb-4">Share Classroom</h3>
                                            <ShareClassroom inviteCode={classCode} />
                                        </div>
                                    ) : (
                                        <>
                                            <h3 className="font-bold p-4 bg-gray-50 text-gray-800">Course Playlist</h3>
                                            <div className="overflow-y-auto max-h-[60vh] lg:max-h-[calc(100vh-20rem)] p-2">
                                                {lectures.map((lecture, index) => (
                                                    <PlaylistItem
                                                        key={lecture._id}
                                                        lecture={lecture}
                                                        isActive={index === currentLectureIndex}
                                                        onClick={() => {
                                                            setCurrentLectureIndex(index);
                                                            handleLectureSelect(index);
                                                        }}
                                                        onLectureDeleted={handleLectureDeleted}
                                                        onLectureEdited={() => handleLectureEdited(lecture._id)}
                                                    />
                                                ))}
                                                {usercontex.user.role === "teacher" && (
                                                    <button
                                                        onClick={() => setIsModalOpen(true)}
                                                        className="mt-4 w-full bg-gradient-to-r from-green-500 to-green-600
                                                                 hover:from-green-600 hover:to-green-700
                                                                 text-white p-2 sm:p-3 rounded-lg sm:rounded-xl
                                                                 text-sm sm:text-base font-medium
                                                                 shadow-md hover:shadow-lg transition-all duration-200"
                                                    >
                                                        Add New Topic
                                                    </button>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </aside>
                            </div>

                            {/* Notes Section */}
                            <div className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-lg">
                                <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">Course Notes</h3>
                                <textarea
                                    className="w-full h-24 sm:h-32 p-3 sm:p-4 border rounded-lg sm:rounded-xl
                                             focus:ring-2 focus:ring-blue-500 focus:border-transparent
                                             text-sm sm:text-base transition-all duration-200"
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    placeholder="Take notes for this course..."
                                />
                                <button
                                    className="mt-4 w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-2.5
                                             bg-gradient-to-r from-blue-500 to-blue-600
                                             hover:from-blue-600 hover:to-blue-700 text-white
                                             text-sm sm:text-base font-medium rounded-lg sm:rounded-xl
                                             shadow-md hover:shadow-lg transition-all duration-200"
                                    onClick={() => handleNoteSave(id, note)}
                                >
                                    Save Notes
                                </button>
                            </div>
                        </div>
                    </div>
                </main>

                <AddTopicModal
                    isOpen={isModalOpen}
                    courseId={id}
                    onClose={() => setIsModalOpen(false)}
                    onTopicAdded={fetchLectures}
                />
            </div>
        </div>
    );

};

export default VideoClassroomUI;
