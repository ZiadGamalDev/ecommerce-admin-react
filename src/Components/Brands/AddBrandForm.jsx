import React, { useState, useEffect } from "react";
import axios from "axios";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { motion } from 'framer-motion';
import * as Yup from "yup";
import { useAuth } from "../../Context/Auth.context";
import { useParams } from "react-router-dom";

const AddBrandForm = () => {
  const [Loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const { token } = useAuth();

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get("http://localhost:3000/category/");
        setCategories(response.data.data);
      } catch (error) {
        console.error("Error fetching categories", error);
      }
    };

    fetchCategories();
  }, []);

  // define validation schema
  const validationSchema = Yup.object({
    name: Yup.string()
      .required("Brand name is required")
      .min(3, "Brand name must be at least 3 characters")
      .max(50, "Brand name must be at most 50 characters"),
    description: Yup.string().max(
      500,
      "Brand description must not exceed 500 characters"
    ),
    // isActive: Yup.boolean(),
  });

  const initialValues = {
    name: "",
    description: "",
    // isActive: true,
    logo: null,
  };

  const handleImageChange = (event, setFieldValue) => {
    const file = event.currentTarget.files[0];
    setFieldValue("logo", file);
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImagePreview(null);
    }
  };

  const handleSubmit = async (values, { resetForm }) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      const formData = new FormData();
      formData.append("name", values.name);
      if (values.description)
        formData.append("description", values.description);
    //   formData.append("isActive", values.isActive);
      if (values.logo) formData.append("image", values.logo);
      

      const response = await axios.post(
        `http://localhost:3000/brand/${selectedCategoryId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            accesstoken: `accesstoken_${token}`,
          },
        }
      );
      setSuccess(response.data.message);
      resetForm();
      setImagePreview(null);
    } catch (error) {
      console.error("Error while creating brand", error);
      setError(error.response.data.error_message);
    } finally {
      setLoading(false);
    }
  };

  if (Loading) {
    return (
      <motion.div
        className="bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700 mb-8 flex justify-center items-center h-64"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="text-gray-300">Loading Form...</div>
      </motion.div>
    );
  }

  return (
    <motion.div
  className="max-w-full mx-auto bg-gray-800 bg-opacity-50 backdrop-blur-md overflow-hidden shadow-lg rounded-xl p-6 border border-gray-700"
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{
    delay: 0.2,
    duration: 0.6,
    ease: "easeOut",
  }}
>
  <h2 className="text-2xl font-bold mb-6">Add New Brand</h2>
  {error && (
    <div className="bg-red-100 text-red-700 p-2 mb-4 rounded">{error}</div>
  )}
  {success && (
    <div className="bg-green-100 text-green-700 p-2 mb-4 rounded">
      {success}
    </div>
  )}
  <Formik
    initialValues={initialValues}
    validationSchema={validationSchema}
    onSubmit={handleSubmit}
  >
    {({ setFieldValue, resetForm, isSubmitting, errors, touched }) => (
      <Form>
        <div className="mb-4">
          <label htmlFor="category" className="block mb-2">
            Category*
          </label>
          <select
            id="category"
            name="category"
            value={selectedCategoryId}
            onChange={(e) => setSelectedCategoryId(e.target.value)}
            className="block w-full px-3 py-2 border bg-gray-800 border-gray-300 rounded-md"
            required
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label htmlFor="name" className="block mb-2">
            Brand Name*
          </label>
          <Field
            id="name"
            name="name"
            type="text"
            className={`block w-full px-3 py-2 border border-gray-300 rounded-md ${
              errors.name && touched.name ? "border-red-500" : ""
            }`}
          />
          <ErrorMessage
            name="name"
            component="p"
            className="text-red-500 mt-1 text-sm"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="description" className="block mb-2">
            Description
          </label>
          <Field
            id="description"
            name="description"
            as="textarea"
            className={`block w-full px-3 py-2 border border-gray-300 rounded-md `}
            row="3"
          />
          <ErrorMessage
            name="description"
            component="p"
            className="text-red-500 mt-1 text-sm"
          />
        </div>
        <div className="mb-4">
          <label className="block mb-2" htmlFor="image">
            Logo*
          </label>
          <input
            id="logo"
            name="logo"
            type="file"
            accept="image/*"
            onChange={(event) => handleImageChange(event, setFieldValue)}
            className={`w-full cursor-pointer ${
              errors.logo && touched.logo ? "border-red-500" : ""
            }`}
          />
          {touched.logo && !imagePreview && (
            <p className="mt-1 text-sm text-red-500">image is required</p>
          )}
          {imagePreview && (
            <div>
              <img
                src={imagePreview}
                alt="preview"
                className="w-32 h-32 object-cover rounded"
              />
            </div>
          )}
        </div>
        {/* <div className="mb-4">
          <label className=" block mb-2">Status</label>
          <div className="flex items-center">
            <Field
              id="isActive"
              name="isActive"
              type="checkbox"
              className="h-4 w-4 text-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isActive" className="ml-2">
              Active
            </label>
          </div>
        </div> */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => {
              resetForm();
              setImagePreview(null);
              setError(null);
              setSuccess(null);
            }}
            className="cursor-pointer bg-red-500 text-white px-4 py-2 rounded-md mr-2 hover:bg-red-600 "
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="cursor-pointer bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Add Brand"}
          </button>
        </div>
      </Form>
    )}
  </Formik>
</motion.div>
  );
};

export default AddBrandForm;