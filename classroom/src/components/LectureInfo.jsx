import React, { useEffect } from 'react';
import { ThumbsUp, Eye } from 'lucide-react';

const LectureInfo = ({ lecture, onLike }) => {
    useEffect(() => {

    }, [lecture]);
 return(
  <div className="bg-white p-6 rounded-2xl mb-6 shadow-lg border border-gray-100">
    <h2 className="text-2xl font-display font-bold mb-4 text-gray-900">{lecture.nameOfTopic}</h2>
    <div className="flex items-center gap-6 text-sm text-gray-600">
      <div className="flex items-center gap-2">
        <Eye size={18} className="text-gray-400" />
        <span className="font-body font-medium">{lecture.noOfViews} views</span>
      </div>
      <button 
        onClick={onLike} 
        className="flex items-center gap-2 hover:text-sarthi-purple-600 transition-colors group"
      >
        <ThumbsUp size={18} className="text-gray-400 group-hover:text-sarthi-purple-600 transition-colors" />
        <span className="font-body font-medium">{lecture.noOfLikes} likes</span>
      </button>
    </div>
  </div>
)};

export default LectureInfo;
