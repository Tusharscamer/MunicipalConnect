import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import * as requestService from "../services/requestService";
import { 
  Calendar, 
  Clock, 
  Users, 
  FileText, 
  CheckCircle, 
  AlertCircle,
  ThumbsUp,
  Download,
  Star,
  MapPin,
  Shield
} from "lucide-react";

import ErrorBoundary from "../components/ErrorBoundary";

export default function RequestDetail() {
  const { id } = useParams();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [supporting, setSupporting] = useState(false);
  const [error, setError] = useState("");
  const [feedbackForm, setFeedbackForm] = useState({ rating: "", comment: "" });
  const { user } = useContext(AuthContext);
  const [validationError, setValidationError] = useState("");

  // Validate request ID format
  useEffect(() => {
    if (!id || typeof id !== 'string' || id.length < 10) {
      setValidationError("Invalid request ID format");
    }
  }, [id]);

  if (validationError) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">Invalid Request</h2>
            <p className="text-gray-600 mb-6">{validationError}</p>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-700 text-white rounded-xl font-semibold hover:bg-blue-800 transition-colors"
            >
              View All Requests
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }



  useEffect(() => {
    const fetchRequest = async () => {
      try {
        const token = localStorage.getItem("token");
        // Try authenticated endpoint first, fallback to public
        try {
          const res = await axios.get(`/api/requests/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setRequest(res.data);
        } catch (authErr) {
          // If auth fails, try public endpoint
          const res = await axios.get(`/api/requests/public/${id}`);
          setRequest(res.data);
        }
      } catch (err) {
        console.error("Error fetching request:", err);
        setError("Failed to load request details");
      } finally {
        setLoading(false);
      }
    };
    fetchRequest();
  }, [id]);

  const userId = user?.id || user?._id;
  const requestCitizenId =
    request?.citizen && typeof request.citizen === "object"
      ? request.citizen._id || request.citizen.id
      : request?.citizen;

  const isOwner = !!userId && !!requestCitizenId && requestCitizenId.toString() === userId.toString();

  const hasSupported =
    !!user &&
    !isOwner &&
    Array.isArray(request?.supporters)
      ? request.supporters.some((s) => (s._id || s).toString() === userId?.toString())
      : false;

  const handleSupport = async () => {
    if (!user) {
      setError("Please login to support this request.");
      return;
    }
    if (isOwner) {
      setError("You cannot support a request you created.");
      return;
    }
    setSupporting(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `/api/requests/${id}/support`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRequest(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to support request");
    } finally {
      setSupporting(false);
    }
  };

  const handleFeedback = async () => {
    try {
      await requestService.submitCitizenFeedback(request._id, feedbackForm);
      setRequest((prev) => ({
        ...prev,
        citizenFeedback: { ...feedbackForm, createdAt: new Date().toISOString() },
        status: prev.status === "completed" ? "closed" : prev.status,
      }));
      setFeedbackForm({ rating: "", comment: "" });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit feedback");
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'validating': return 'bg-yellow-100 text-yellow-800';
      case 'pending_assignment': return 'bg-orange-100 text-orange-800';
      case 'assigned': return 'bg-purple-100 text-purple-800';
      case 'in_progress': return 'bg-indigo-100 text-indigo-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-700 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading request details...</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
  
  if (!request) return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
        <div className="text-center py-12">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-2xl font-semibold text-gray-700 mb-2">Request Not Found</h3>
          <p className="text-gray-500">The requested service request could not be found.</p>
        </div>
      </main>
      <Footer />
    </div>
  );

  const backendBase =
    import.meta.env.VITE_BACKEND_BASE_URL ||
    import.meta.env.VITE_API_BASE_URL ||
    "http://localhost:5000";
  const attachmentHref =
    request.attachmentUrl && !request.attachmentUrl.startsWith("http")
      ? `${backendBase}${request.attachmentUrl}`
      : request.attachmentUrl;

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Request Details</h2>
          <p className="text-gray-600">Track the progress of your civic service request</p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-700 to-blue-600 p-6 text-white">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-6 h-6" />
                  <h3 className="text-2xl font-semibold">Service Request #{request._id.slice(-8)}</h3>
                </div>
                <p className="text-blue-100">{request.serviceType}</p>
              </div>
              <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(request.status)}`}>
                {request.status?.toUpperCase().replace("_", " ")}
              </span>
            </div>
          </div>

          <div className="p-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Calendar className="w-5 h-5 text-blue-700" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Submitted</p>
                    <p className="font-semibold text-gray-800">
                      {new Date(request.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="bg-orange-100 p-2 rounded-lg">
                    <Clock className="w-5 h-5 text-orange-700" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Priority</p>
                    <p className={`font-semibold ${request.priority === 'high' ? 'text-red-600' : 
                       request.priority === 'medium' ? 'text-yellow-600' : 'text-green-600'}`}>
                      {request.priority?.toUpperCase()}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="bg-purple-100 p-2 rounded-lg">
                    <Users className="w-5 h-5 text-purple-700" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Supporters</p>
                    <p className="font-semibold text-gray-800">
                      {request.supportCount || 0}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <FileText className="w-5 h-5 text-green-700" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Last Updated</p>
                    <p className="font-semibold text-gray-800">
                      {new Date(request.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Description Card */}
            <div className="mb-8">
              <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-700" />
                Description
              </h4>
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-5">
                <p className="text-gray-700 leading-relaxed">{request.description}</p>
              </div>
            </div>

            {/* Location (if available) */}
            {request.location && (
              <div className="mb-8">
                <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-red-600" />
                  Location
                </h4>
                <div className="bg-red-50 border border-red-100 rounded-xl p-5">
                  <p className="text-gray-700">{request.location.address}</p>
                </div>
              </div>
            )}

            {/* Support Button */}
            {!isOwner && (
              <div className="mb-8">
                <div className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-1">Support this Request</h4>
                    <p className="text-gray-600 text-sm">Show your support to prioritize this service</p>
                  </div>
                  <button
                    onClick={handleSupport}
                    disabled={supporting || hasSupported}
                    className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                      hasSupported
                        ? 'bg-green-100 text-green-800 border border-green-200'
                        : 'bg-gradient-to-r from-blue-700 to-blue-600 text-white hover:from-blue-800 hover:to-blue-700 shadow-md hover:shadow-lg'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {hasSupported ? (
                      <span className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5" />
                        Supported
                      </span>
                    ) : supporting ? (
                      'Supporting...'
                    ) : (
                      <span className="flex items-center gap-2">
                        <ThumbsUp className="w-5 h-5" />
                        Support Request
                      </span>
                    )}
                  </button>
                </div>
                {error && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                )}
              </div>
            )}

            {/* Attachment */}
            {attachmentHref && (
              <div className="mb-8">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Attachment</h4>
                <a
                  href={attachmentHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-800 font-medium transition-colors"
                >
                  <Download className="w-5 h-5" />
                  Download Attachment
                </a>
              </div>
            )}

            {/* Tasks Section */}
            {request.tasks && request.tasks.length > 0 && (
              <div className="mb-8">
                <h4 className="text-lg font-semibold text-gray-800 mb-6">Task Progress</h4>
                <div className="space-y-4">
                  {request.tasks.map((task, idx) => (
                    <div key={idx} className="border border-gray-200 rounded-xl p-5 bg-white hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg ${
                              task.status === "completed" ? "bg-green-100" :
                              task.status === "in_progress" ? "bg-blue-100" :
                              "bg-gray-100"
                            }`}>
                              {task.status === "completed" ? (
                                <CheckCircle className="w-6 h-6 text-green-700" />
                              ) : (
                                <Clock className={`w-6 h-6 ${
                                  task.status === "in_progress" ? "text-blue-700" : "text-gray-700"
                                }`} />
                              )}
                            </div>
                            <div className="flex-1">
                              <h5 className="font-semibold text-gray-800 mb-2">{task.title}</h5>
                              {task.description && (
                                <p className="text-gray-600 mb-3">{task.description}</p>
                              )}
                              <div className="flex flex-wrap gap-2">
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                  task.status === "completed" ? "bg-green-100 text-green-800" :
                                  task.status === "in_progress" ? "bg-blue-100 text-blue-800" :
                                  "bg-gray-100 text-gray-800"
                                }`}>
                                  {task.status?.toUpperCase().replace("_", " ")}
                                </span>
                                {task.assignedTeam && (
                                  <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
                                    Team: {task.assignedTeam.name}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Completion Report */}
            {request.status === "completed" && request.completion && request.verification?.status === "accepted" && (
              <div className="mb-8">
                <div className="bg-gradient-to-r from-green-700 to-green-600 text-white p-5 rounded-t-xl">
                  <h4 className="text-lg font-semibold flex items-center gap-2">
                    <CheckCircle className="w-6 h-6" />
                    Approved Completion Report
                  </h4>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-b-xl p-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {request.completion.timeTakenHours && (
                      <div className="bg-white p-4 rounded-lg border border-green-200">
                        <p className="text-sm font-semibold text-gray-600 mb-1">Time Taken</p>
                        <p className="text-2xl font-bold text-green-700">{request.completion.timeTakenHours} hours</p>
                      </div>
                    )}
                    {request.completion.costIncurred !== undefined && request.completion.costIncurred !== null && (
                      <div className="bg-white p-4 rounded-lg border border-green-200">
                        <p className="text-sm font-semibold text-gray-600 mb-1">Cost Incurred</p>
                        <p className="text-2xl font-bold text-green-700">₹{request.completion.costIncurred.toLocaleString()}</p>
                      </div>
                    )}
                  </div>
                  
                  {request.completion.materialsUsed && (
                    <div className="mb-4">
                      <p className="text-sm font-semibold text-gray-600 mb-2">Materials Used</p>
                      <div className="bg-white p-4 rounded-lg border">
                        <p className="text-gray-700">{request.completion.materialsUsed}</p>
                      </div>
                    </div>
                  )}
                  
                  {request.completion.notes && (
                    <div className="mb-4">
                      <p className="text-sm font-semibold text-gray-600 mb-2">Completion Notes</p>
                      <div className="bg-white p-4 rounded-lg border">
                        <p className="text-gray-700">{request.completion.notes}</p>
                      </div>
                    </div>
                  )}
                  
                  {request.completion.evidence && request.completion.evidence.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold text-gray-600 mb-3">Work Evidence</p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {request.completion.evidence.map((evidence, idx) => {
                          const evidenceUrl = evidence.startsWith("http") 
                            ? evidence 
                            : `${backendBase}${evidence}`;
                          const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(evidence);
                          const isVideo = /\.(mp4|webm|ogg)$/i.test(evidence);
                          
                          return (
                            <div key={idx} className="border rounded-lg overflow-hidden bg-white hover:shadow-md transition-shadow">
                              {isImage ? (
                                <img 
                                  src={evidenceUrl} 
                                  alt={`Evidence ${idx + 1}`}
                                  className="w-full h-40 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                                  onClick={() => window.open(evidenceUrl, "_blank")}
                                />
                              ) : isVideo ? (
                                <video 
                                  src={evidenceUrl}
                                  className="w-full h-40 object-cover"
                                  controls
                                />
                              ) : (
                                <a 
                                  href={evidenceUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="flex items-center justify-center h-40 text-blue-700 hover:text-blue-800"
                                >
                                  <FileText className="w-8 h-8" />
                                </a>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-6 pt-6 border-t border-green-300 text-sm text-gray-600 space-y-2">
                    {request.completion.submittedAt && (
                      <p>
                        <strong>Submitted:</strong> {new Date(request.completion.submittedAt).toLocaleString()}
                        {request.completion.submittedBy && typeof request.completion.submittedBy === "object" && (
                          <span> by {request.completion.submittedBy.name || "Team Leader"}</span>
                        )}
                      </p>
                    )}
                    {request.verification?.verifiedAt && (
                      <p>
                        <strong>Approved:</strong> {new Date(request.verification.verifiedAt).toLocaleString()}
                        {request.verification.verifiedBy && typeof request.verification.verifiedBy === "object" && (
                          <span> by {request.verification.verifiedBy.name || "Department Head"}</span>
                        )}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* History Timeline */}
            <div className="mb-8">
              <h4 className="text-lg font-semibold text-gray-800 mb-6">Activity Timeline</h4>
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-blue-200"></div>
                
                <div className="space-y-8">
                  {request.history.map((h, i) => (
                    <div key={i} className="relative pl-12">
                      {/* Timeline dot */}
                      <div className={`absolute left-3 w-3 h-3 rounded-full border-4 border-white ${
                        h.status === 'completed' || h.status === 'closed' ? 'bg-green-500' :
                        h.status === 'in_progress' ? 'bg-blue-500' :
                        h.status === 'submitted' ? 'bg-purple-500' :
                        'bg-gray-500'
                      }`}></div>
                      
                      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h5 className="font-semibold text-gray-800 capitalize">{h.status}</h5>
                            <p className="text-sm text-gray-600 mt-1">
                              {user?.role === "citizen" && h.by?.role !== "citizen" ? (
                                "Updated by System"
                              ) : (
                                `Updated by ${h.by?.name || "User"}`
                              )}
                            </p>
                            {h.message && (
                              <p className="text-sm text-gray-700 mt-2 italic">"{h.message}"</p>
                            )}
                          </div>
                          <span className="text-sm text-gray-500">
                            {new Date(h.createdAt).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Feedback Section */}
            {isOwner && ["completed", "closed"].includes(request.status) && (
              <div className="mb-8">
                <h4 className="text-lg font-semibold text-gray-800 mb-6">Service Feedback</h4>
                
                {request.citizenFeedback && request.citizenFeedback.createdAt ? (
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-blue-100 p-2 rounded-lg">
                        <Star className="w-6 h-6 text-yellow-500 fill-current" />
                      </div>
                      <div>
                        <h5 className="font-semibold text-gray-800">Your Feedback</h5>
                        <p className="text-sm text-gray-600">Submitted on {new Date(request.citizenFeedback.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-6 h-6 ${
                            i < request.citizenFeedback.rating
                              ? 'text-yellow-500 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                      <span className="ml-2 text-gray-700 font-semibold">
                        {request.citizenFeedback.rating}/5
                      </span>
                    </div>
                    <div className="bg-white rounded-lg p-4 border">
                      <p className="text-gray-700">{request.citizenFeedback.comment}</p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
                    <h5 className="font-semibold text-gray-800 mb-4">Share Your Experience</h5>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Rating <span className="text-red-500">*</span>
                        </label>
                        <div className="flex gap-1 mb-2">
                          {[1, 2, 3, 4, 5].map((rating) => (
                            <button
                              key={rating}
                              type="button"
                              onClick={() => setFeedbackForm(prev => ({ ...prev, rating }))}
                              className="p-2 hover:scale-110 transition-transform"
                            >
                              <Star
                                className={`w-8 h-8 ${
                                  rating <= feedbackForm.rating
                                    ? 'text-yellow-500 fill-current'
                                    : 'text-gray-300'
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Comments
                        </label>
                        <textarea
                          className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                          rows="4"
                          placeholder="Share your experience with this service..."
                          value={feedbackForm.comment}
                          onChange={(e) => setFeedbackForm((prev) => ({ ...prev, comment: e.target.value }))}
                        />
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <p className="text-sm text-gray-500">
                          Note: You can only submit feedback once per request.
                        </p>
                        <button
                          onClick={handleFeedback}
                          disabled={!feedbackForm.rating}
                          className="px-6 py-3 bg-gradient-to-r from-blue-700 to-blue-600 text-white rounded-xl font-semibold hover:from-blue-800 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                          Submit Feedback
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}