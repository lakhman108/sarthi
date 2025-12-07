import React, { useState } from 'react';
import { User, Book, EllipsisVertical, GraduationCap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import OptionsModal from './OptionsModal';

const ClassCard = ({ _id, title, teacher, color, onDelete, onEdit, role }) => {
  const [showOptions, setShowOptions] = useState(false);
  const navigate = useNavigate();

  const handleCardClick = () => {
    if (!showOptions) {
      navigate(`/classroom/${_id}`);
    }
  };

  return (
    <div
      className="group relative bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl hover:border-sarthi-purple-200 transition-all cursor-pointer overflow-hidden"
      onClick={handleCardClick}
    >
      {/* Gradient accent bar */}
      <div className="h-2 bg-gradient-to-r from-sarthi-purple-500 to-purple-600"></div>
      
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="font-display font-bold text-xl text-gray-900 mb-2 group-hover:text-sarthi-purple-600 transition-colors">
              {title}
            </h3>
            <p className="text-sm text-gray-600 font-body flex items-center gap-2">
              <GraduationCap size={16} className="text-sarthi-purple-500" />
              {teacher}
            </p>
          </div>
          {role === "teacher" && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowOptions(true);
              }}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <EllipsisVertical size={20} className="text-gray-400" />
            </button>
          )}
        </div>
        
        <div className="flex gap-3 pt-4 border-t border-gray-100">
          <button
            className="flex items-center gap-2 px-3 py-2 hover:bg-sarthi-purple-50 rounded-lg transition-colors text-sm font-body text-gray-600 hover:text-sarthi-purple-600"
            onClick={(e) => e.stopPropagation()}
          >
            <User size={16} />
            <span>Students</span>
          </button>
          <button
            className="flex items-center gap-2 px-3 py-2 hover:bg-sarthi-purple-50 rounded-lg transition-colors text-sm font-body text-gray-600 hover:text-sarthi-purple-600"
            onClick={(e) => e.stopPropagation()}
          >
            <Book size={16} />
            <span>Materials</span>
          </button>
        </div>
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
