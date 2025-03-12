import React, { useState } from "react";
import { useFormik } from "formik";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import * as Yup from "yup";
import { useAuth } from "../../Context/Auth.context";

export default function LogIn() {
  const [apiError, setApiError] = useState(null);
  const { login } = useAuth();
  let navigate = useNavigate();

  const initialValues = {
    email: "",
    password: "",
  };

  const validationSchema = Yup.object().shape({
    email: Yup.string().email("Invalid email").required("Email is required"),
    password: Yup.string()
      .min(4, "Password must be at least 4 characters")
      .required("Password is required"),
  });

  async function checkUserRoleAndLogin(values) {
    try {
      setApiError(null);
      
      // First, check if user exists and get their role
      const userResponse = await axios.get(
        `http://localhost:3000/profile/${values.email}`
      );
      
      const userData = userResponse.data.data;
      
      // Check if user is admin
      if (userData.role !== 'admin') {
        setApiError("Access denied. Only administrators can login.");
        return;
      }
      
      // If user is admin, proceed with login
      let { data } = await axios.post(
        `http://localhost:3000/auth/login`,
        values
      );

      console.log(data);
      if (data.data.token) {
        login(data.data.token);
        navigate("/");
      } else {
        setApiError("Login failed - No token received");
      }
    } catch (error) {
      if (error.response?.status === 404) {
        setApiError("User not found");
      } else {
        setApiError(error.response?.data?.error_message || "An error occurred");
      }
    }
  }

  const loginForm = useFormik({
    initialValues,
    validationSchema,
    onSubmit: checkUserRoleAndLogin,
  });

  return (
    <div
      style={{ width: "600px", maxWidth: "90%" }}
      className="mx-auto p-8 rounded-lg shadow-md"
    >
      <h2 className="text-2xl font-bold mb-6 text-center">Admin Login</h2>

      {apiError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-center">
          {apiError}
        </div>
      )}

      <form onSubmit={loginForm.handleSubmit}>
        {[
          { label: "Email", name: "email", type: "email" },
          { label: "Password", name: "password", type: "password" },
        ].map((field) => (
          <div className="mb-4" key={field.name}>
            <label
              htmlFor={field.name}
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              {field.label}
            </label>
            <input
              type={field.type}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              id={field.name}
              placeholder={`Enter your ${field.label.toLowerCase()}`}
              name={field.name}
              value={loginForm.values[field.name]}
              onChange={loginForm.handleChange}
              onBlur={loginForm.handleBlur}
            />
            {loginForm.errors[field.name] && loginForm.touched[field.name] && (
              <div className="text-red-500 text-xs mt-1">
                {loginForm.errors[field.name]}
              </div>
            )}
          </div>
        ))}

        <button
          className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-2 px-4 rounded-md transition-colors duration-300 mt-6"
          type="submit"
        >
          Login
        </button>
      </form>
    </div>
  );
}