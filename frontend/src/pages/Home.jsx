import { useContext } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { AuthContext } from "../context/AuthContext";
import { Shield, Clock, CheckCircle, Users, TrendingUp, ArrowRight, Star, Award } from "lucide-react";  // Added this line
export default function Home() {
  const { user } = useContext(AuthContext);

  const features = [
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Secure & Reliable",
      description: "Bank-grade security with end-to-end encryption for all your data",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: "Real-time Tracking",
      description: "Live status updates with SLA countdowns and inspection notes",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: <CheckCircle className="w-8 h-8" />,
      title: "Instant Resolution",
      description: "Smart routing to relevant departments for faster service",
      color: "from-green-500 to-emerald-500"
    }
  ];

  const services = [
    { name: "Property Tax", icon: "🏠", count: "45K+ processed" },
    { name: "Water Supply", icon: "💧", count: "32K+ requests" },
    { name: "Waste Management", icon: "🗑️", count: "28K+ resolved" },
    { name: "Street Lights", icon: "💡", count: "15K+ fixed" },
    { name: "Road Repair", icon: "🛣️", count: "12K+ completed" },
    { name: "License & Permits", icon: "📄", count: "8K+ issued" }
  ];

  const testimonials = [
    {
      name: "Rajesh Kumar",
      role: "Local Business Owner",
      content: "Got my shop license in just 2 days! Amazing service.",
      rating: 5
    },
    {
      name: "Priya Sharma",
      role: "Resident",
      content: "Water pipe issue was fixed within 24 hours. Very efficient!",
      rating: 5
    },
    {
      name: "Amit Patel",
      role: "Property Owner",
      content: "Property tax payment process is now so convenient.",
      rating: 4
    }
  ];

  const heroCTA = user ? (
    <div className="space-y-6">
      <p className="text-lg text-gray-300">
        Welcome back, <span className="font-bold text-white">{user.name}</span>! 
        Continue managing your civic services.
      </p>
      <div className="flex flex-wrap justify-center gap-4">
        <Link 
          to={user.role === "admin" ? "/admin" : 
              ["clerk", "inspector", "dept_head", "team_leader", "team_member"].includes(user.role) ? "/staff" : "/citizen"}
          className="group flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
        >
          Open Dashboard
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Link>
        <Link 
          to="/requests/new"
          className="group flex items-center gap-2 bg-gray-800 text-white border border-gray-700 px-8 py-4 rounded-xl font-semibold hover:bg-gray-700 transition-all"
        >
          <span>Raise New Request</span>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  ) : (
    <div className="space-y-6">
      <p className="text-lg text-gray-300 max-w-2xl mx-auto">
        Join thousands of citizens who have transformed their civic experience with MunicipalConnect
      </p>
      <div className="flex flex-wrap justify-center gap-4">
        <Link
          to="/register"
          className="group flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
        >
          Get Started Free
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Link>
        <Link
          to="/login"
          className="group flex items-center gap-2 bg-gray-800 text-white border border-gray-700 px-8 py-4 rounded-xl font-semibold hover:bg-gray-700 transition-all"
        >
          Already Registered? Login
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white">
      <Navbar />
      
      <main className="relative">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10"></div>
          <div className="container mx-auto px-4 py-20 relative">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 bg-gray-800/50 backdrop-blur-sm px-4 py-2 rounded-full mb-6 border border-gray-700">
                <Award className="w-5 h-5 text-yellow-400" />
                <span className="text-sm">Trusted by 50,000+ citizens</span>
              </div>
              
              <h1 className="text-5xl md:text-6xl font-bold mb-6">
                <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Modern Civic Services
                </span>
                <br />
                <span className="text-white">At Your Fingertips</span>
              </h1>
              
              <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
                Inspired by leading municipal corporations, MunicipalConnect delivers 
                seamless digital services with real-time tracking and instant support.
              </p>
              
              {heroCTA}
              
              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">50K+</div>
                  <div className="text-gray-400 text-sm">Active Citizens</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">98%</div>
                  <div className="text-gray-400 text-sm">Satisfaction Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">24/7</div>
                  <div className="text-gray-400 text-sm">Support Available</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">2H</div>
                  <div className="text-gray-400 text-sm">Avg. Response Time</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <section className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Choose <span className="text-blue-400">MunicipalConnect</span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Experience the future of civic engagement with our cutting-edge platform
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="group bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-2xl border border-gray-700 hover:border-gray-600 transition-all hover:transform hover:-translate-y-1"
              >
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.color} mb-6`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Services Section */}
        <section className="bg-gradient-to-b from-gray-800/50 to-gray-900/50 py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Popular <span className="text-green-400">Services</span>
              </h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Access a wide range of municipal services from anywhere, anytime
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {services.map((service, index) => (
                <Link
                  key={index}
                  to="/services"
                  className="group bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-2xl border border-gray-700 hover:border-blue-500/50 transition-all text-center hover:transform hover:-translate-y-1"
                >
                  <div className="text-3xl mb-3">{service.icon}</div>
                  <h3 className="font-bold mb-2">{service.name}</h3>
                  <p className="text-sm text-gray-400">{service.count}</p>
                </Link>
              ))}
            </div>
            
            <div className="text-center mt-12">
              <Link
                to="/services"
                className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 font-semibold"
              >
                View All Services
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              What <span className="text-yellow-400">Citizens Say</span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Join thousands of satisfied citizens who have transformed their civic experience
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index}
                className="bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-2xl border border-gray-700"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-300 mb-6 italic">"{testimonial.content}"</p>
                <div>
                  <div className="font-bold">{testimonial.name}</div>
                  <div className="text-sm text-gray-400">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Transform Your <span className="text-white">Civic Experience</span>?
            </h2>
            <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
              Join MunicipalConnect today and experience seamless, transparent, 
              and efficient municipal services like never before.
            </p>
            
            {!user ? (
              <div className="flex flex-wrap justify-center gap-4">
                <Link
                  to="/register"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg"
                >
                  Create Free Account
                </Link>
                <Link
                  to="/about"
                  className="bg-gray-800 text-white border border-gray-700 px-8 py-4 rounded-xl font-semibold hover:bg-gray-700 transition-all"
                >
                  Learn More
                </Link>
              </div>
            ) : (
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg"
              >
                Go to Dashboard
                <ArrowRight className="w-5 h-5" />
              </Link>
            )}
            
            <div className="mt-12 pt-8 border-t border-gray-700/50">
              <div className="flex flex-wrap justify-center gap-8 text-gray-400 text-sm">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-green-400" />
                  <span>GDPR Compliant</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-400" />
                  <span>24/7 Support</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-purple-400" />
                  <span>99.9% Uptime</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}