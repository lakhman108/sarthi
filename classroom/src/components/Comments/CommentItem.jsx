import React from 'react';
import { formatDate } from '../../utils/commentService';

const CommentItem = ({ comment }) => {

    return (
  <div className="mb-5 pb-5 border-b border-claude-100 last:border-0">
    <div className="flex items-center gap-2.5 mb-2.5">
      <img 
        src={comment.userId.profilePictureImageLink} 
        alt={comment.userId.username} 
        className="w-8 h-8 rounded-full ring-2 ring-claude-200" 
      />
      <div>
        <span className="font-display font-semibold text-claude-900 block text-sm">{comment.userId.username}</span>
        <span className="text-xs text-claude-600 font-body">{ formatDate(comment.createdAt)}</span>
      </div>
    </div>
    <p className="text-claude-800 font-body leading-relaxed ml-10.5 text-sm">{comment.text}</p>
  </div>
)};

export default CommentItem;
