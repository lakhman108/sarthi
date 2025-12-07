import React, { useState } from 'react';
import CommentList from './CommentList';
import AddCommentForm from './AddCommentForm';
import useComments from './useComments';
import { ChevronDown, ChevronUp, MessageCircle } from "lucide-react";

const CommentSection = ({ lectureId }) => {
    const { comments, addComment } = useComments(lectureId);
    const [isVisible, setIsVisible] = useState(false);

    return (
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
            <button 
                onClick={() => setIsVisible(!isVisible)}
                className="flex items-center justify-between w-full mb-6 group"
            >
                <div className="flex items-center gap-3">
                    <MessageCircle className="text-sarthi-purple-600" size={24} />
                    <h3 className="text-xl font-display font-bold text-gray-900">
                        Comments {comments.length > 0 && `(${comments.length})`}
                    </h3>
                </div>
                {isVisible ? (
                    <ChevronUp className="text-gray-400 group-hover:text-sarthi-purple-600 transition-colors" size={20} />
                ) : (
                    <ChevronDown className="text-gray-400 group-hover:text-sarthi-purple-600 transition-colors" size={20} />
                )}
            </button>

            {isVisible && (
                <div className="mb-6 animate-slide-up">
                    <CommentList comments={comments} />
                </div>
            )}
            <AddCommentForm onAddComment={addComment} />
        </div>
    );
};

export default CommentSection;
