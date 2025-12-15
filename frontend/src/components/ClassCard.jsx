import React, { useState } from 'react';
import { Users, BookOpen, MoreVertical, ArrowRight, GraduationCap } from 'lucide-react';
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
      className="group relative bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-2xl hover:border-sarthi-purple-300 transition-all duration-300 cursor-pointer overflow-hidden transform hover:-translate-y-1"
      onClick={handleCardClick}
    >
      {/* Animated gradient background on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-sarthi-purple-50 via-purple-50 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      {/* Top accent bar with gradient */}
      <div className="h-1.5 bg-gradient-to-r from-sarthi-purple-500 via-purple-600 to-sarthi-purple-700"></div>
      
      <div className="relative p-6">
        {/* Header section */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex-1 pr-4">
            <h3 className="font-display font-bold text-xl text-gray-900 mb-3 group-hover:text-sarthi-purple-700 transition-colors line-clamp-2">
              {title}
            </h3>
            <div className="flex items-center gap-2 text-gray-600">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sarthi-purple-400 to-purple-600 flex items-center justify-center">
                <GraduationCap size={16} className="text-white" />
              </div>
              <span className="text-sm font-body font-medium">{teacher}</span>
            </div>
          </div>
          
          {role === "teacher" && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowOptions(true);
              }}
              className="p-2 hover:bg-white rounded-lg transition-all opacity-0 group-hover:opacity-100 shadow-sm"
            >
              <MoreVertical size={18} className="text-gray-500" />
            </button>
          )}
        </div>
        
        {/* Stats/Actions section */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex gap-4">
            <div className="flex items-center gap-1.5 text-gray-500">
              <Users size={16} />
              <span className="text-xs font-body font-medium">24</span>
            </div>
            <div className="flex items-center gap-1.5 text-gray-500">
              <BookOpen size={16} />
              <span className="text-xs font-body font-medium">12</span>
            </div>
          </div>
          
          <div className="flex items-center gap-1 text-sarthi-purple-600 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
            <span className="text-sm font-semibold font-body">Open</span>
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
      
      {/* Decorative corner element */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-sarthi-purple-100 to-transparent rounded-bl-full opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
      
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
