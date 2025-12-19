'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

interface Review {
  _id: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

interface ReviewSectionProps {
  productId: string;
}

export default function ReviewSection({ productId }: ReviewSectionProps) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState({ averageRating: 0, totalReviews: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const fetchReviews = async () => {
    try {
      const response = await fetch(`/api/reviews?productId=${productId}`);
      const data = await response.json();
      
      if (response.ok) {
        setReviews(data.reviews);
        // If no reviews, show default initial rating 5 with 1 review as requested
        if (!data.stats || (data.stats.totalReviews || 0) === 0) {
          setStats({ averageRating: 5, totalReviews: 1 });
        } else {
          setStats(data.stats);
        }
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError('Vui lòng đăng nhập để đánh giá');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          userId: user._id,
          userName: user.name,
          rating,
          comment,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit review');
      }

      setSuccess('Đánh giá của bạn đã được gửi!');
      setComment('');
      setRating(5);
      // Optimistic update: append the new review locally to improve UX
      const newReview: Review = {
        _id: data.review?._id || String(Date.now()),
        userName: data.review?.userName || user.name,
        rating,
        comment,
        createdAt: data.review?.createdAt || new Date().toISOString(),
      };

      setReviews(prev => [newReview, ...prev]);
      // Update stats locally to show immediate feedback
      setStats(prev => ({
        averageRating: ((prev.averageRating * prev.totalReviews) + rating) / (prev.totalReviews + 1),
        totalReviews: prev.totalReviews + 1,
      }));

      // Try to refresh from server in background to ensure consistency
      fetchReviews();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Rating summary */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <div className="flex items-center space-x-4">
          <div className="text-5xl font-bold">{stats.averageRating.toFixed(1)}</div>
          <div>
            <div className="flex text-yellow-400 text-2xl">
              {[1, 2, 3, 4, 5].map((star) => (
                <span key={star}>{star <= Math.round(stats.averageRating) ? '⭐' : '☆'}</span>
              ))}
            </div>
            <div className="text-gray-600">{stats.totalReviews} đánh giá</div>
          </div>
        </div>
      </div>

      {/* Review form */}
      {user ? (
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Viết đánh giá</h3>
          
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}
          
          {success && (
            <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Đánh giá của bạn</label>
              <div className="flex space-x-2 text-3xl">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className={`${star <= rating ? 'text-yellow-400' : 'text-gray-300'} hover:text-yellow-400`}
                  >
                    ⭐
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Nhận xét</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                required
                maxLength={1000}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm..."
              />
              <div className="text-sm text-gray-500 mt-1">{comment.length}/1000</div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-blue-400"
            >
              {isSubmitting ? 'Đang gửi...' : 'Gửi đánh giá'}
            </button>
          </form>
        </div>
      ) : (
        <div className="bg-gray-50 p-6 rounded-lg text-center">
          <p className="text-gray-600">
            Vui lòng{' '}
            <a href="/dang-nhap" className="text-blue-600 hover:underline">
              đăng nhập
            </a>{' '}
            để viết đánh giá
          </p>
        </div>
      )}

      {/* Reviews list */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Tất cả đánh giá</h3>
        
        {isLoading ? (
          <div className="text-center py-8 text-gray-500">Đang tải...</div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-8 text-gray-500">Chưa có đánh giá nào</div>
        ) : (
          reviews.map((review) => (
            <div key={review._id} className="bg-white border rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="font-semibold">{review.userName}</div>
                <div className="text-sm text-gray-500">
                  {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                </div>
              </div>
              <div className="flex text-yellow-400 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span key={star}>{star <= review.rating ? '⭐' : '☆'}</span>
                ))}
              </div>
              <p className="text-black">{review.comment}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
