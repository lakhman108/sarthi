import React, { useState } from 'react';
import CommentList from './CommentList';
import AddCommentForm from './AddCommentForm';
import useComments from './useComments';
import { ChevronDown, ChevronUp } from "lucide-react";

const CommentSection = ({ lectureId }) => {
    const { comments, addComment } = useComments(lectureId);
    const [isVisible, setIsVisible] = useState(false);

    return (
        <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center mb-4">
            <h3 className="text-lg font-bold text-gray-800 ml-2">Comments</h3>
                {isVisible ? (
                    <ChevronUp onClick={() => setIsVisible(false)} className="cursor-pointer" />
                ) : (
                    <ChevronDown onClick={() => setIsVisible(true)} className="cursor-pointer" />
                )}

            </div>

            {isVisible && <CommentList comments={comments} />}
            <AddCommentForm onAddComment={addComment} />
        </div>
    );
};

export default CommentSection;
