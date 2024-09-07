import ClassCard from './ClassCard';
import React from 'react';
import { Grid3X3, Book } from 'lucide-react';
import Sidebar from './Sidebar';
import useFetch from '../utils/useFetch';
import Loader from "./Loader";
import Header from "./Header";

const ClassroomUI = () => {
  const courses = useFetch('http://localhost:3000/api/courses', {});

 
  const colors = ['bg-blue-200', 'bg-green-200', 'bg-slate-200'];

  return (
    <div className="flex bg-white">
      <Sidebar />
      <div className="flex-1">
        <Header></Header>
        <main className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {courses ? courses.map((course, index) => (
              <ClassCard
                key={course._id}
                _id={course._id}
                title={course.courseName}
                teacher={course.teacherId.username}
                color={colors[index % colors.length]}
                icon={<Book size={24} />}
              />
            )) : <Loader></Loader>}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ClassroomUI;
