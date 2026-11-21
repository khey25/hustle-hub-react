import { useState, useEffect } from 'react';
import { MdArrowBack, MdStar, MdStarBorder } from 'react-icons/md';
import { fetchFlatData, createReview } from '../supabaseClient';

const GAME_OPTIONS = [
  {
    id: 'gta',
    label: 'GTA Online',
    img: 'https://github.com/khey25/legaspi_prelimfastapi/blob/main/menuimages/gtaonline.jpg?raw=true',
    categories: [
      { table: 'gta_businesses', label: 'Businesses' },
      { table: 'gta_heists', label: 'Heists' },
      { table: 'gta_contact', label: 'Contact Missions' },
    ],
  },
  {
    id: 'stardew',
    label: 'Stardew Valley',
    img: 'https://github.com/khey25/legaspi_prelimfastapi/blob/main/menuimages/stardew.jpg?raw=true',
    categories: [
      { table: 'stardew_crops', label: 'Crops' },
      { table: 'stardew_artisan_goods', label: 'Artisan Goods' },
      { table: 'stardew_animal_products', label: 'Animal Products' },
    ],
  },
];

export default function WriteReviewModal({ isOpen, onClose, session, onReviewCreated }) {
  const [step, setStep] = useState('game'); // 'game' | 'category' | 'method' | 'compose'
  const [selectedGame, setSelectedGame] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [methods, setMethods] = useState([]);
  const [isLoadingMethods, setIsLoadingMethods] = useState(false);
  const [methodSearch, setMethodSearch] = useState('');
  const [selectedMethod, setSelectedMethod] = useState(null);

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Reset wizard whenever modal is reopened
  useEffect(() => {
    if (!isOpen) return;
    setStep('game');
    setSelectedGame(null);
    setSelectedCategory(null);
    setMethods([]);
    setMethodSearch('');
    setSelectedMethod(null);
    setRating(0);
    setHoverRating(0);
    setReviewText('');
    setErrorMsg('');
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelectGame = (game) => {
    setSelectedGame(game);
    setStep('category');
  };

  const handleSelectCategory = async (category) => {
    setSelectedCategory(category);
    setMethodSearch('');
    setStep('method');
    setIsLoadingMethods(true);
    setErrorMsg('');
    try {
      const rows = await fetchFlatData(category.table);
      const sorted = [...rows].sort((a, b) => a.name.localeCompare(b.name));
      setMethods(sorted);
    } catch (err) {
      setErrorMsg(`Failed to load methods: ${err.message}`);
      setMethods([]);
    } finally {
      setIsLoadingMethods(false);
    }
  };

  const handleSelectMethod = (method) => {
    setSelectedMethod(method);
    setErrorMsg('');
    setStep('compose');
  };

  const handleBack = () => {
    setErrorMsg('');
    if (step === 'compose') setStep('method');
    else if (step === 'method') setStep('category');
    else if (step === 'category') setStep('game');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const userId = session?.user?.id;
    if (!userId) {
      setErrorMsg('You must be logged in to post a review.');
      return;
    }
    if (rating < 1 || rating > 5) {
      setErrorMsg('Please pick a star rating from 1 to 5 before submitting.');
      return;
    }

    setIsSubmitting(true);
    try {
      const createdEntry = await createReview(
        userId,
        selectedCategory.table,
        selectedMethod.name,
        rating,
        reviewText
      );
      if (onReviewCreated) onReviewCreated(createdEntry);
      onClose();
    } catch (err) {
      setErrorMsg(`Could not post review: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredMethods = methods.filter((m) =>
    m.name.toLowerCase().includes(methodSearch.trim().toLowerCase())
  );

  const activeStars = hoverRating || rating;

  return (
    /* Backdrop intentionally ignores outside clicks to prevent accidental progress loss */
    <div className="fixed top-0 left-0 w-full h-full bg-black/75 backdrop-blur-md flex justify-center items-center z-[1050] p-4">
      <div className="bg-[#1a1a1a] border-2 border-[#be70f1] rounded-2xl w-full max-w-[760px] max-h-[88vh] flex flex-col overflow-hidden relative shadow-[0_0_25px_rgba(190,112,241,0.35)] animate-[modal-pop_0.3s_cubic-bezier(0.175,0.885,0.32,1.275)_forwards]">
        {/* Top Bar: Back Button + Close Button */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2e2e2e] bg-[#141414]">
          <div className="w-24 flex justify-start">
            {step !== 'game' && (
              <button
                type="button"
                onClick={handleBack}
                className="flex items-center gap-1 text-gray-300 hover:text-[#be70f1] bg-transparent border-none cursor-pointer font-bold text-base p-0 transition-colors"
              >
                <MdArrowBack size={22} />
                <span>Back</span>
              </button>
            )}
          </div>

          <h2 className="text-[1.25rem] md:text-[1.5rem] font-bold text-[#be70f1] tracking-wider m-0 text-center">
            WRITE A REVIEW
          </h2>

          <div className="w-24 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="text-gray-300 hover:text-white bg-black/40 w-9 h-9 rounded-full flex items-center justify-center border-none cursor-pointer text-lg font-bold"
              title="Close"
            >
              X
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 md:p-8 overflow-y-auto flex-grow text-center">
          {errorMsg && (
            <div className="mb-5 p-3 rounded-lg bg-red-900/40 border border-[#F44336] text-[#F44336] font-semibold text-sm">
              {errorMsg}
            </div>
          )}

          {/* STEP 1: SELECT GAME */}
          {step === 'game' && (
            <div>
              <h3 className="text-[1.5rem] font-bold text-white mb-6">
                Which game is this method from?
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {GAME_OPTIONS.map((game) => (
                  <button
                    key={game.id}
                    type="button"
                    onClick={() => handleSelectGame(game)}
                    className="relative h-[180px] bg-[#222] border-2 border-[#be70f1] rounded-xl flex items-center justify-center overflow-hidden cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:border-[#f1b50d] hover:shadow-[0_0_15px_rgba(255,235,59,0.5)] group p-0"
                  >
                    <img
                      src={game.img}
                      alt={game.label}
                      className="absolute top-0 left-0 w-full h-full object-cover opacity-50 group-hover:opacity-80 transition-opacity duration-300 z-0"
                    />
                    <span className="relative z-10 text-[1.5rem] font-bold text-white drop-shadow-[2px_2px_6px_#000]">
                      {game.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: SELECT CATEGORY */}
          {step === 'category' && selectedGame && (
            <div>
              <h3 className="text-[1.5rem] font-bold text-white mb-2">
                Choose a {selectedGame.label} category
              </h3>
              <p className="text-gray-400 text-sm mb-6">
                Money-making methods only
              </p>
              <div className="flex flex-col gap-4 max-w-md mx-auto">
                {selectedGame.categories.map((cat) => (
                  <button
                    key={cat.table}
                    type="button"
                    onClick={() => handleSelectCategory(cat)}
                    className="py-4 px-5 text-[1.2rem] font-bold bg-[#222] text-[#be70f1] border-2 border-[#333] rounded-xl cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:border-[#f1b50d] hover:text-[#f1b50d] hover:shadow-[0_0_12px_rgba(255,235,59,0.4)]"
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: SELECT METHOD */}
          {step === 'method' && selectedCategory && (
            <div>
              <h3 className="text-[1.4rem] font-bold text-white mb-4">
                Select a {selectedCategory.label} method
              </h3>

              <input
                type="text"
                value={methodSearch}
                onChange={(e) => setMethodSearch(e.target.value)}
                placeholder={`Filter ${selectedCategory.label.toLowerCase()}...`}
                className="w-full max-w-md mb-5 px-4 py-2.5 bg-[#111] border-2 border-[#333] focus:border-[#be70f1] rounded-lg text-white outline-none"
              />

              {isLoadingMethods ? (
                <p className="text-gray-400 py-8">Loading methods...</p>
              ) : filteredMethods.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {filteredMethods.map((method) => (
                    <button
                      key={method.name}
                      type="button"
                      onClick={() => handleSelectMethod(method)}
                      className="relative h-[120px] bg-[#222] border-2 border-[#be70f1]/70 hover:border-[#f1b50d] rounded-xl flex items-center justify-center overflow-hidden cursor-pointer transition-all duration-200 hover:-translate-y-0.5 group p-2"
                    >
                      <img
                        src={method.image_url}
                        alt={method.name}
                        className="absolute top-0 left-0 w-full h-full object-cover opacity-45 group-hover:opacity-75 transition-opacity z-0"
                      />
                      <span className="relative z-10 text-white font-bold text-[1.05rem] drop-shadow-[2px_2px_4px_#000] group-hover:text-[#f1b50d]">
                        {method.name}
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 py-6">No matching methods found.</p>
              )}
            </div>
          )}

          {/* STEP 4: COMPOSE REVIEW */}
          {step === 'compose' && selectedMethod && (
            <form onSubmit={handleSubmit} className="text-left max-w-xl mx-auto space-y-6">
              {/* Selected Method Preview Banner right above the Stars */}
              <div className="flex items-center gap-4 p-3 rounded-xl bg-[#111] border border-[#333]">
                <img
                  src={selectedMethod.image_url}
                  alt={selectedMethod.name}
                  className="w-20 h-16 object-cover rounded-lg border border-[#444] shrink-0"
                />
                <div className="min-w-0">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#be70f1] block">
                    {selectedGame.label} • {selectedCategory.label}
                  </span>
                  <h4 className="text-white text-[1.25rem] font-bold m-0 truncate">
                    {selectedMethod.name}
                  </h4>
                </div>
              </div>

              {/* Clickable Stars */}
              <div className="text-center">
                <label className="block text-sm font-bold text-gray-300 mb-2">
                  Your Rating
                </label>
                <div
                  className="inline-flex items-center justify-center gap-2"
                  onMouseLeave={() => setHoverRating(0)}
                >
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onClick={() => setRating(star)}
                      className="p-1 bg-transparent border-none cursor-pointer transition-transform hover:scale-125"
                      title={`${star} ${star === 1 ? 'Star' : 'Stars'}`}
                    >
                      {star <= activeStars ? (
                        <MdStar
                          size={40}
                          className="text-[#f1b50d] drop-shadow-[0_0_8px_rgba(241,181,13,0.7)]"
                        />
                      ) : (
                        <MdStarBorder size={40} className="text-[#555]" />
                      )}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-1 mb-0">
                  {activeStars > 0 ? `${activeStars} / 5 Stars` : 'Tap a star to rate'}
                </p>
              </div>

              {/* Single Optional Message Input */}
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">
                  Review Message <span className="text-gray-500 font-normal">(Optional)</span>
                </label>
                <textarea
                  rows={5}
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder=""
                  className="w-full bg-[#111] border-2 border-[#333] focus:border-[#be70f1] rounded-xl p-3.5 text-white text-[1rem] outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 text-[1.15rem] font-bold tracking-wider bg-[#be70f1] hover:bg-[#8a2be2] text-white rounded-xl border-none cursor-pointer transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'POSTING REVIEW...' : 'POST REVIEW'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}