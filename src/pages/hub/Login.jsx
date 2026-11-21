import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';

export default function Login() {
  const [view, setView] = useState('login'); // 'login' | 'signup' | 'forgot' | 'reset'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [notification, setNotification] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  // Detect when the user arrives via a Supabase password reset email link
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('recovery') === 'true' || window.location.hash.includes('type=recovery')) {
      setView('reset');
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setView('reset');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleViewChange = (newView) => {
    if (view === 'reset') {
      window.history.replaceState({}, '', '/');
    }
    setView(newView);
    setNotification(null);
    setPassword('');
    setRepeatPassword('');
  };

  // Helper function to enforce strong passwords
  const validatePassword = (pass) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(pass);
    const hasNumbers = /\d/.test(pass);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(pass);

    if (pass.length < minLength) return "Password must be at least 8 characters long.";
    if (!hasUpperCase) return "Password must contain at least one uppercase letter.";
    if (!hasNumbers) return "Password must contain at least one number.";
    if (!hasSpecialChar) return "Password must contain at least one special character.";
    return null;
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setNotification(null);

    if (view === 'signup' || view === 'reset') {
      if (password !== repeatPassword) {
        setNotification({ type: 'error', text: 'Passwords do not match.' });
        return;
      }

      const passwordError = validatePassword(password);
      if (passwordError) {
        setNotification({ type: 'error', text: passwordError });
        return;
      }
    }

    setIsLoading(true);

    try {
      if (view === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;

        setNotification({
          type: 'success',
          text: `Success! We sent a setup link to ${email}. Please check your inbox or spam folder to verify your account.`
        });
      } else if (view === 'forgot') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/?recovery=true`,
        });
        if (error) throw error;

        setNotification({
          type: 'success',
          text: `A reset password link has been sent to ${email}. Please check your inbox or spam folder.`
        });
      } else if (view === 'reset') {
        const { error } = await supabase.auth.updateUser({ password });
        if (error) throw error;

        await supabase.auth.signOut();
        window.history.replaceState({}, '', '/');
        setView('login');
        setPassword('');
        setRepeatPassword('');
        setNotification({
          type: 'success',
          text: 'Password updated successfully! Please log in with your new password.'
        });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;

        navigate('/hub');
      }
    } catch (error) {
      console.error(error);
      setNotification({ type: 'error', text: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const headers = {
    login: { title: 'WELCOME BACK', subtitle: 'Log in to your empire' },
    signup: { title: 'FIRST TIME?', subtitle: 'Create your account' },
    forgot: { title: 'RESET PASSWORD', subtitle: 'Enter your email to receive a reset link' },
    reset: { title: 'NEW PASSWORD', subtitle: 'Set a strong new password for your account' },
  };

  const buttonLabels = {
    login: 'LOG IN',
    signup: 'CREATE ACCOUNT',
    forgot: 'SEND RESET LINK',
    reset: 'UPDATE PASSWORD',
  };

  return (
    <div className="flex min-h-screen bg-[#0b0310] text-white font-sans overflow-hidden">

      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 md:px-24 lg:px-32 relative z-10 bg-[#1a1a1a]/90 backdrop-blur-md border-r-2 border-[#be70f1] shadow-[5px_0_20px_rgba(190,112,241,0.2)]">
        <div className="w-full max-w-md mx-auto lg:mx-0">

          {view !== 'login' && (
            <button
              type="button"
              onClick={() => handleViewChange('login')}
              className="mb-6 py-2 px-4 border-2 border-[#555] text-[#aaa] hover:text-white hover:border-[#be70f1] rounded-lg transition-colors w-fit flex items-center justify-center font-bold bg-transparent cursor-pointer"
            >
              &#8592; Back
            </button>
          )}

          <div className="mb-8 text-left">
            <h1 className="text-[2.5rem] font-bold text-[#be70f1] drop-shadow-[2px_2px_4px_#000] mb-1 tracking-wider">
              {headers[view].title}
            </h1>
            <h2 className="text-[1.2rem] text-gray-300">
              {headers[view].subtitle}
            </h2>
          </div>

          {notification && (
            <div className={`mb-6 p-4 text-[1.1rem] rounded-xl border-2 font-bold ${
              notification.type === 'success'
                ? 'bg-green-900/40 text-[#4CAF50] border-[#4CAF50] shadow-[0_0_15px_rgba(76,175,80,0.4)]'
                : 'bg-red-900/40 text-[#F44336] border-[#F44336] shadow-[0_0_15px_rgba(244,67,54,0.4)]'
            }`}>
              {notification.text}
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-5">
            {view !== 'reset' && (
              <div>
                <label className="block text-[1.1rem] font-bold text-gray-300 mb-2">Email Address</label>
                <input
                  type="email" required
                  value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-[#222] border-2 border-[#333] rounded-xl focus:border-[#be70f1] focus:shadow-[0_0_10px_rgba(190,112,241,0.5)] text-white outline-none transition-all text-[1.1rem]"
                  placeholder="you@example.com"
                />
              </div>
            )}

            {view !== 'forgot' && (
              <div>
                <label className="block text-[1.1rem] font-bold text-gray-300 mb-2">
                  {view === 'reset' ? 'New Password' : 'Password'}
                </label>
                <input
                  type="password" required
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-[#222] border-2 border-[#333] rounded-xl focus:border-[#be70f1] focus:shadow-[0_0_10px_rgba(190,112,241,0.5)] text-white outline-none transition-all text-[1.1rem]"
                  placeholder={view === 'login' ? "Enter your password" : "Create a strong password"}
                />

                {view === 'login' && (
                  <div className="flex justify-end mt-2">
                    <button
                      type="button"
                      onClick={() => handleViewChange('forgot')}
                      className="text-[0.95rem] text-[#be70f1] hover:text-white transition-colors cursor-pointer bg-transparent border-none p-0"
                    >
                      Forgot password?
                    </button>
                  </div>
                )}

                {(view === 'signup' || view === 'reset') && (
                  <p className="text-[0.8rem] text-gray-400 mt-2">
                    Must be at least 8 characters and include an uppercase letter, a number, and a special character.
                  </p>
                )}
              </div>
            )}

            {(view === 'signup' || view === 'reset') && (
              <div>
                <label className="block text-[1.1rem] font-bold text-gray-300 mb-2">
                  {view === 'reset' ? 'Confirm New Password' : 'Repeat Password'}
                </label>
                <input
                  type="password" required
                  value={repeatPassword} onChange={(e) => setRepeatPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-[#222] border-2 border-[#333] rounded-xl focus:border-[#be70f1] focus:shadow-[0_0_10px_rgba(190,112,241,0.5)] text-white outline-none transition-all text-[1.1rem]"
                  placeholder="Confirm your password"
                />
              </div>
            )}

            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 text-white bg-[#be70f1] hover:bg-[#8a2be2] rounded-xl font-bold tracking-widest text-[1.2rem] shadow-[0_4px_6px_rgb(0,0,0)] transition-colors disabled:opacity-50 border-none cursor-pointer"
              >
                {isLoading ? 'PROCESSING...' : buttonLabels[view]}
              </button>
            </div>
          </form>

          {view === 'login' && (
            <div className="mt-12 flex flex-col items-start space-y-4">
              <button type="button" onClick={() => navigate('/hub')} className="text-[1.1rem] text-gray-400 hover:text-white transition-colors cursor-pointer bg-transparent border-none">
                Continue as Guest
              </button>
              <button type="button" onClick={() => handleViewChange('signup')} className="text-[1.1rem] text-[#be70f1] hover:text-white transition-colors cursor-pointer bg-transparent border-none font-bold">
                First time? Sign up here
              </button>
            </div>
          )}

        </div>
      </div>

      <div
        className="hidden lg:flex w-1/2 relative bg-cover bg-center"
        style={{ backgroundImage: "url('https://github.com/khey25/legaspi_prelimfastapi/blob/main/menuimages/gtaonline.jpg?raw=true')" }}
      >
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="absolute inset-0 flex justify-center items-center pointer-events-none">
          <div className="w-[80%] h-[80%] rounded-full animate-pulse-glow" style={{ background: 'radial-gradient(circle, rgba(190, 112, 241, 0.2) 0%, rgba(190, 112, 241, 0) 70%)' }}></div>
        </div>
        <div className="relative z-10 flex flex-col justify-center items-end w-full h-full p-16 text-right">
          <h3 className="text-xl font-bold text-[#be70f1] tracking-widest uppercase mb-1 drop-shadow-[2px_2px_4px_#000]">
            The Grind Starts Here
          </h3>
          <h1 className="text-[4rem] font-extrabold text-white tracking-tight mb-4 drop-shadow-[4px_4px_6px_#000]">
            THE HUSTLE HUB
          </h1>
          <p className="text-lg text-gray-200 max-w-md leading-relaxed drop-shadow-[1px_1px_2px_#000]">
            Securely log in to the central network to unlock premium Matchmaker algorithms and the Empire building tools.
          </p>
        </div>
      </div>

    </div>
  );
}