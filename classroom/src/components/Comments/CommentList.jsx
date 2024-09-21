import React from 'react';
import CommentItem from './CommentItem';


const CommentList = ({ comments }) => {


    console.log(comments);
    return (
        <div>
            {comments && comments.map((comment, index) => (
               <CommentItem key={index} comment={comment} />

            ))}
        </div>
    )
};

export default CommentList;
