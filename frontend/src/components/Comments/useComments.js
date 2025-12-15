import { useState, useEffect } from 'react';
import { fetchComments, postComment } from '../../utils/commentService';

const useComments = (lectureId) => {
  const [comments, setComments] = useState([]);

  useEffect(() => {
    const loadComments = async () => {
      const fetchedComments = await fetchComments(lectureId);
      setComments(fetchedComments);
    };
    loadComments();
  }, [lectureId]);

  const addComment = async (text) => {
    let newComment = await postComment(lectureId, text);
    newComment=await fetchComments(lectureId);
    
    setComments((e)=>[...newComment]);
  };

  return { comments, addComment };
};

export default useComments;
