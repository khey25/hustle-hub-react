import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdArrowBack, MdStar, MdStarBorder } from 'react-icons/md';
import { fetchCommunityReviews } from '../../supabaseClient';
import ReviewDetailModal from '../../components/ReviewDetailModal';
import WriteReviewModal from '../../components/WriteReviewModal';

const PAGE_SIZE = 12;

export default function Reviews({ session, userRole }) {
  const navigate = useNavigate();
  const isGuest = !session;

  const [reviews, setReviews] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const [starFilter, setStarFilter] = useState('all');
  const [gameFilter, setGameFilter] = useState('all');

  const [selectedReviewEntry, setSelectedReviewEntry] = useState(null);
  const [isWriteOpen, setIsWriteOpen] = useState(false);

  const loadInitialReviews = useCallback(async () => {
    setIsLoading(true);
    try {
      const { reviews: fetched, totalCount: count } = await fetchCommunityReviews({
        isGuest,
        starFilter,
        gameFilter,
        offset: 0,
        limit: PAGE_SIZE,
      });
      setReviews(fetched);
      setTotalCount(count);
    } catch (err) {
      console.error('Error loading reviews:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isGuest, starFilter, gameFilter]);

  useEffect(() => {
    loadInitialReviews();
  }, [loadInitialReviews]);

  const handleLoadMore = async () => {
    if (isGuest || isLoadingMore) return;
    setIsLoadingMore(true);
    try {
      const { reviews: nextBatch, totalCount: count } = await fetchCommunityReviews({
        isGuest: false,
        starFilter,
        gameFilter,
        offset: reviews.length,
        limit: PAGE_SIZE,
      });
      setReviews((prev) => [...prev, ...nextBatch]);
      setTotalCount(count);
    } catch (err) {
      console.error('Error loading more reviews:', err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleReviewCreated = (newEntry) => {
    if (!newEntry) return;
    // Reload if filters are active so results remain accurate; otherwise prepend immediately
    if (starFilter !== 'all' || gameFilter !== 'all') {
      loadInitialReviews();
    } else {
      setReviews((prev) => [newEntry, ...prev]);
      setTotalCount((prev) => prev + 1);
    }
  };

  const handleReviewUpdated = (updatedEntry) => {
    if (!updatedEntry) return;
    setSelectedReviewEntry(updatedEntry);
    setReviews((prev) =>
      prev.map((r) => (r.recordId === updatedEntry.recordId ? updatedEntry : r))
    );
  };

  const handleReviewDeleted = (deletedId) => {
    setReviews((prev) => prev.filter((r) => r.recordId !== deletedId));
    setTotalCount((prev) => Math.max(0, prev - 1));
  };

  const formatDate = (isoString) => {
    if (!isoString) return '';
    return new Date(isoString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-[#0b0310] text-white flex flex-col items-center p-5 relative overflow-x-hidden">
      {/* Ambient Hub Glow */}
      <div className="fixed top-0 left-0 w-full h-full -z-10 flex justify-center items-center pointer-events-none">
        <div
          className="w-[50vw] h-[50vw] max-w-[800px] max-h-[800px] rounded-full animate-pulse-glow"
          style={{
            background:
              'radial-gradient(circle, rgba(190, 112, 241, 0.25) 0%, rgba(190, 112, 241, 0) 70%)',
          }}
        />
      </div>

      <div className="w-full max-w-[1300px] pt-4 pb-16 px-2 md:px-6">
        {/* TOP HEADER: Back Arrow (Top-Left) + Title & Controls (Centered Mobile / Right-Aligned Desktop) */}
        <header className="flex flex-col md:flex-row md:justify-between md:items-start gap-5">
          <div className="flex justify-start">
            <button
              type="button"
              onClick={() => navigate('/hub')}
              className="p-2 text-white hover:text-[#be70f1] bg-transparent border-none cursor-pointer transition-colors flex items-center"
              title="Back to Hub"
            >
              <MdArrowBack size={32} />
            </button>
          </div>

          <div className="flex flex-col items-center md:items-end text-center md:text-right gap-4">
            <h1 className="text-[2.2rem] md:text-[2.6rem] font-bold text-[#be70f1] tracking-wider m-0 drop-shadow-[2px_2px_4px_rgba(0,0,0,0.7)]">
              Reviews
            </h1>

            {/* Logged-in Controls ONLY (Star Filter, Game Filter, Write a Review) */}
            {!isGuest && (
              <div className="flex flex-wrap items-center justify-center md:justify-end gap-3">
                <select
                  value={starFilter}
                  onChange={(e) => setStarFilter(e.target.value)}
                  className="px-4 py-2.5 bg-[#1a1a1a] border-2 border-[#333] hover:border-[#be70f1] focus:border-[#be70f1] rounded-lg text-white font-semibold text-sm outline-none cursor-pointer transition-colors"
                >
                  <option value="all">Star Filter: All</option>
                  <option value="5">5 Stars</option>
                  <option value="4">4 Stars</option>
                  <option value="3">3 Stars</option>
                  <option value="2">2 Stars</option>
                  <option value="1">1 Star</option>
                </select>

                <select
                  value={gameFilter}
                  onChange={(e) => setGameFilter(e.target.value)}
                  className="px-4 py-2.5 bg-[#1a1a1a] border-2 border-[#333] hover:border-[#be70f1] focus:border-[#be70f1] rounded-lg text-white font-semibold text-sm outline-none cursor-pointer transition-colors"
                >
                  <option value="all">Game Filter: All</option>
                  <option value="gta">GTA Online</option>
                  <option value="stardew">Stardew Valley</option>
                </select>

                <button
                  type="button"
                  onClick={() => setIsWriteOpen(true)}
                  className="px-5 py-2.5 bg-[#be70f1] hover:bg-[#8a2be2] text-white font-bold text-sm rounded-lg border-none cursor-pointer shadow-md transition-colors"
                >
                  Write a Review
                </button>
              </div>
            )}
          </div>
        </header>

        <hr className="border-0 border-t-2 border-[#333] my-6" />

        {/* REVIEWS GRID */}
        {isLoading ? (
          <p className="text-gray-400 text-center py-12 text-lg">
            Loading community reviews...
          </p>
        ) : reviews.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map((entry) => {
              const review = entry.raw;
              return (
                <div
                  key={entry.recordId}
                  onClick={() => setSelectedReviewEntry(entry)}
                  className="bg-[#1a1a1a] border-2 border-[#333] hover:border-[#be70f1] rounded-xl p-6 cursor-pointer transition-all duration-200 hover:-translate-y-1 shadow-[0_4px_10px_rgba(0,0,0,0.5)] hover:shadow-[0_0_16px_rgba(190,112,241,0.3)] flex flex-col gap-2 text-left"
                >
                  {/* Masked Email */}
                  <p className="text-white font-bold text-[1.05rem] m-0 truncate">
                    {review.reviewer_display || 'Anonymous Hustler'}
                  </p>

                  {/* Date or Edited - Date */}
                  <p className="text-xs text-gray-400 m-0">
                    {review.updated_at ? (
                      <span className="italic text-[#FFEB3B]/85">
                        Edited - {formatDate(review.updated_at)}
                      </span>
                    ) : (
                      <span>{formatDate(review.created_at)}</span>
                    )}
                  </p>

                  {/* Money Making Method */}
                  <p className="text-[#be70f1] font-semibold text-sm mt-1 mb-0 truncate">
                    {entry.item.name}
                  </p>

                  {/* Stars */}
                  <div className="flex items-center gap-0.5 my-1">
                    {[1, 2, 3, 4, 5].map((star) =>
                      star <= (review.rating || 0) ? (
                        <MdStar key={star} size={22} className="text-[#f1b50d]" />
                      ) : (
                        <MdStarBorder key={star} size={22} className="text-[#555]" />
                      )
                    )}
                  </div>

                  {/* Truncated Review Text */}
                  {review.review_text ? (
                    <p className="text-gray-300 text-[0.95rem] leading-relaxed m-0 line-clamp-5 break-words">
                      {review.review_text}
                    </p>
                  ) : (
                    <p className="text-gray-500 italic text-sm m-0">
                      No written comment.
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-400 text-lg mb-4">
              {starFilter !== 'all' || gameFilter !== 'all'
                ? 'No reviews match those filters yet.'
                : 'No community reviews yet. Be the first to share your take!'}
            </p>
            {!isGuest && (starFilter !== 'all' || gameFilter !== 'all') && (
              <button
                type="button"
                onClick={() => {
                  setStarFilter('all');
                  setGameFilter('all');
                }}
                className="px-5 py-2.5 bg-transparent border-2 border-[#be70f1] text-[#be70f1] hover:bg-[#be70f1] hover:text-white font-bold rounded-lg cursor-pointer transition-colors"
              >
                Reset Filters
              </button>
            )}
          </div>
        )}

        {/* GUEST GATE BANNER */}
        {isGuest && !isLoading && (
          <div className="mt-10 p-6 rounded-xl bg-[#1a1a1a]/90 border-2 border-[#be70f1]/60 text-center max-w-xl mx-auto">
            <p className="text-white font-bold text-lg mb-1">
              {totalCount > 5
                ? `Showing 5 of ${totalCount} recent reviews`
                : 'Previewing recent community reviews'}
            </p>
            <p className="text-gray-400 text-sm mb-5">
              Log in to unlock filters, write your own reviews, and browse the full feed.
            </p>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="py-2.5 px-7 font-bold bg-[#be70f1] hover:bg-[#8a2be2] text-white border-none rounded-lg cursor-pointer transition-colors"
            >
              Log In to Unlock
            </button>
          </div>
        )}

        {/* LOGGED-IN LOAD MORE BUTTON */}
        {!isGuest && !isLoading && reviews.length < totalCount && (
          <div className="mt-10 flex flex-col items-center gap-2">
            <button
              type="button"
              disabled={isLoadingMore}
              onClick={handleLoadMore}
              className="py-3 px-8 font-bold text-base bg-transparent border-2 border-[#be70f1] text-[#be70f1] hover:bg-[#be70f1] hover:text-white rounded-lg cursor-pointer transition-colors disabled:opacity-50"
            >
              {isLoadingMore ? 'Loading...' : 'Load More Reviews'}
            </button>
            <span className="text-xs text-gray-500">
              Showing {reviews.length} of {totalCount}
            </span>
          </div>
        )}
      </div>

      {/* EXPANDED REVIEW DETAIL MODAL (Read-Only for Guests, Edit/Delete for Author & Admin) */}
      <ReviewDetailModal
        isOpen={!!selectedReviewEntry}
        entry={selectedReviewEntry}
        onClose={() => setSelectedReviewEntry(null)}
        session={session}
        userRole={userRole}
        onReviewUpdated={handleReviewUpdated}
        onReviewDeleted={handleReviewDeleted}
      />

      {/* WRITE REVIEW WIZARD MODAL (Logged-in Users only) */}
      {!isGuest && (
        <WriteReviewModal
          isOpen={isWriteOpen}
          onClose={() => setIsWriteOpen(false)}
          session={session}
          onReviewCreated={handleReviewCreated}
        />
      )}
    </div>
  );
}