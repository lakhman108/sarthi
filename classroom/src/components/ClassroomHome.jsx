import React, { useState, useEffect,useContext } from 'react';
import ClassCard from './ClassCard';
import Sidebar from './layout/Sidebar';
import Loader from "./layout/Loader";
import Header from "./layout/Header";
import useAxiosFetch from '../utils/fetchClasses';
import axios from 'axios';
import Cookies from 'js-cookie';
import { UserContext } from '../context/Usercontex';

const ClassroomUI = () => {
    const {user}=useContext(UserContext);
    console.log("----------------------")
    console.log(user)
  const [courses, setCourses] = useState([]);
  const savedToken = Cookies.get('token');

//   console.log("Saved Token:", savedToken);
  const { data, loading, error, refetch } = useAxiosFetch('http://localhost:3000/api/courses', {
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
    'bg-blue-200','bg-green-200','bg-slate-200','bg-violet-200','bg-teal-200',
    'bg-indigo-200','bg-rose-200','bg-cyan-200','bg-orange-200','bg-emerald-200',
    'bg-fuchsia-200','bg-lime-200','bg-sky-200'
  ];


  const handleDelete = async (id) => {
    try {
     const savedToken = Cookies.get('token');
      await axios.delete(`http://localhost:3000/api/courses/${id}`,{
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
      await axios.patch(`http://localhost:3000/api/courses/${id}`, { courseName: newTitle });
      setCourses(courses.map(course =>
        course._id === id ? { ...course, courseName: newTitle } : course
      ));
    } catch (error) {
      console.error('Error editing class:', error);
    }
  };

  return (
    <div className="flex bg-white">
      <Sidebar />
      <div className="flex-1">
        <Header refresh={refetch}/>
        <main className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {loading ? <Loader /> : courses.map((course, index) => (

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
        </main>
      </div>
    </div>
  );
};

export default ClassroomUI;
