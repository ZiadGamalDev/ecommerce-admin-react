// src/Pages/LoginPage.jsx
import React from "react";
import { motion } from "framer-motion";
import LogIn from "../Components/authuntication/login";

const LoginPage = () => {
  return (
    <div className="flex-1 flex items-center justify-center overflow-auto relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        <LogIn />
      </motion.div>
    </div>
  );
};

export default LoginPage;