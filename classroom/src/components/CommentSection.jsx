import React from 'react';
const CommentSection = ({ comments }) => (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-bold mb-4 text-gray-800">Comments</h3>
      {comments.map((comment,index) => (
        <div key={index} className="mb-4">
          <div className="flex items-center space-x-2 mb-1">
            <img src="/api/placeholder/24/24" alt="User avatar" className="w-6 h-6 rounded-full" />
            <span className="font-bold text-gray-800">{comment.userId.username}</span>
            <span className="text-sm text-gray-600">{new Date(comment.createdAt).toLocaleString()}</span>
          </div>
          <p className="text-gray-700">{comment.text}</p>
        </div>
      
      ))}
    </div>
  );
export default CommentSection;
