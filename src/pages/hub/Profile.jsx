import { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { MdArrowBack } from 'react-icons/md';
import { supabase, fetchUserProfileContent, toggleBookmark } from '../../supabaseClient';
import ActionCard from '../../components/ActionCard';
import DetailModal from '../../components/DetailModal';
import ReviewDetailModal from '../../components/ReviewDetailModal';


const TABLE_LABELS = {
  gta_businesses: 'GTA Business',
  gta_heists: 'GTA Heist',
  gta_contact: 'GTA Contact',
  gta_goals: 'GTA Goal',
  stardew_crops: 'Stardew Crop',
  stardew_artisan_goods: 'Artisan Good',
  stardew_animal_products: 'Animal Product',
  stardew_goals: 'Stardew Goal',
};

export default function Profile({ session, userRole }) {
  const navigate = useNavigate();

  const [ownedItems, setOwnedItems] = useState([]);
  const [bookmarkedItems, setBookmarkedItems] = useState([]);
  const [userReviews, setUserReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedEntry, setSelectedEntry] = useState(null);
  const [selectedReviewEntry, setSelectedReviewEntry] = useState(null);
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');

  const userId = session?.user?.id;

  useEffect(() => {
    if (!userId) return;

    setIsLoading(true);
    fetchUserProfileContent(userId)
      .then(({ owned, bookmarked, reviews }) => {
        setOwnedItems(owned);
        setBookmarkedItems(bookmarked);
        setUserReviews(reviews);
      })
      .catch(err => console.error('Error loading profile:', err))
      .finally(() => setIsLoading(false));
  }, [userId]);

  // Guest Protection: redirect straight to Login if not logged in
  // (allow staying briefly while the password reset confirmation modal is open)
  if (!session && !resetModalOpen) {
    return <Navigate to="/" replace />;
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const handleChangePassword = async () => {
    const email = session?.user?.email;
    if (!email || isSendingReset) return;

    setIsSendingReset(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/?recovery=true`,
      });
      if (error) throw error;

      // Keep confirmation visible while immediately logging the user out
      setResetEmail(email);
      setResetModalOpen(true);
      await supabase.auth.signOut();
    } catch (err) {
      alert(`Failed to send reset link: ${err.message}`);
    } finally {
      setIsSendingReset(false);
    }
  };

  const isEntryBookmarked = (entry) =>
    bookmarkedItems.some(
      (b) => b.tableName === entry.tableName && b.item.name === entry.item.name
    );

  const handleProfileBookmarkToggle = async (entry) => {
    if (!userId) return;
    try {
      const nowBookmarked = await toggleBookmark(userId, entry.tableName, entry.item.name);
      if (nowBookmarked) {
        setBookmarkedItems((prev) => [
          ...prev,
          {
            recordId: `${entry.tableName}-${entry.item.name}`,
            tableName: entry.tableName,
            item: entry.item,
            raw: entry.raw,
          },
        ]);
      } else {
        setBookmarkedItems((prev) =>
          prev.filter(
            (b) => !(b.tableName === entry.tableName && b.item.name === entry.item.name)
          )
        );
      }
    } catch (err) {
      console.error('Failed to toggle bookmark:', err);
    }
  };

const formatDate = (isoString) => {
    if (!isoString) return '';
    return new Date(isoString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleProfileReviewUpdated = (updatedEntry) => {
    if (!updatedEntry) return;
    setSelectedReviewEntry(updatedEntry);
    setUserReviews((prev) =>
      prev.map((r) => (r.recordId === updatedEntry.recordId ? updatedEntry : r))
    );
  };

  const handleProfileReviewDeleted = (deletedId) => {
    setUserReviews((prev) => prev.filter((r) => r.recordId !== deletedId));
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
        {/* TOP HEADER: Back Arrow (Top-Left) + Account Info (Centered Mobile / Right-Aligned Desktop) */}
        <header className="flex flex-col md:flex-row md:justify-between md:items-start gap-6">
          <div className="flex justify-start">
            <button
              onClick={() => navigate('/hub')}
              className="p-2 text-white hover:text-[#be70f1] bg-transparent border-none cursor-pointer transition-colors flex items-center gap-2"
              title="Back to Hub"
            >
              <MdArrowBack size={32} />
            </button>
          </div>

          <div className="flex flex-col items-center md:items-end text-center md:text-right space-y-2">
            <h1 className="text-[1.4rem] sm:text-[1.8rem] md:text-[2.1rem] font-bold text-white break-all m-0">
              {session?.user?.email || resetEmail}
            </h1>

            {/* Role Badge + Mini Stats */}
            <div className="flex flex-wrap items-center justify-center md:justify-end gap-3 pt-1">
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  userRole === 'admin'
                    ? 'bg-[#4CAF50]/20 border border-[#4CAF50] text-[#4CAF50]'
                    : 'bg-[#be70f1]/20 border border-[#be70f1] text-[#be70f1]'
                }`}
              >
                {userRole === 'admin' ? 'Admin' : 'Hustler'}
              </span>
              <span className="text-sm text-gray-400">
                {ownedItems.length} Owned • {bookmarkedItems.length} Bookmarked • {userReviews.length} Reviews
              </span>
            </div>

            {/* Stacked Actions matching wireframe */}
            <div className="flex flex-col items-center md:items-end gap-1 pt-2">
              <button
                onClick={handleChangePassword}
                disabled={isSendingReset}
                className="text-[1rem] text-[#be70f1] hover:text-white bg-transparent border-none cursor-pointer transition-colors p-0 disabled:opacity-50"
              >
                {isSendingReset ? 'Sending reset link...' : 'Change password'}
              </button>
              <button
                onClick={handleLogout}
                className="text-[1rem] text-gray-400 hover:text-[#F44336] bg-transparent border-none cursor-pointer transition-colors p-0"
              >
                Log out
              </button>
            </div>
          </div>
        </header>

        {/* SECTION 1: OWNED */}
        <hr className="border-0 border-t-2 border-[#333] my-8" />
        <section className="mb-10">
          <h2 className="text-[1.8rem] md:text-[2rem] font-bold text-[#be70f1] mb-6 text-center md:text-right">
            Owned
          </h2>

          {isLoading ? (
            <p className="text-gray-400 text-center md:text-right">Loading owned methods...</p>
          ) : ownedItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {ownedItems.map((entry) => (
                <ActionCard
                    key={entry.recordId}
                    item={entry.item}
                    onClick={() => setSelectedEntry(entry)}
                    isBookmarked={isEntryBookmarked(entry)}
                    onToggleBookmark={() => handleProfileBookmarkToggle(entry)}
                />
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-center md:text-right">
              Keep hustling partner!
            </p>
          )}
        </section>

        {/* SECTION 2: BOOKMARKED */}
        <hr className="border-0 border-t-2 border-[#333] my-8" />
        <section className="mb-10">
          <h2 className="text-[1.8rem] md:text-[2rem] font-bold text-[#be70f1] mb-6 text-center md:text-right">
            Bookmarked
          </h2>

          {isLoading ? (
            <p className="text-gray-400 text-center md:text-right">Loading bookmarks...</p>
          ) : bookmarkedItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {bookmarkedItems.map((entry) => (
                <ActionCard
                    key={entry.recordId}
                    item={entry.item}
                    onClick={() => setSelectedEntry(entry)}
                    isBookmarked={isEntryBookmarked(entry)}
                    onToggleBookmark={() => handleProfileBookmarkToggle(entry)}
                />
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-center md:text-right">
              No goal yet? Come on, Game up bro!
            </p>
          )}
        </section>

        {/* SECTION 3: MY REVIEWS */}
        <hr className="border-0 border-t-2 border-[#333] my-8" />
        <section>
          <h2 className="text-[1.8rem] md:text-[2rem] font-bold text-[#be70f1] mb-6 text-center md:text-right">
            My Reviews
          </h2>

          {isLoading ? (
            <p className="text-gray-400 text-center md:text-right">Loading your reviews...</p>
          ) : userReviews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {userReviews.map((entry) => {
                const review = entry.raw;
                return (
                  <div
                    key={entry.recordId}
                    onClick={() => setSelectedReviewEntry(entry)}
                    className="min-w-0 overflow-hidden bg-[#1a1a1a] border-2 border-[#333] hover:border-[#be70f1] rounded-xl p-5 cursor-pointer transition-colors text-center md:text-right flex flex-col gap-2"
                  >
                    <div className="flex flex-col md:flex-row-reverse md:justify-between md:items-center gap-1">
                      <h3 className="text-[1.25rem] font-bold text-white m-0">
                        {entry.item.name}
                      </h3>
                      <span className="text-xs font-semibold uppercase tracking-wider text-[#be70f1]">
                        {TABLE_LABELS[entry.tableName] || entry.tableName}
                      </span>
                    </div>

                    <div className="text-[#FFEB3B] text-lg tracking-widest">
                      {'★'.repeat(review.rating || 0)}
                      <span className="text-[#444]">
                        {'★'.repeat(5 - (review.rating || 0))}
                      </span>
                    </div>

                    <p className="text-gray-300 text-[0.95rem] m-0 break-words [overflow-wrap:anywhere] line-clamp-4">
                      {review.review_text || 'No written comment.'}
                    </p>

                    <div className="text-xs text-gray-500 pt-2 border-t border-[#2a2a2a]">
                      <span>Posted {formatDate(review.created_at)}</span>
                      {review.updated_at && (
                        <span className="ml-2 text-[#FFEB3B]/80">
                          • Edited on {formatDate(review.updated_at)}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-400 text-center md:text-right">
              New to town?
            </p>
          )}
        </section>
      </div>

      {/* IN-PLACE DETAIL MODAL */}
      <DetailModal
        isOpen={!!selectedEntry}
        data={selectedEntry?.item}
        tableName={selectedEntry?.tableName}
        onClose={() => setSelectedEntry(null)}
        session={session}
        userRole={userRole}
      />

      {/* IN-PLACE REVIEW DETAIL MODAL (My Reviews only) */}
      <ReviewDetailModal
        isOpen={!!selectedReviewEntry}
        entry={selectedReviewEntry}
        onClose={() => setSelectedReviewEntry(null)}
        session={session}
        userRole={userRole}
        onReviewUpdated={handleProfileReviewUpdated}
        onReviewDeleted={handleProfileReviewDeleted}
      />

      {/* PASSWORD RESET CONFIRMATION MODAL */}
      {resetModalOpen && (
        <div className="fixed top-0 left-0 w-full h-full bg-black/75 backdrop-blur-md flex justify-center items-center z-[1100] p-4">
          <div className="bg-[#1a1a1a] border-2 border-[#be70f1] rounded-xl p-8 max-w-md w-full text-center shadow-[0_0_25px_rgba(190,112,241,0.35)]">
            <h2 className="text-[1.6rem] font-bold text-[#be70f1] mb-3">
              Reset Link Sent
            </h2>
            <p className="text-gray-300 text-[1rem] mb-6">
              A reset password link has been sent to <strong className="text-white">{resetEmail}</strong>. For security, you have been logged out.
            </p>
            <button
              onClick={() => navigate('/')}
              className="py-3 px-8 text-[1.1rem] font-bold bg-[#be70f1] text-white border-none rounded-lg hover:bg-[#8a2be2] transition-colors cursor-pointer"
            >
              Go to Log In
            </button>
          </div>
        </div>
      )}
    </div>
  );
}