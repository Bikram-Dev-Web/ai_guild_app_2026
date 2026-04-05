import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../store/AuthContext";

const SignupPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signup, login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    // Client-side validation
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);

    try {
      await signup(email, password, username);
      // Auto-login after signup
      await login(email, password);
      navigate("/");
    } catch (err: any) {
      setError(err.error || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-rose-50 px-4">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-2xl shadow-md p-10 border border-rose-100">
          <h1 className="text-3xl font-bold mb-2 text-gray-800">Sign Up</h1>
          <p className="text-gray-600 text-sm mb-6">
            Join NovaNews to save and organize articles
          </p>

          {error && <div className="error-message mb-6">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4 mb-6">
            <div>
              <label
                htmlFor="username"
                className="block font-semibold text-gray-800 text-sm mb-2"
              >
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
                placeholder="Your name"
                className="w-full px-3 py-2 border-2 border-rose-200 rounded-lg text-sm focus:outline-none focus:border-rose-400 disabled:bg-rose-50 disabled:cursor-not-allowed"
              />
            </div>

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
                placeholder="At least 8 characters"
                className="w-full px-3 py-2 border-2 border-rose-200 rounded-lg text-sm focus:outline-none focus:border-rose-400 disabled:bg-rose-50 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block font-semibold text-gray-800 text-sm mb-2"
              >
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
                placeholder="Confirm password"
                className="w-full px-3 py-2 border-2 border-rose-200 rounded-lg text-sm focus:outline-none focus:border-rose-400 disabled:bg-rose-50 disabled:cursor-not-allowed"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full !py-3"
            >
              {loading ? "Creating account..." : "Sign Up"}
            </button>
          </form>

          <p className="text-center text-gray-600 text-sm">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-rose-600 font-semibold hover:underline"
            >
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
