import React, { useEffect } from 'react';
import { ThumbsUp, Eye } from 'lucide-react';

const LectureInfo = ({ lecture, onLike }) => {
    useEffect(() => {

    }, [lecture]);
 return(
  <div className="bg-white p-5 rounded-lg border border-claude-200">
    <h2 className="text-lg font-display font-semibold mb-3 text-claude-900">{lecture.nameOfTopic}</h2>
    <div className="flex items-center gap-5 text-sm text-claude-700">
      <div className="flex items-center gap-1.5">
        <Eye size={16} className="text-claude-600" />
        <span className="font-body">{lecture.noOfViews} views</span>
      </div>
      <button 
        onClick={onLike} 
        className="flex items-center gap-1.5 hover:text-claude-900 transition-colors group"
      >
        <ThumbsUp size={16} className="text-claude-600 group-hover:text-claude-900 transition-colors" />
        <span className="font-body">{lecture.noOfLikes} likes</span>
      </button>
    </div>
  </div>
)};

export default LectureInfo;
