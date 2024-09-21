import React from 'react';
import { formatDate } from '../../utils/commentService';

const CommentItem = ({ comment }) => {

    return (
  <div className="mb-4">
    <div className="flex items-center space-x-2 mb-1">
      <img src="/api/placeholder/24/24" alt="User avatar" className="w-6 h-6 rounded-full" />
      <span className="font-bold text-gray-800">{comment.userId.username}</span>
      <span className="text-sm text-gray-600">{ formatDate(comment.createdAt)}</span>
    </div>
    <p className="text-gray-700">{comment.text}</p>
  </div>
)};

export default CommentItem;
