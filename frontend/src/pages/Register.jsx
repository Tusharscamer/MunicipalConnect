import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { AuthContext } from "../context/AuthContext";
import * as authService from "../services/authService";
import { FiUser, FiMail, FiPhone, FiLock, FiAlertCircle } from "react-icons/fi";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { setAuthUser } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Only citizens can register themselves
      const data = await authService.register({
        name,
        email,
        phone,
        password,
        role: "citizen", // Always citizen for self-registration
      });
      // Expecting backend to return { token } or { token: '...' }
      const token = data?.token || data?.accessToken || null;
      if (!token) {
        // If backend returns user object instead, try to handle that case
        // but normally token should be returned on successful registration
        console.warn("No token returned by register endpoint:", data);
      } else {
        localStorage.setItem("token", token);
      }

      // If backend doesn't return full user, try to fetch it inside AuthContext
      // We'll set the user if backend returned it directly (data.user)
      if (data?.user) {
        setAuthUser(data.user);
      }

      // Navigate to dashboard / home after successful registration
      navigate("/");
    } catch (err) {
      // Prefer API provided message, fall back to generic
      const message = err?.response?.data?.message || err?.message || "Registration failed";
      setError(message);
      console.error("Register error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-gray-50">
      <Navbar />
      <main className="flex-grow flex items-center justify-center px-4 py-8 md:py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Join <span className="text-blue-600">MunicipalConnect</span>
            </h1>
            <p className="text-gray-600">Create your citizen account in minutes</p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-gray-100">
            {error && (
              <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl mb-6">
                <FiAlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium mb-1">Registration Error</p>
                  <p className="text-sm">{error}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              <div className="space-y-1">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <FiUser className="w-4 h-4" />
                  Full Name
                </label>
                <div className="relative">
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="John Doe"
                    className="w-full border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 p-3 pl-10 rounded-lg transition-all duration-200"
                  />
                  <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <FiMail className="w-4 h-4" />
                  Email Address
                </label>
                <div className="relative">
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                    required
                    placeholder="john@example.com"
                    className="w-full border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 p-3 pl-10 rounded-lg transition-all duration-200"
                  />
                  <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <FiPhone className="w-4 h-4" />
                  Phone Number
                </label>
                <div className="relative">
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    placeholder="+1 (555) 123-4567"
                    className="w-full border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 p-3 pl-10 rounded-lg transition-all duration-200"
                  />
                  <FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <FiLock className="w-4 h-4" />
                  Password
                </label>
                <div className="relative">
                  <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type="password"
                    required
                    placeholder="••••••••"
                    className="w-full border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 p-3 pl-10 rounded-lg transition-all duration-200"
                  />
                  <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-xl mb-2 text-sm">
                <p className="font-semibold mb-1 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  Important Note
                </p>
                <p className="text-blue-700">Only citizens can register themselves. Department Heads, Team Leaders, and Team Members must be created by an administrator.</p>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Account...
                  </>
                ) : (
                  "Create Account"
                )}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-center text-gray-600 text-sm">
                Already have an account?{" "}
                <Link to="/login" className="text-blue-600 font-semibold hover:text-blue-800 hover:underline">
                  Sign in here
                </Link>
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="text-center bg-white p-3 rounded-xl border border-gray-200">
              <div className="text-lg font-bold text-blue-600">50K+</div>
              <div className="text-xs text-gray-600">Active Citizens</div>
            </div>
            <div className="text-center bg-white p-3 rounded-xl border border-gray-200">
              <div className="text-lg font-bold text-green-600">98%</div>
              <div className="text-xs text-gray-600">Satisfaction</div>
            </div>
            <div className="text-center bg-white p-3 rounded-xl border border-gray-200">
              <div className="text-lg font-bold text-purple-600">24/7</div>
              <div className="text-xs text-gray-600">Support</div>
            </div>
            <div className="text-center bg-white p-3 rounded-xl border border-gray-200">
              <div className="text-lg font-bold text-orange-600">2H</div>
              <div className="text-xs text-gray-600">Avg. Response</div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}