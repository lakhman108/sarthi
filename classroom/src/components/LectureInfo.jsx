import React, { useEffect } from 'react';
import { ThumbsUp } from 'lucide-react';

const LectureInfo = ({ lecture, onLike }) => {
    useEffect(() => {
        
    }, [lecture]);
 return(
  <div className="bg-white p-4 rounded-lg mb-4 shadow">
<h1>{lecture.videoLink}</h1>
    <h2 className="text-xl font-bold mb-2 text-gray-800">{lecture.nameOfTopic}</h2>
    <div className="flex items-center space-x-4 text-sm text-gray-600">
      <span>{lecture.noOfViews} views</span>
      <button onClick={onLike} className="flex items-center space-x-1 hover:text-blue-600">
        <ThumbsUp size={16} />
        <span>{lecture.noOfLikes} likes</span>
      </button>
    </div>
  </div>
)};

export default LectureInfo;
