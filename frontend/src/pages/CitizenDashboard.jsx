import { useEffect, useState, useContext } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import DashboardCard from "../components/DashboardCard";
import RequestCard from "../components/RequestCard";
import Loader from "../components/Loader";
import { PlusCircle, Filter, Search, Calendar, Download, Bell } from "lucide-react";  // Added this line
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";

// ... rest of the CitizenDashboard.jsx code remains the same ...
export default function CitizenDashboard() {
  const { user, loading: authLoading } = useContext(AuthContext);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    if (!user) return;
    const fetchRequests = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`/api/requests?citizenId=${user.id || user._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRequests(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, [user]);

  const getFilteredRequests = () => {
    if (activeTab === "all") return requests;
    
    const statusMap = {
      pending: ["submitted", "validating", "pending_assignment"],
      "in-progress": ["assigned", "working", "completed_on_site", "in_review"],
      completed: ["completed", "closed"],
      rejected: ["invalid", "rework_required"],
    };
    
    const statuses = statusMap[activeTab] || [];
    return requests.filter((req) => statuses.includes(req.status));
  };

  const filteredRequests = getFilteredRequests();

  const getCount = (tab) => {
    if (tab === "all") return requests.length;
    const statusMap = {
      pending: ["submitted", "validating", "pending_assignment"],
      "in-progress": ["assigned", "working", "completed_on_site", "in_review"],
      completed: ["completed", "closed"],
      rejected: ["invalid", "rework_required"],
    };
    const statuses = statusMap[tab] || [];
    return requests.filter((req) => statuses.includes(req.status)).length;
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold text-blue-700 mb-6">Your Requests</h2>
        
        {/* Status Tabs */}
        <div className="flex gap-2 mb-6 border-b">
          {[
            { key: "all", label: "All Requests" },
            { key: "pending", label: "Pending" },
            { key: "in-progress", label: "In Progress" },
            { key: "completed", label: "Completed" },
            { key: "rejected", label: "Rejected" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 font-semibold border-b-2 transition-colors ${
                activeTab === tab.key
                  ? "border-blue-700 text-blue-700"
                  : "border-transparent text-gray-600 hover:text-blue-700"
              }`}
            >
              {tab.label} ({getCount(tab.key)})
            </button>
          ))}
        </div>

        {authLoading || loading ? (
          <p>Loading...</p>
        ) : !user ? (
          <p>Please login to view your dashboard.</p>
        ) : filteredRequests.length === 0 ? (
          <p className="text-gray-600">
            {activeTab === "all"
              ? "No requests submitted yet."
              : `No ${activeTab.replace("-", " ")} requests.`}
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRequests.map((req) => (
              <RequestCard key={req._id} request={req} />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
