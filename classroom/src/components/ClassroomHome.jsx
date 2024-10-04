import ClassCard from './ClassCard';
import React from 'react';
import { EllipsisVertical } from 'lucide-react';
import Sidebar from './layout/Sidebar';

import Loader from "./layout/Loader";
import Header from "./layout/Header";
import useAxiosFetch from './fetchClasses';

const ClassroomUI = () => {
  const { data: courses, loading, error, refetch } = useAxiosFetch('http://localhost:3000/api/courses', {});

  const colors = ['bg-blue-200', 'bg-green-200', 'bg-slate-200', 'bg-pink-200', 'bg-violet-200'];

  return (
    <div className="flex bg-white">
      <Sidebar />
      <div className="flex-1">
        <Header refresh={refetch}/>
        <main className="p-6">

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {loading ? <Loader /> : courses ? courses.map((course, index) => (
              <ClassCard
                key={course._id}
                _id={course._id}
                title={course.courseName}
                teacher={course.teacherId.username}
                color={colors[index % colors.length]}
                icon={<EllipsisVertical />}
              />
            )) : <p>No courses available</p>}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ClassroomUI;
