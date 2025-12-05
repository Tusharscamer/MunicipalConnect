import { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import axios from "axios";
import { CreditCard, DollarSign, FileText, Shield, CheckCircle, AlertTriangle, Clock, Receipt } from "lucide-react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function PaymentPage() {
  const [formData, setFormData] = useState({
    requestId: "",
    amount: "",
    paymentMethod: "card"
  });
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const navigate = useNavigate();

  const paymentMethods = [
    { id: "card", name: "Credit/Debit Card", icon: <CreditCard className="w-5 h-5" /> },
    { id: "upi", name: "UPI", icon: "💳" },
    { id: "netbanking", name: "Net Banking", icon: "🏦" },
    { id: "wallet", name: "Wallet", icon: "👛" }
  ];

  const recentPayments = [
    { id: "REQ-001234", amount: "₹500", status: "Paid", date: "2024-01-15" },
    { id: "REQ-001235", amount: "₹1,200", status: "Paid", date: "2024-01-10" },
    { id: "REQ-001236", amount: "₹750", status: "Pending", date: "2024-01-05" }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "/api/payments",
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Payment initiated successfully!");
      setProcessing(true);
      
      // Simulate payment processing
      setTimeout(() => {
        setProcessing(false);
        toast.success(`Payment completed! Transaction ID: ${res.data.transactionId}`);
        
        // Reset form
        setFormData({
          requestId: "",
          amount: "",
          paymentMethod: "card"
        });
        
        // Redirect to receipt
        if (res.data.transactionId) {
          navigate(`/payment/receipt/${res.data.transactionId}`);
        }
      }, 2000);
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Payment failed. Please try again.";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent mb-2">
            Payment Portal
          </h1>
          <p className="text-gray-400">
            Securely pay municipal fees, taxes, and service charges
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Payment Form */}
          <div className="lg:col-span-2">
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700 p-6 mb-8">
              <div className="flex items-center gap-3 mb-6">
                <CreditCard className="w-8 h-8 text-green-400" />
                <h2 className="text-2xl font-bold text-white">Make Payment</h2>
              </div>

              <form onSubmit={handlePayment} className="space-y-6">
                {/* Request ID */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <FileText className="inline w-4 h-4 mr-2" />
                    Request ID *
                  </label>
                  <input
                    type="text"
                    name="requestId"
                    value={formData.requestId}
                    onChange={handleChange}
                    placeholder="Enter your request ID (e.g., REQ-001234)"
                    className="w-full bg-gray-700 border border-gray-600 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                  <p className="text-xs text-gray-400 mt-2">
                    Find your request ID in the dashboard or email confirmation
                  </p>
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <DollarSign className="inline w-4 h-4 mr-2" />
                    Amount (₹) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg">
                      ₹
                    </span>
                    <input
                      type="number"
                      name="amount"
                      value={formData.amount}
                      onChange={handleChange}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      className="w-full bg-gray-700 border border-gray-600 text-white px-4 py-3 pl-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                {/* Payment Method */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    <CreditCard className="inline w-4 h-4 mr-2" />
                    Payment Method
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {paymentMethods.map((method) => (
                      <label
                        key={method.id}
                        className={`flex flex-col items-center justify-center p-4 border rounded-xl cursor-pointer transition-all ${
                          formData.paymentMethod === method.id
                            ? 'border-green-500 bg-green-900/20'
                            : 'border-gray-600 bg-gray-800/50 hover:border-gray-500'
                        }`}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={method.id}
                          checked={formData.paymentMethod === method.id}
                          onChange={handleChange}
                          className="hidden"
                        />
                        <div className="text-xl mb-2">{method.icon}</div>
                        <span className="text-sm text-center">{method.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Security Notice */}
                <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-blue-300">Secure Payment</p>
                      <p className="text-sm text-blue-200/70">
                        Your payment information is encrypted and processed securely. We never store your card details.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading || processing}
                  className="w-full group flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-blue-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-green-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processing ? (
                    <span className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Processing Payment...
                    </span>
                  ) : loading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Initiating Payment...
                    </span>
                  ) : (
                    <>
                      Pay ₹{formData.amount || "0.00"}
                      <CheckCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Recent Payments */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Receipt className="w-6 h-6 text-blue-400" />
                  <h3 className="text-xl font-bold text-white">Recent Payments</h3>
                </div>
                <button
                  onClick={() => navigate("/payments/history")}
                  className="text-sm text-blue-400 hover:text-blue-300"
                >
                  View All
                </button>
              </div>

              <div className="space-y-3">
                {recentPayments.map((payment, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-800/50 rounded-xl hover:bg-gray-800 transition-colors">
                    <div>
                      <p className="font-medium text-white">{payment.id}</p>
                      <p className="text-sm text-gray-400">{payment.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-white">{payment.amount}</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        payment.status === 'Paid' 
                          ? 'bg-green-900/30 text-green-400'
                          : 'bg-yellow-900/30 text-yellow-400'
                      }`}>
                        {payment.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Payment Tips */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700 p-6 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="w-6 h-6 text-yellow-400" />
                <h3 className="text-xl font-bold text-white">Payment Tips</h3>
              </div>
              
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300">Keep your payment receipt for future reference</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300">Payments are processed within 2-3 business days</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300">Contact support for payment-related queries</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300">Service requests are processed after payment confirmation</span>
                </li>
              </ul>
            </div>

            {/* Payment Methods Info */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700 p-6">
              <div className="flex items-center gap-3 mb-4">
                <CreditCard className="w-6 h-6 text-blue-400" />
                <h3 className="text-xl font-bold text-white">Accepted Methods</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-900/30 rounded-lg">
                      <CreditCard className="w-5 h-5 text-blue-400" />
                    </div>
                    <span className="font-medium">Cards</span>
                  </div>
                  <span className="text-green-400 text-sm">Visa, Mastercard, RuPay</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-900/30 rounded-lg">
                      <span className="text-xl">💳</span>
                    </div>
                    <span className="font-medium">UPI</span>
                  </div>
                  <span className="text-green-400 text-sm">All UPI Apps</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-900/30 rounded-lg">
                      <span className="text-xl">🏦</span>
                    </div>
                    <span className="font-medium">Net Banking</span>
                  </div>
                  <span className="text-green-400 text-sm">100+ Banks</span>
                </div>
              </div>

              {/* Support */}
              <div className="mt-6 pt-6 border-t border-gray-700">
                <p className="text-gray-400 text-sm mb-2">Need help with payment?</p>
                <button className="w-full py-2 bg-gray-800 hover:bg-gray-700 rounded-xl text-sm transition-colors">
                  Contact Payment Support
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-4 text-center border border-gray-700">
                <div className="text-2xl font-bold text-white">2.4M</div>
                <div className="text-xs text-gray-400">Transactions</div>
              </div>
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-4 text-center border border-gray-700">
                <div className="text-2xl font-bold text-white">99.9%</div>
                <div className="text-xs text-gray-400">Success Rate</div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}