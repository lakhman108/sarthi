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
    const newComment = await postComment(lectureId, text);
    setComments((e)=>[...newComment]);
  };

  return { comments, addComment };
};

export default useComments;
