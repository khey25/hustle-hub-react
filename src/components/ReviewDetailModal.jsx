import { useState, useEffect } from 'react';
import { MdStar, MdStarBorder } from 'react-icons/md';
import { updateReview, deleteReview } from '../supabaseClient';

const TABLE_LABELS = {
  gta_businesses: 'GTA Business',
  gta_heists: 'GTA Heist',
  gta_contact: 'GTA Contact',
  stardew_crops: 'Stardew Crop',
  stardew_artisan_goods: 'Artisan Good',
  stardew_animal_products: 'Animal Product',
};

export default function ReviewDetailModal({
  isOpen,
  entry,
  onClose,
  session,
  userRole,
  onReviewUpdated = null,
  onReviewDeleted = null,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editRating, setEditRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [editText, setEditText] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const review = entry?.raw;
  const item = entry?.item;

  useEffect(() => {
    if (!isOpen || !review) {
      setIsEditing(false);
      setHoverRating(0);
      return;
    }
    setEditRating(review.rating || 5);
    setEditText(review.review_text || '');
  }, [isOpen, review]);

  if (!isOpen || !entry || !review || !item) return null;

  const userId = session?.user?.id;
  const isAuthor = !!userId && userId === review.user_id;
  const isAdmin = userRole === 'admin';
  const canDelete = isAuthor || isAdmin;

  const formatDate = (isoString) => {
    if (!isoString) return '';
    return new Date(isoString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleSave = async () => {
    if (editRating < 1 || editRating > 5) {
      return alert('Please select a star rating from 1 to 5.');
    }

    setIsSaving(true);
    try {
      const updatedEntry = await updateReview(review.id, editRating, editText);
      setIsEditing(false);
      if (onReviewUpdated) onReviewUpdated(updatedEntry);
    } catch (error) {
      alert(`Failed to update review: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete this review for ${item.name}?`)) return;

    setIsDeleting(true);
    try {
      await deleteReview(review.id);
      if (onReviewDeleted) onReviewDeleted(review.id);
      onClose();
    } catch (error) {
      alert(`Failed to delete review: ${error.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const activeStars = hoverRating || editRating;

  return (
    <div
      className="fixed top-0 left-0 w-full h-full bg-black/70 backdrop-blur-md flex justify-center items-center z-[1000] p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isEditing) onClose();
      }}
    >
      <div className="bg-[#1a1a1a] rounded-xl border-2 border-[#777] overflow-hidden relative text-center w-[95%] max-w-[1000px] animate-[modal-pop_0.35s_cubic-bezier(0.175,0.885,0.32,1.275)_forwards]">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-5 text-white text-2xl cursor-pointer z-20 hover:text-gray-300 bg-black/50 w-10 h-10 rounded-full flex items-center justify-center border-none"
          title="Close"
        >
          X
        </button>

        <div className="flex flex-col md:flex-row h-[82vh] md:h-[600px]">
          {/* Left Pane: Money-Making Method Image */}
          <div className="flex-1 md:flex-[1.15] bg-[#222] border-b-2 md:border-b-0 md:border-r-2 border-[#333] min-h-[200px] relative">
            <img
              src={item.image_url}
              alt={item.name}
              className="absolute top-0 left-0 w-full h-full object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-5 text-left">
              <span className="inline-block px-2.5 py-0.5 mb-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-[#be70f1]/25 border border-[#be70f1] text-[#be70f1]">
                {TABLE_LABELS[entry.tableName] || entry.tableName}
              </span>
              <h3 className="text-white text-[1.6rem] md:text-[1.9rem] font-bold m-0 drop-shadow-[2px_2px_4px_#000]">
                {item.name}
              </h3>
            </div>
          </div>

          {/* Right Pane: Review Details + Edit/Delete Controls */}
          <div className="flex-1 bg-black text-[#ddd] p-6 md:p-9 text-left overflow-y-auto flex flex-col">
            <div className="mb-4 pb-4 border-b border-[#2a2a2a]">
              <p className="text-white font-bold text-[1.15rem] m-0 break-all">
                {review.reviewer_display || 'Anonymous Hustler'}
              </p>
              <p className="text-sm text-gray-400 mt-1 mb-0">
                {review.updated_at ? (
                  <span className="italic text-[#FFEB3B]/90">
                    Edited - {formatDate(review.updated_at)}
                  </span>
                ) : (
                  <span>{formatDate(review.created_at)}</span>
                )}
              </p>
            </div>

            {!isEditing ? (
              <div className="flex-grow flex flex-col gap-4">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) =>
                    star <= (review.rating || 0) ? (
                      <MdStar key={star} size={28} className="text-[#f1b50d]" />
                    ) : (
                      <MdStarBorder key={star} size={28} className="text-[#555]" />
                    )
                  )}
                </div>

                {review.review_text ? (
                  <p className="text-gray-200 text-[1.05rem] leading-relaxed whitespace-pre-wrap break-words m-0">
                    {review.review_text}
                  </p>
                ) : (
                  <p className="text-gray-500 italic text-[1rem] m-0">
                    No written comment provided.
                  </p>
                )}
              </div>
            ) : (
              <div className="flex-grow flex flex-col gap-4">
                <div>
                  <label className="block text-sm font-bold text-[#be70f1] mb-2">
                    Update Rating
                  </label>
                  <div
                    className="flex items-center gap-1"
                    onMouseLeave={() => setHoverRating(0)}
                  >
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onMouseEnter={() => setHoverRating(star)}
                        onClick={() => setEditRating(star)}
                        className="p-0.5 bg-transparent border-none cursor-pointer transition-transform hover:scale-110"
                      >
                        {star <= activeStars ? (
                          <MdStar size={32} className="text-[#f1b50d]" />
                        ) : (
                          <MdStarBorder size={32} className="text-[#555]" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex-grow flex flex-col">
                  <label className="block text-sm font-bold text-[#be70f1] mb-2">
                    Update Review (Optional)
                  </label>
                  <textarea
                    rows={6}
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    placeholder="Share your experience with this method (or leave blank)..."
                    className="w-full flex-grow bg-[#1a1a1a] border-2 border-[#444] focus:border-[#be70f1] rounded-xl p-3 text-white text-[1rem] outline-none resize-none"
                  />
                </div>
              </div>
            )}

            {/* Author & Admin Actions */}
            {(isAuthor || canDelete) && (
              <div className="mt-6 pt-4 border-t border-[#333] flex justify-between gap-3">
                {isEditing ? (
                  <>
                    <button
                      type="button"
                      disabled={isSaving}
                      onClick={() => {
                        setIsEditing(false);
                        setEditRating(review.rating || 5);
                        setEditText(review.review_text || '');
                      }}
                      className="flex-1 py-2.5 bg-transparent border-2 border-[#555] text-gray-300 font-bold rounded-lg hover:bg-[#333] cursor-pointer disabled:opacity-50"
                    >
                      CANCEL
                    </button>
                    <button
                      type="button"
                      disabled={isSaving}
                      onClick={handleSave}
                      className="flex-1 py-2.5 bg-[#4CAF50] text-white font-bold rounded-lg shadow-[0_0_10px_rgba(76,175,80,0.45)] hover:bg-[#388E3C] border-none cursor-pointer disabled:opacity-50"
                    >
                      {isSaving ? 'SAVING...' : 'SAVE CHANGES'}
                    </button>
                  </>
                ) : (
                  <>
                    {isAuthor && (
                      <button
                        type="button"
                        onClick={() => setIsEditing(true)}
                        className="flex-1 py-2.5 bg-transparent border-2 border-[#FFEB3B] text-[#FFEB3B] font-bold rounded-lg hover:bg-[#FFEB3B] hover:text-black transition-colors cursor-pointer"
                      >
                        EDIT
                      </button>
                    )}
                    {canDelete && (
                      <button
                        type="button"
                        disabled={isDeleting}
                        onClick={handleDelete}
                        className="flex-1 py-2.5 bg-transparent border-2 border-[#F44336] text-[#F44336] font-bold rounded-lg hover:bg-[#F44336] hover:text-white transition-colors cursor-pointer disabled:opacity-50"
                      >
                        {isDeleting
                          ? 'DELETING...'
                          : !isAuthor && isAdmin
                          ? 'DELETE (ADMIN)'
                          : 'DELETE'}
                      </button>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}