import React, { useState } from "react";
import {
  BarChart2,
  PackagePlus,
  Menu,
  Settings,
  ShoppingBag,
  ShoppingCart,
  TrendingUp,
  Users,

  Sparkles,

  LogIn,
  LogOut,

} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../Context/Auth.context";

// Items accessible to all users
const PUBLIC_ITEMS = [
  {
    name: "Log In",
    icon: LogIn,
    color: "#6366f1",
    href: "/login",
  },
  {
    name: "Overview",
    icon: BarChart2,
    color: "#6366f1",
    href: "/",
  },

  { name: "Users", icon: Users, color: "#EC4899", href: "/users" },

];

// Items accessible only to authenticated users (excluding logout)
const PROTECTED_ITEMS = [

  {
    name: "Products",
    icon: ShoppingBag,
    color: "#8B5CF6",
    href: "/products",
  },
  { name: "Category", icon: PackagePlus, color: "#10B981", href: "/category" },
  { name: "Brands", icon: Sparkles, color: "#FED766", href: "/brands" },
  { name: "Orders", icon: ShoppingCart, color: "#F59E0B", href: "/orders" },
  { name: "Analytics", icon: TrendingUp, color: "#3B82F6", href: "/analytics" },
  { name: "Settings", icon: Settings, color: "#6EE7B7", href: "/settings" },
];

const Sidebar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { token, logout } = useAuth(); // Get token and logout function from auth context
  const navigate = useNavigate();

  // Handle logout click
  const handleLogout = (e) => {
    e.preventDefault();
    logout();
    navigate("/login");
  };

  // Determine which items to display based on authentication status
  const sidebarItems = token
    ? [
        ...PUBLIC_ITEMS.filter((item) => item.name !== "Log In"),
        ...PROTECTED_ITEMS,
      ]
    : PUBLIC_ITEMS;

  return (
    <motion.div
      className={`relative z-10 transition-all duration-300 ease-in-out flex-shrink-0 ${
        isSidebarOpen ? "w-64" : "w-20"
      } `}
      animate={{ width: isSidebarOpen ? 256 : 80 }}
    >
      <div className="h-full bg-gray-800 bg-opacity-50 backdrop-blur-md p-4 flex flex-col border-r border-gray-700">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 rounded-full hover:bg-gray-700 transition-colors max-w-fit"
        >
          <Menu size={24} />
        </motion.button>
        <nav className="mt-8 flex-grow">
          {/* Regular nav items with Link component */}
          {sidebarItems.map((item) => (
            <Link key={item.href} to={item.href}>
              <motion.div className="flex items-center p-4 text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors">
                <item.icon
                  size={20}
                  style={{ color: item.color, minWidth: "20px" }}
                />
                <AnimatePresence>
                  {isSidebarOpen && (
                    <motion.span
                      className="ml-4 whitespace-nowrap"
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2, delay: 0.3 }}
                    >
                      {item.name}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
            </Link>
          ))}

          {/* Logout button only shown when authenticated */}
          {token && (
            <div
              onClick={handleLogout}
              className="flex items-center p-4 text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors cursor-pointer"
            >
              <LogOut
                size={20}
                style={{ color: "#EF4444", minWidth: "20px" }}
              />
              <AnimatePresence>
                {isSidebarOpen && (
                  <motion.span
                    className="ml-4 whitespace-nowrap"
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.2, delay: 0.3 }}
                  >
                    Log Out
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          )}
        </nav>
      </div>
    </motion.div>
  );
};

export default Sidebar;
