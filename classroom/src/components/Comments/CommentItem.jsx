import React from 'react';
import { formatDate } from '../../utils/commentService';

const CommentItem = ({ comment }) => {

    return (
  <div className="mb-6 pb-6 border-b border-gray-100 last:border-0">
    <div className="flex items-center gap-3 mb-3">
      <img 
        src={comment.userId.profilePictureImageLink} 
        alt={comment.userId.username} 
        className="w-10 h-10 rounded-full ring-2 ring-sarthi-purple-100" 
      />
      <div>
        <span className="font-display font-bold text-gray-900 block">{comment.userId.username}</span>
        <span className="text-xs text-gray-500 font-body">{ formatDate(comment.createdAt)}</span>
      </div>
    </div>
    <p className="text-gray-700 font-body leading-relaxed ml-13">{comment.text}</p>
  </div>
)};

export default CommentItem;
