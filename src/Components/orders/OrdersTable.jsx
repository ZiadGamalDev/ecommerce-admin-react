import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Eye, X } from "lucide-react";
import axios from "axios";
import { useAuth } from "../../Context/Auth.context";
const OrdersTable = () => {
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const { token } = useAuth();

  const getAuthHeaders = () => ({
    accesstoken: `accesstoken_${token}`,
  });
  // Fetch orders data
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/order/`, {
          headers: getAuthHeaders(),
        });
        // console.log("API Response:", response.data); // Debug log

        // Check if response.data is an array
        const ordersData = Array.isArray(response.data)
          ? response.data
          : // If it's an object with a data/orders property, use that
            response.data.data ||
            response.data.orders ||
            // If it's a single order object, wrap it in an array
            (response.data._id ? [response.data] : []);

        // console.log("Processed Orders:", ordersData); // Debug log

        setOrders(ordersData);
        setFilteredOrders(ordersData);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError("Failed to fetch orders: " + (err.message || "Unknown error"));
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Handle search functionality
  useEffect(() => {
    if (orders.length > 0) {
      const filtered = orders.filter((order) => {
        // Safely access properties that might be undefined
        const orderId = (order._id || order.id || "").toString().toLowerCase();
        const customerName = (order.customer || order.customerName || "")
          .toString()
          .toLowerCase();

        return (
          orderId.includes(searchTerm.toLowerCase()) ||
          customerName.includes(searchTerm.toLowerCase())
        );
      });

      setFilteredOrders(filtered);
    }
  }, [searchTerm, orders]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // View order details
  const handleViewOrder = async (orderId) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/order/${orderId}`,
        {
          headers: getAuthHeaders(),
        }
      );
      console.log("Order Details:", response.data); // Debug log
      setSelectedOrder(response.data);
      setShowModal(true);
    } catch (err) {
      console.error("Error fetching order details:", err);
      alert(
        "Could not fetch order details: " + (err.message || "Unknown error")
      );
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedOrder(null);
  };

  // Get status color based on order status
  const getStatusColor = (status) => {
    switch ((status || "").toLowerCase()) {
      case "delivered":
        return "bg-green-100 text-green-800";
      case "processing":
        return "bg-yellow-100 text-yellow-800";
      case "shipped":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Format date safely
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (e) {
      return dateString;
    }
  };

  return (
    <motion.div
      className="bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-100">Order List</h2>
        <div className="relative">
          <input
            type="text"
            placeholder="Search orders..."
            className="bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={handleSearch}
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-gray-300">Loading orders...</p>
        </div>
      ) : error ? (
        <div className="bg-red-900 bg-opacity-30 text-red-200 p-4 rounded-lg text-center">
          {error}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-700">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order, index) => (
                  <motion.tr
                    key={order._id || order.id || index}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100">
                      {order._id || order.id || `Order-${index}`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100">
                      {order.userId.email || order.customerName || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100">
                      $
                      {typeof order.totalPrice === "number"
                        ? order.totalPrice.toFixed(2)
                        : typeof order.total === "number"
                        ? order.total.toFixed(2)
                        : "0.00"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                          order.orderStatus || order.status
                        )}`}
                      >
                        {order.orderStatus || order.status || "Unknown"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {formatDate(order.createdAt || order.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      <button
                        className="text-indigo-400 hover:text-indigo-300 mr-2"
                        onClick={() => handleViewOrder(order._id || order.id)}
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-8 text-center text-gray-400"
                  >
                    No orders found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Order Details Modal */}
      {/* Order Details Modal */}
      <AnimatePresence>
        {showModal && selectedOrder && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-gray-800 rounded-xl max-w-2xl w-full max-h-screen overflow-y-auto"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="flex justify-between items-center border-b border-gray-700 p-6">
                <h3 className="text-xl font-semibold text-gray-100">
                  Order Details: {selectedOrder._id}
                </h3>
              </div>

              <div className="p-6 space-y-6">
                {/* Customer Information */}
                <div className="space-y-2">
                  <h4 className="text-lg font-medium text-blue-400">
                    Customer Information
                  </h4>
                  <div className="bg-gray-700 bg-opacity-50 rounded-lg p-4">
                    <p className="text-gray-300">
                      <span className="text-gray-400">Customer Email:</span>{" "}
                      {selectedOrder.userId?.email || "N/A"}
                    </p>
                    <p className="text-gray-300">
                      <span className="text-gray-400">Payment Method:</span>{" "}
                      {selectedOrder.paymentMethod || "N/A"}
                    </p>
                    {selectedOrder.phoneNumbers &&
                      selectedOrder.phoneNumbers.length > 0 && (
                        <div>
                          <span className="text-gray-400">Phone Numbers:</span>{" "}
                          {selectedOrder.phoneNumbers.map((phone, index) => (
                            <p key={index} className="text-gray-300 ml-2">
                              • {phone || "N/A"}
                            </p>
                          ))}
                        </div>
                      )}
                  </div>
                </div>

                {/* Shipping Information */}
                {selectedOrder.shippingAddress && (
                  <div className="space-y-2">
                    <h4 className="text-lg font-medium text-blue-400">
                      Shipping Information
                    </h4>
                    <div className="bg-gray-700 bg-opacity-50 rounded-lg p-4">
                      <p className="text-gray-300">
                        <span className="text-gray-400">Address:</span>{" "}
                        {selectedOrder.shippingAddress.address || "N/A"}
                      </p>
                      <p className="text-gray-300">
                        <span className="text-gray-400">City:</span>{" "}
                        {selectedOrder.shippingAddress.city || "N/A"}
                      </p>
                      <p className="text-gray-300">
                        <span className="text-gray-400">Postal Code:</span>{" "}
                        {selectedOrder.shippingAddress.postalCode || "N/A"}
                      </p>
                      <p className="text-gray-300">
                        <span className="text-gray-400">Country:</span>{" "}
                        {selectedOrder.shippingAddress.country || "N/A"}
                      </p>
                    </div>
                  </div>
                )}

                {/* Order Items */}
                {selectedOrder.orderItems &&
                  selectedOrder.orderItems.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-lg font-medium text-blue-400">
                        Order Items
                      </h4>
                      <div className="bg-gray-700 bg-opacity-50 rounded-lg p-4">
                        <ul className="divide-y divide-gray-600">
                          {selectedOrder.orderItems.map((item, index) => (
                            <li
                              key={index}
                              className="py-3 flex justify-between"
                            >
                              <div>
                                <p className="text-gray-200 font-medium">
                                  {item.name || `Item #${index + 1}`}
                                </p>
                                <p className="text-gray-400 text-sm">
                                  Qty: {item.quantity || 1}
                                </p>
                              </div>
                              <p className="text-gray-200">
                                ${item.price ? item.price.toFixed(2) : "N/A"}
                              </p>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                {/* Payment Information */}
                <div className="space-y-2">
                  <h4 className="text-lg font-medium text-blue-400">
                    Payment Information
                  </h4>
                  <div className="bg-gray-700 bg-opacity-50 rounded-lg p-4">
                    <div className="flex justify-between">
                      <p className="text-gray-300">Shipping:</p>
                      <p className="text-gray-200">
                        ${selectedOrder.shippingPrice?.toFixed(2) || "0.00"}
                      </p>
                    </div>
                    {selectedOrder.coupon && (
                      <div className="flex justify-between">
                        <p className="text-gray-300">Coupon:</p>
                        <p className="text-green-400">{selectedOrder.coupon}</p>
                      </div>
                    )}
                    <div className="flex justify-between border-t border-gray-600 mt-2 pt-2">
                      <p className="text-gray-200 font-medium">Total:</p>
                      <p className="text-white font-bold">
                        ${selectedOrder.totalPrice?.toFixed(2) || "0.00"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Order Status */}
                <div className="space-y-2">
                  <h4 className="text-lg font-medium text-blue-400">
                    Order Status
                  </h4>
                  <div className="bg-gray-700 bg-opacity-50 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-2 py-1 text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                          selectedOrder.orderStatus
                        )}`}
                      >
                        {selectedOrder.orderStatus || "Pending"}
                      </span>
                      <span className="text-gray-400">•</span>
                      <span className="text-gray-300">
                        Created:{" "}
                        {new Date(selectedOrder.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <div className="mt-2">
                      <p className="text-gray-300">
                        <span className="text-gray-400">Payment Status:</span>{" "}
                        {selectedOrder.isPaid ? "Paid" : "Not Paid"}
                      </p>
                      {selectedOrder.isPaid && selectedOrder.paidAt && (
                        <p className="text-gray-300">
                          <span className="text-gray-400">Paid At:</span>{" "}
                          {new Date(selectedOrder.paidAt).toLocaleString()}
                        </p>
                      )}
                      <p className="text-gray-300">
                        <span className="text-gray-400">Delivery Status:</span>{" "}
                        {selectedOrder.isDelivered
                          ? "Delivered"
                          : "Not Delivered"}
                      </p>
                      {selectedOrder.isDelivered &&
                        selectedOrder.deliveredAt && (
                          <p className="text-gray-300">
                            <span className="text-gray-400">Delivered At:</span>{" "}
                            {new Date(
                              selectedOrder.deliveredAt
                            ).toLocaleString()}
                          </p>
                        )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 flex justify-end border-t border-gray-700">
                <button
                  onClick={closeModal}
                  className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-lg"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default OrdersTable;
