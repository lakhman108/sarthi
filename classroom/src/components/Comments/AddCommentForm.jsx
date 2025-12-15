import React from 'react';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';

const AddCommentForm = ({ onAddComment }) => {
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!comment.trim()) return;

    try {
      setIsSubmitting(true);
      await onAddComment(comment.trim());
      setComment('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label
          htmlFor="comment"
          className="block text-sm font-medium text-gray-700"
        >
          Add a comment
        </label>

        <textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your thoughts..."
          disabled={isSubmitting}
          className="
            w-full min-h-[100px] p-3 rounded-lg
            border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500
            disabled:bg-gray-50 disabled:text-gray-500
            placeholder:text-gray-400
            transition-colors duration-200
          "
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting || !comment.trim()}
        className="
          inline-flex items-center justify-center
          px-4 py-2 rounded-lg
          bg-blue-500 hover:bg-blue-600
          text-white font-medium
          transition-colors duration-200
          disabled:bg-gray-300 disabled:cursor-not-allowed
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        "
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Submitting...
          </>
        ) : (
          'Add Comment'
        )}
      </button>
    </form>
  );
};

export default AddCommentForm;
