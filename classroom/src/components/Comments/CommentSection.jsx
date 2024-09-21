import React from 'react';
import CommentList from './CommentList';
import AddCommentForm from './AddCommentForm';
import useComments from './useComments';


const CommentSection = ({ lectureId }) => {
    const { comments, addComment } = useComments(lectureId);

    return (
        <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-bold mb-4 text-gray-800">Comments</h3>
            <CommentList comments={comments} />
            <AddCommentForm onAddComment={addComment} />
        </div>
    );
};

export default CommentSection;
