import React, { useState, useEffect, useContext } from 'react';
import ClassCard from './ClassCard';
import Sidebar from './layout/Sidebar';
import Loader from "./layout/Loader";
import Header from "./layout/Header";
import useAxiosFetch from '../utils/fetchClasses';
import axios from 'axios';
import Cookies from 'js-cookie';
import { UserContext } from '../context/Usercontex';
import { BookOpen } from 'lucide-react';
import config from '../config/config';
const ClassroomUI = () => {
    const { user } = useContext(UserContext);
    // console.log("----------------------")
    // console.log(user)
    const [courses, setCourses] = useState([]);
    const savedToken = Cookies.get('token');

    //   console.log("Saved Token:", savedToken);
    const { data, loading, error, refetch } = useAxiosFetch(`${process.env.REACT_APP_API_URL}/api/courses`, {
        headers: {
            Authorization: `Bearer ${savedToken}`,
        }
    });

    useEffect(() => {
        if (data) {
            setCourses(data);
        }
    }, [data]);

    const colors = [
        'bg-blue-200', 'bg-green-200', 'bg-slate-200', 'bg-violet-200', 'bg-teal-200',
        'bg-indigo-200', 'bg-rose-200', 'bg-cyan-200', 'bg-orange-200', 'bg-emerald-200',
        'bg-fuchsia-200', 'bg-lime-200', 'bg-sky-200'
    ];


    const handleDelete = async (id) => {
        try {
            const savedToken = Cookies.get('token');
            await axios.delete(`${process.env.REACT_APP_API_URL}/api/courses/${id}`, {
                headers: {
                    Authorization: `Bearer ${savedToken}`,
                },
            });
            setCourses(courses.filter(course => course._id !== id));
        } catch (error) {
            console.error('Error deleting class:', error);
        }
    };

    const handleEdit = async (id, newTitle) => {
        try {
            await axios.patch(`${process.env.REACT_APP_API_URL}/api/courses/${id}`, { courseName: newTitle });
            setCourses(courses.map(course =>
                course._id === id ? { ...course, courseName: newTitle } : course
            ));
        } catch (error) {
            console.error('Error editing class:', error);
        }
    };

    return (
        <div className="flex bg-claude-50 min-h-screen">
            <Sidebar />
            <div className="flex-1">
                <Header refresh={refetch} />
                <main className="p-6 md:p-10 max-w-7xl mx-auto">
                    {loading ? (
                        <Loader />
                    ) : (
                        <>
                            {courses.length > 0 ? (
                                <>
                                    <div className="mb-8">
                                        <h2 className="text-2xl md:text-3xl font-display font-semibold text-claude-900 mb-1">
                                            Your Classrooms
                                        </h2>
                                        <p className="text-claude-700 font-body text-sm">
                                            {courses.length} {courses.length === 1 ? 'course' : 'courses'}
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {courses.map((course, index) => (
                                            <ClassCard
                                                role={user.role}
                                                key={course._id}
                                                inviteCode={course.inviteCode}
                                                classCode={course.classCode}
                                                _id={course._id}
                                                title={course.courseName}
                                                teacher={course.teacherId.username}
                                                color={colors[index % colors.length]}
                                                onDelete={handleDelete}
                                                onEdit={handleEdit}
                                            />
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-20">
                                    <div className="w-16 h-16 bg-claude-200 rounded-2xl flex items-center justify-center mb-4">
                                        <BookOpen size={32} className="text-claude-700" />
                                    </div>
                                    <h3 className="text-xl font-display font-semibold text-claude-900 mb-2">
                                        No classrooms yet
                                    </h3>
                                    <p className="text-claude-700 font-body text-center max-w-md text-sm">
                                        {user.role === 'teacher' 
                                            ? 'Create your first classroom to start teaching'
                                            : 'Join a classroom using an invite code to get started'}
                                    </p>
                                </div>
                            )}
                        </>
                    )}
                </main>
            </div>
        </div>
    );
};

export default ClassroomUI;
