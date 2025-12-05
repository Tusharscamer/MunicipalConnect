import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { AuthContext } from "../context/AuthContext";
import * as authService from "../services/authService";
import { Lock, Mail, Eye, EyeOff, ArrowRight, Shield, UserPlus } from "lucide-react";
import { toast } from "react-hot-toast";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { setAuthUser } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const data = await authService.login(email, password);

      // Save token
      localStorage.setItem("token", data.token);

      // Save user to context
      if (data.user) setAuthUser(data.user);

      console.log("User Role:", data.user?.role);

      toast.success(`Welcome back, ${data.user?.name || "User"}!`);

      // Redirect user by backend role
      const role = data.user?.role;

      let target = "/citizen"; // default fallback

      if (role === "super_admin") {
        target = "/super-admin";
      } else if (role === "admin") {
        target = "/admin";
      } else if (role === "dept_head") {
        target = "/department-head";
      } else if (role === "team_leader") {
        target = "/team-leader";
      } else if (role === "team_member") {
        target = "/team-member";
      }

      // Delay for smoother UX
      setTimeout(() => navigate(target), 700);

    } catch (err) {
      const errorMsg = err.response?.data?.message || "Login failed. Please check your credentials.";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const demoLogin = (role) => {
    const demos = {
      citizen: { email: "citizen@demo.com", password: "demo123" },
      dept_head: { email: "dept_head@demo.com", password: "demo123" },
      admin: { email: "admin@demo.com", password: "demo123" },
      super_admin: { email: "super@demo.com", password: "demo123" }
    };

    const demo = demos[role];
    if (demo) {
      setEmail(demo.email);
      setPassword(demo.password);
      toast(`Demo ${role} credentials loaded. Click Login.`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">

          {/* Hero */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold mb-2">
              Welcome to <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">MunicipalConnect</span>
            </h1>
            <p className="text-gray-400">Sign in to access civic services</p>
          </div>

          {/* Login Card */}
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700 p-8 shadow-2xl">
            <h2 className="text-2xl font-bold mb-6">Sign In</h2>

            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Mail className="inline w-4 h-4 mr-2" />
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 text-white px-4 py-3 pl-10 rounded-xl"
                    placeholder="you@example.com"
                    required
                  />
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Lock className="inline w-4 h-4 mr-2" />
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 text-white px-4 py-3 pl-10 pr-10 rounded-xl"
                    placeholder="••••••••"
                    required
                  />
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Demo Logins */}
              <div className="bg-gray-800/50 rounded-xl p-4">
                <p className="text-sm text-gray-400 mb-2">Quick Demo Access:</p>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => demoLogin("citizen")} className="text-xs px-3 py-1 bg-blue-900/30 text-blue-300 rounded-lg">
                    Citizen
                  </button>
                  <button onClick={() => demoLogin("dept_head")} className="text-xs px-3 py-1 bg-purple-900/30 text-purple-300 rounded-lg">
                    Dept Head
                  </button>
                  <button onClick={() => demoLogin("admin")} className="text-xs px-3 py-1 bg-green-900/30 text-green-300 rounded-lg">
                    Admin
                  </button>
                  <button onClick={() => demoLogin("super_admin")} className="text-xs px-3 py-1 bg-red-900/30 text-red-300 rounded-lg">
                    Super Admin
                  </button>
                </div>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold"
              >
                {loading ? "Signing in..." : <>Sign In <ArrowRight className="w-5 h-5" /></>}
              </button>

              {/* Register */}
              <div className="text-center mt-4">
                <Link to="/register" className="text-gray-300 hover:text-white">
                  <UserPlus className="inline w-5 h-5 mr-1" />
                  Create an account
                </Link>
              </div>

            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
