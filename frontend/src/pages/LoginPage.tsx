import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../store/AuthContext";

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
      navigate("/");
    } catch (err: any) {
      setError(err.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    // Added 'relative' to the main container to absolute position the back button
    <div className="min-h-screen flex items-center justify-center bg-rose-50 px-4 relative">
      
      {/* Home Button - Top Left */}
      <Link 
        to="/" 
        className="absolute top-6 left-6 md:top-8 md:left-8 flex items-center text-rose-600 hover:text-rose-800 font-semibold transition-colors duration-200 group"
      >
        <svg 
          className="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Home
      </Link>

      <div className="w-full max-w-sm">
        <div className="bg-white rounded-2xl shadow-md p-10 border border-rose-100">
          <h1 className="text-3xl font-bold mb-2 text-gray-800">Login</h1>
          <p className="text-gray-600 text-sm mb-6">
            Sign in to access your saved articles
          </p>

          {error && <div className="error-message mb-6">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4 mb-6">
            <div>
              <label
                htmlFor="email"
                className="block font-semibold text-gray-800 text-sm mb-2"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                placeholder="your@email.com"
                className="w-full px-3 py-2 border-2 border-rose-200 rounded-lg text-sm focus:outline-none focus:border-rose-400 disabled:bg-rose-50 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block font-semibold text-gray-800 text-sm mb-2"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                placeholder="••••••••"
                className="w-full px-3 py-2 border-2 border-rose-200 rounded-lg text-sm focus:outline-none focus:border-rose-400 disabled:bg-rose-50 disabled:cursor-not-allowed"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full !py-3"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <p className="text-center text-gray-600 text-sm">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="text-rose-600 font-semibold hover:underline"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;