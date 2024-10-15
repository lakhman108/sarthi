import React, { useState } from 'react';
import { User, Book, EllipsisVertical } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import OptionsModal from './OptionsModal';

const ClassCard = ({ _id, title, teacher, color, onDelete, onEdit,role }) => {
  const [showOptions, setShowOptions] = useState(false);
  const navigate = useNavigate();

  // Handles navigating when the card (except interactive elements) is clicked
  const handleCardClick = () => {
    if (!showOptions) {
      navigate(`/classroom/${_id}`);
    }
  };

  return (
    <div
      className={`p-4 rounded-lg shadow-md hover:bg-purple-400 cursor-pointer ${color}`}
      onClick={handleCardClick} // Click on card will navigate unless OptionsModal is open
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-bold text-lg">{title}</h3>
          <p className="text-sm">{teacher}</p>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation(); // Prevent navigation when options are clicked
            setShowOptions(true);
          }}
          className="p-2 hover:bg-gray-200 rounded-full"
        >
          {role ==="teacher" && <EllipsisVertical size={20} />}
        </button>
      </div>
      <div className="mt-16 flex justify-between">
        <button
          className="p-2 hover:bg-gray-200 rounded-full"
          onClick={(e) => e.stopPropagation()} // Prevent navigation when User icon is clicked
        >
          <User size={20} />
        </button>
        <button
          className="p-2 hover:bg-gray-200 rounded-full"
          onClick={(e) => e.stopPropagation()} // Prevent navigation when Book icon is clicked
        >
          <Book size={20} />
        </button>
      </div>
      {showOptions && (
        <OptionsModal
          onClose={() => setShowOptions(false)}
          onDelete={() => {
            onDelete(_id);
            setShowOptions(false);
          }}
          onEdit={(newTitle) => {
            onEdit(_id, newTitle);
            setShowOptions(false);
          }}
          currentTitle={title}
        />
      )}
    </div>
  );
};

export default ClassCard;
