import React, { useState } from 'react';
import CommentList from './CommentList';
import AddCommentForm from './AddCommentForm';
import useComments from './useComments';
import { ChevronDown, ChevronUp, MessageCircle } from "lucide-react";

const CommentSection = ({ lectureId }) => {
    const { comments, addComment } = useComments(lectureId);
    const [isVisible, setIsVisible] = useState(false);

    return (
        <div className="bg-white p-5 rounded-lg border border-claude-200">
            <button 
                onClick={() => setIsVisible(!isVisible)}
                className="flex items-center justify-between w-full mb-5 group"
            >
                <div className="flex items-center gap-2">
                    <MessageCircle className="text-claude-700" size={20} />
                    <h3 className="text-base font-display font-semibold text-claude-900">
                        Comments {comments.length > 0 && `(${comments.length})`}
                    </h3>
                </div>
                {isVisible ? (
                    <ChevronUp className="text-claude-600 group-hover:text-claude-900 transition-colors" size={18} />
                ) : (
                    <ChevronDown className="text-claude-600 group-hover:text-claude-900 transition-colors" size={18} />
                )}
            </button>

            {isVisible && (
                <div className="mb-5 animate-slide-up">
                    <CommentList comments={comments} />
                </div>
            )}
            <AddCommentForm onAddComment={addComment} />
        </div>
    );
};

export default CommentSection;
