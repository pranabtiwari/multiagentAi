import { useState, useEffect } from "react";
import {
  signInWithPopup,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { auth, googleProvider } from "../../utils/firebase.js";
import instance from "../../utils/axios.js";
import { useNavigate } from "react-router";
import { useDispatch } from "react-redux";
import { setUserData } from "../redux/user/userSlice.js";

const Auth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        navigate("/");
      } else {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      let result;
      if (isSignUp) {
        result = await createUserWithEmailAndPassword(
          auth,
          formData.email,
          formData.password
        );
        if (formData.name && result.user) {
          await updateProfile(result.user, { displayName: formData.name });
        }
      } else {
        result = await signInWithEmailAndPassword(
          auth,
          formData.email,
          formData.password
        );
      }

      const idToken = await result.user.getIdToken(true);
      console.log("Logged in user:", result.user);
      const response = await instance.post("/auth/login", {
        idToken,
        name: formData.name || result.user.displayName,
      });
      console.log("Server response:", response.data);
      if (response.data?.user) {
        dispatch(setUserData(response.data.user));
      }
      navigate("/");
    } catch (err) {
      console.error("Email/Password Auth Error:", err);
      setError(err.message || "Failed to authenticate");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setIsSubmitting(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();
      console.log("Logged in user:", result.user);
      const response = await instance.post("/auth/login", { idToken });
      console.log("Server response:", response.data);
      if (response.data?.user) {
        dispatch(setUserData(response.data.user));
      }
      navigate("/");
    } catch (err) {
      console.error("Google Sign-In Error:", err);
      setError(err.message || "Google sign-in failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950 text-neutral-400">
        <div className="flex items-center gap-3">
          <svg
            className="animate-spin h-5 w-5 text-indigo-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z"
            ></path>
          </svg>
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-neutral-950 px-4 py-12 text-neutral-100 selection:bg-indigo-500 selection:text-white">
      {/* Background ambient gradient glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden flex items-center justify-center">
        <div className="w-[500px] h-[500px] bg-indigo-600/15 rounded-full blur-[120px] -translate-y-12"></div>
        <div className="w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[100px] translate-x-32 translate-y-24"></div>
      </div>

      <div className="relative w-full max-w-md bg-neutral-900/80 border border-neutral-800 backdrop-blur-xl rounded-2xl p-8 shadow-2xl shadow-black/50">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/25 mb-4">
            <span className="text-xl font-black text-white tracking-wider">AI</span>
          </div>
          <h1 className="text-2xl font-bold text-neutral-100 tracking-tight">
            {isSignUp ? "Create an account" : "Welcome back"}
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            {isSignUp
              ? "Join freeAi and get started today"
              : "Enter your details to access your account"}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-3 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-2">
            <svg
              className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Google Sign In */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-neutral-800 hover:bg-neutral-750 active:bg-neutral-700 border border-neutral-700 hover:border-neutral-600 text-neutral-200 font-medium rounded-xl transition cursor-pointer shadow-sm disabled:opacity-50"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        {/* Divider */}
        <div className="relative my-6 flex items-center justify-center">
          <div className="w-full border-t border-neutral-800"></div>
          <span className="absolute px-3 bg-neutral-900 text-xs uppercase tracking-wider text-neutral-500">
            or with email
          </span>
        </div>

        {/* Email / Password Form */}
        <form onSubmit={handleEmailAuth} className="space-y-4">
          {isSignUp && (
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                Name
              </label>
              <input
                type="text"
                name="name"
                placeholder="Enter your name"
                value={formData.name}
                onChange={handleChange}
                required={isSignUp}
                className="w-full px-4 py-3 bg-neutral-800/80 border border-neutral-700/80 rounded-xl text-neutral-100 placeholder-neutral-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1.5">
              Email
            </label>
            <input
              type="email"
              name="email"
              placeholder="name@example.com"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-neutral-800/80 border border-neutral-700/80 rounded-xl text-neutral-100 placeholder-neutral-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1.5">
              Password
            </label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-neutral-800/80 border border-neutral-700/80 rounded-xl text-neutral-100 placeholder-neutral-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 active:scale-[0.99] text-white font-medium text-sm rounded-xl shadow-lg shadow-indigo-500/25 transition cursor-pointer disabled:opacity-50"
          >
            {isSubmitting
              ? "Processing..."
              : isSignUp
              ? "Create Account"
              : "Sign In"}
          </button>
        </form>

        {/* Toggle Sign Up / Sign In */}
        <div className="text-center mt-6">
          <button
            type="button"
            onClick={() => {
              setIsSignUp((prev) => !prev);
              setError("");
            }}
            className="text-sm text-neutral-400 hover:text-indigo-400 transition cursor-pointer"
          >
            {isSignUp ? (
              <>
                Already have an account?{" "}
                <span className="text-indigo-400 font-medium underline">
                  Sign In
                </span>
              </>
            ) : (
              <>
                Don&apos;t have an account?{" "}
                <span className="text-indigo-400 font-medium underline">
                  Sign Up
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </main>
  );
};

export default Auth;
