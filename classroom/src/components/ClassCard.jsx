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
      className="group relative bg-white rounded-xl border border-claude-200 hover:border-claude-300 hover:shadow-sm transition-all duration-200 cursor-pointer overflow-hidden"
      onClick={handleCardClick}
    >
      <div className="relative p-5">
        {/* Header section */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1 pr-4">
            <h3 className="font-display font-semibold text-base text-claude-900 mb-2 line-clamp-2">
              {title}
            </h3>
            <div className="flex items-center gap-2 text-claude-700">
              <div className="w-6 h-6 rounded-full bg-claude-200 flex items-center justify-center">
                <GraduationCap size={14} className="text-claude-700" />
              </div>
              <span className="text-xs font-body">{teacher}</span>
            </div>
          </div>
          
          {role === "teacher" && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowOptions(true);
              }}
              className="p-1.5 hover:bg-claude-100 rounded-lg transition-all opacity-0 group-hover:opacity-100"
            >
              <MoreVertical size={16} className="text-claude-600" />
            </button>
          )}
        </div>
        
        {/* Stats section */}
        <div className="flex items-center gap-4 pt-3 border-t border-claude-100">
          <div className="flex items-center gap-1.5 text-claude-600">
            <Users size={14} />
            <span className="text-xs font-body">24</span>
          </div>
          <div className="flex items-center gap-1.5 text-claude-600">
            <BookOpen size={14} />
            <span className="text-xs font-body">12</span>
          </div>
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
