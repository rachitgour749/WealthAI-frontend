import React, { useState } from 'react';
import { FaStar } from 'react-icons/fa';

const RatingDisplay = ({ rating, traceId, onFeedbackSubmit }) => {
  const [userRating, setUserRating] = useState(null);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const sendFeedback = async (traceId, rating, comment = "") => {
    try {
      const response = await fetch('http://localhost:8000/api/rate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          trace_id: traceId,
          user_rating: rating,
          feedback_comment: comment,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit feedback');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error submitting feedback:', error);
      throw error;
    }
  };

  const handleFeedbackSubmit = async () => {
    if (!userRating || !traceId) return;
    
    setIsSubmitting(true);
    try {
      const result = await sendFeedback(traceId, userRating, feedbackComment);
      onFeedbackSubmit(result);
      setIsExpanded(false);
      setUserRating(null);
      setFeedbackComment('');
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStarClick = async (star) => {
    setUserRating(star);
    // Auto-submit feedback when star is clicked
    if (traceId) {
      setIsSubmitting(true);
      try {
        const result = await sendFeedback(traceId, star, feedbackComment);
        if (result.success) {
          onFeedbackSubmit(result);
          setFeedbackComment('');
          // Show success message briefly
          setTimeout(() => {
            setUserRating(null);
          }, 2000);
        }
      } catch (error) {
        console.error('Failed to submit feedback:', error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const renderStars = (rating, interactive = false, onClick = null) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <FaStar
            key={star}
            onClick={interactive ? () => onClick(star) : undefined}
            className={`text-sm ${interactive ? 'cursor-pointer' : ''} ${
              rating && star <= rating ? 'text-yellow-400' : 'text-gray-300'
            } ${interactive ? 'hover:text-yellow-400 transition-colors' : ''}`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white bg-opacity-90 backdrop-blur-sm rounded-lg border border-white border-opacity-30 p-3 shadow-lg">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-600 font-medium">Rate this response:</span>
          {renderStars(userRating || 0, true, handleStarClick)}
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs text-emerald-600 hover:text-emerald-800 font-medium"
        >
          {isExpanded ? 'Hide' : 'Add comment'}
        </button>
      </div>

      {isExpanded && (
        <div className="mt-2">
          <textarea
            value={feedbackComment}
            onChange={(e) => setFeedbackComment(e.target.value)}
            placeholder="Optional: Add your feedback..."
            className="w-full p-2 text-xs border border-gray-300 rounded resize-none"
            rows="2"
          />
        </div>
      )}

             {isSubmitting && (
         <div className="mt-2 text-center">
           <span className="text-xs text-emerald-600">Submitting feedback...</span>
         </div>
       )}
       
       {userRating && !isSubmitting && (
         <div className="mt-2 text-center">
           <span className="text-xs text-green-600">✓ Rating submitted!</span>
         </div>
       )}
    </div>
  );
};

export default RatingDisplay;
