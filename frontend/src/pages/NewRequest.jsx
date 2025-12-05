import { useContext, useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import * as departmentService from "../services/departmentService";
import { useNavigate } from "react-router-dom";
import { 
  MapPin, 
  Upload, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  ArrowLeft,
  Navigation,
  FileText,
  Building,
  AlertCircle
} from "lucide-react";
import { toast } from "react-hot-toast";
import Loader from "../components/Loader";

export default function NewRequest() {
  const [formData, setFormData] = useState({
    serviceType: "",
    priority: "medium",
    description: "",
    address: "",
    lat: "",
    lng: "",
    departmentId: ""
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [checkingSimilar, setCheckingSimilar] = useState(false);
  const [similar, setSimilar] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [locationLoading, setLocationLoading] = useState(false);
  const [step, setStep] = useState(1);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const dashboardPath = useMemo(() => {
    if (!user) return "/login";
    if (user.role === "admin") return "/admin";
    if (["clerk", "inspector", "dept_head", "team_leader", "team_member"].includes(user.role)) return "/staff";
    return "/citizen";
  }, [user]);

  useEffect(() => {
    const loadDepts = async () => {
      try {
        const res = await departmentService.fetchDepartments();
        setDepartments(res.data || []);
      } catch {
        toast.error("Failed to load departments");
      }
    };
    loadDepts();
  }, []);

  const serviceTypes = [
    "Pothole Repair",
    "Streetlight Outage",
    "Water Supply Issue",
    "Sanitation Problem",
    "Solid Waste Collection",
    "Drainage Blockage",
    "Road Repair",
    "Tree Pruning",
    "Public Park Maintenance",
    "Building Permission",
    "Property Tax",
    "License Application"
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData(prev => ({
          ...prev,
          lat: position.coords.latitude.toString(),
          lng: position.coords.longitude.toString()
        }));
        toast.success("Location captured successfully");
        setLocationLoading(false);
      },
      (error) => {
        console.error("Geolocation error:", error);
        toast.error("Could not get your location. Please enter manually.");
        setLocationLoading(false);
      },
      { timeout: 10000 }
    );
  };

  const checkSimilar = async () => {
    if (!formData.serviceType || !formData.description) {
      toast.error("Please fill service type and description first");
      return;
    }
    
    setCheckingSimilar(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "/api/requests/similar",
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSimilar(res.data || []);
      if (res.data.length > 0) {
        toast.success(`Found ${res.data.length} similar requests`);
      } else {
        toast.info("No similar requests found");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to check similar requests");
    } finally {
      setCheckingSimilar(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please login before submitting a request");
      navigate("/login");
      return;
    }

    setLoading(true);
    try {
      const submitData = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value) submitData.append(key, value);
      });
      if (file) submitData.append("attachment", file);

      const token = localStorage.getItem("token");
      const res = await axios.post("/api/requests", submitData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success(res.data?.message || "Request submitted successfully!");
      
      // Reset form
      setFormData({
        serviceType: "",
        priority: "medium",
        description: "",
        address: "",
        lat: "",
        lng: "",
        departmentId: ""
      });
      setFile(null);
      setSimilar([]);

      // Redirect after delay
      setTimeout(() => navigate(dashboardPath), 1500);
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Submission failed";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
        <Navbar />
        <main className="container mx-auto px-4 py-16 text-center">
          <div className="max-w-md mx-auto bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 border border-gray-700">
            <AlertCircle className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-4">Authentication Required</h2>
            <p className="text-gray-300 mb-6">
              You need to login to submit a service request.
            </p>
            <button
              onClick={() => navigate("/login")}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all"
            >
              Go to Login
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-400 hover:text-white mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                New Service Request
              </h1>
              <p className="text-gray-400 mt-2">
                Submit a new municipal service request with detailed information
              </p>
            </div>
            
            <div className="flex items-center gap-2 text-sm">
              <div className={`px-3 py-1 rounded-full ${step === 1 ? 'bg-blue-600' : 'bg-gray-800'}`}>
                Details
              </div>
              <div className="h-1 w-4 bg-gray-700"></div>
              <div className={`px-3 py-1 rounded-full ${step === 2 ? 'bg-blue-600' : 'bg-gray-800'}`}>
                Review
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700 p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Service Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <Building className="inline w-4 h-4 mr-2" />
                    Service Type *
                  </label>
                  <select
                    name="serviceType"
                    value={formData.serviceType}
                    onChange={handleChange}
                    className="w-full bg-gray-700 border border-gray-600 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select a service type</option>
                    {serviceTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                {/* Department */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <Building className="inline w-4 h-4 mr-2" />
                    Department (Optional)
                  </label>
                  <select
                    name="departmentId"
                    value={formData.departmentId}
                    onChange={handleChange}
                    className="w-full bg-gray-700 border border-gray-600 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select department (if known)</option>
                    {departments.map((dept) => (
                      <option key={dept._id} value={dept._id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Priority and Location */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <AlertTriangle className="inline w-4 h-4 mr-2" />
                      Priority Level
                    </label>
                    <select
                      name="priority"
                      value={formData.priority}
                      onChange={handleChange}
                      className="w-full bg-gray-700 border border-gray-600 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="low">Low Priority</option>
                      <option value="medium">Medium Priority</option>
                      <option value="high">High Priority</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <MapPin className="inline w-4 h-4 mr-2" />
                      Address / Landmark
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="Eg: Sector 12, Near Ward Office"
                      className="w-full bg-gray-700 border border-gray-600 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Coordinates */}
                <div className="bg-gray-800/50 rounded-xl p-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <Navigation className="inline w-4 h-4 mr-2" />
                    GPS Coordinates (Optional)
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input
                      type="number"
                      step="any"
                      name="lat"
                      value={formData.lat}
                      onChange={handleChange}
                      placeholder="Latitude"
                      className="bg-gray-700 border border-gray-600 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <input
                      type="number"
                      step="any"
                      name="lng"
                      value={formData.lng}
                      onChange={handleChange}
                      placeholder="Longitude"
                      className="bg-gray-700 border border-gray-600 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={getCurrentLocation}
                      disabled={locationLoading}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-3 rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {locationLoading ? (
                        <span className="flex items-center justify-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Getting Location...
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          <Navigation className="w-4 h-4" />
                          Use My Location
                        </span>
                      )}
                    </button>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <FileText className="inline w-4 h-4 mr-2" />
                    Detailed Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Please provide a detailed description of the issue..."
                    rows="4"
                    className="w-full bg-gray-700 border border-gray-600 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  <p className="text-xs text-gray-400 mt-2">
                    Be as specific as possible. Include details like time of occurrence, severity, and any immediate safety concerns.
                  </p>
                </div>

                {/* File Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <Upload className="inline w-4 h-4 mr-2" />
                    Attachments (Optional)
                  </label>
                  <div className="border-2 border-dashed border-gray-600 rounded-xl p-6 text-center hover:border-blue-500 transition-colors">
                    <input
                      type="file"
                      onChange={(e) => setFile(e.target.files[0])}
                      className="hidden"
                      id="file-upload"
                      accept="image/*,.pdf,.doc,.docx"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-300 font-medium">
                        {file ? file.name : "Click to upload photos or documents"}
                      </p>
                      <p className="text-sm text-gray-400 mt-1">
                        Supports JPG, PNG, PDF (Max 5MB)
                      </p>
                    </label>
                  </div>
                  {file && (
                    <button
                      type="button"
                      onClick={() => setFile(null)}
                      className="mt-2 text-sm text-red-400 hover:text-red-300"
                    >
                      Remove file
                    </button>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <button
                    type="button"
                    onClick={checkSimilar}
                    disabled={checkingSimilar || loading}
                    className="flex-1 bg-gray-700 text-white py-3 px-6 rounded-xl font-medium hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {checkingSimilar ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Checking Similar...
                      </span>
                    ) : (
                      "Check Similar Requests"
                    )}
                  </button>
                  
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Submitting...
                      </span>
                    ) : (
                      "Submit Request"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Similar Requests Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700 p-6 sticky top-6">
              <div className="flex items-center gap-3 mb-6">
                <CheckCircle className="w-6 h-6 text-blue-400" />
                <h3 className="text-xl font-bold text-white">Similar Requests Nearby</h3>
              </div>
              
              <p className="text-gray-400 text-sm mb-6">
                Avoid duplicates by supporting existing requests. This helps prioritize issues and reduces response time.
              </p>
              
              {similar.length > 0 && (
                <div className="mb-4 p-3 bg-blue-900/20 border border-blue-500/30 rounded-xl">
                  <p className="text-blue-300 text-sm">
                    <CheckCircle className="inline w-4 h-4 mr-2" />
                    Found {similar.length} similar request{similar.length > 1 ? 's' : ''}
                  </p>
                </div>
              )}
              
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                {similar.length === 0 ? (
                  <div className="text-center py-8">
                    <Clock className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400">
                      {checkingSimilar 
                        ? "Searching for similar requests..." 
                        : "No similar requests found. Check after filling details."}
                    </p>
                  </div>
                ) : (
                  similar.map((request) => (
                    <div 
                      key={request._id} 
                      className="bg-gray-800/50 rounded-xl p-4 hover:bg-gray-800 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-white">{request.serviceType}</h4>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          request.status === 'Resolved' ? 'bg-green-900/30 text-green-400' :
                          request.status === 'In Progress' ? 'bg-yellow-900/30 text-yellow-400' :
                          'bg-blue-900/30 text-blue-400'
                        }`}>
                          {request.status}
                        </span>
                      </div>
                      <p className="text-gray-300 text-sm line-clamp-2 mb-3">
                        {request.description}
                      </p>
                      <div className="flex justify-between items-center text-xs text-gray-400">
                        <span>{request.supportCount || 0} supports</span>
                        <button
                          onClick={() => navigate(`/requests/${request._id}`)}
                          className="text-blue-400 hover:text-blue-300 font-medium"
                        >
                          View Details →
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-700">
                <h4 className="font-bold text-white mb-3">💡 Tips for Better Response</h4>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                    Include clear photos of the issue
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                    Provide exact location with landmarks
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                    Be specific about the problem
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                    Check for similar requests first
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}