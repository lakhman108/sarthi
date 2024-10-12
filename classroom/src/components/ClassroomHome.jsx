import React, { useState, useEffect } from 'react';
import ClassCard from './ClassCard';
import Sidebar from './layout/Sidebar';
import Loader from "./layout/Loader";
import Header from "./layout/Header";
import useAxiosFetch from './fetchClasses';
import axios from 'axios';

const ClassroomUI = () => {
  const [courses, setCourses] = useState([]);
  const { data, loading, error, refetch } = useAxiosFetch('http://localhost:3000/api/courses', {});

  useEffect(() => {
    if (data) {
      setCourses(data);
    }
  }, [data]);

  const colors = ['bg-blue-200', 'bg-green-200', 'bg-slate-200', 'bg-pink-200', 'bg-violet-200'];

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:3000/api/courses/${id}`);
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
                key={course._id}
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
