import React from 'react';
import { User, Book } from 'lucide-react';
import { useNavigate } from 'react-router-dom';


const ClassCard = ({_id, title, teacher, color, icon }) => {
const navigae=useNavigate();
const handleCardClick=()=>{
    navigae(`/classroom/${_id}`);
}

    return(
  <div className={`p-4 rounded-lg shadow-md hover:bg-purple-400 cursor-pointer ${color}` } onClick={handleCardClick} >
    <div className="flex justify-between items-start">
      <div>

        <h3 className="font-bold text-lg">{title}</h3>
        <p className="text-sm">{teacher}</p>
      </div>
      {icon}
    </div>
    <div className="mt-16 flex justify-between">
      <button className="p-2 hover:bg-gray-200 rounded-full">
        <User size={20} />
      </button>
      <button className="p-2 hover:bg-gray-200 rounded-full">
        <Book size={20} />
      </button>
    </div>
  </div>
)};

export default ClassCard;
