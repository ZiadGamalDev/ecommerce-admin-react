import React, { useState } from "react";
import axios from "axios";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { motion } from 'framer-motion'
// import ResponsiveContainer from "recharts"
import * as Yup from "yup";

const AddCategoryForm = () => {
  const [Loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // define validation schema
  const validationSchema = Yup.object({
    name: Yup.string()
      .required("category name is required")
      .min(3, "category name must be at least 3 characters")
      .max(50, "category name must be at most 50 characters"),
    description: Yup.string().max(
      500,
      "category description must not exceed 500 characters"
    ),
    isActive: Yup.boolean(),
  });
  const initialValues = {
    name: "",
    description: "",
    isActive: true,
    image: null,
  };
  const handleImageChange = (event, setFieldValue) => {
    const file = event.currentTarget.files[0];
    setFieldValue("image", file);
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
      formData.append("isActive", values.isActive);
      if (values.image) formData.append("image", values.image);
      const response = await axios.post(
        "http://localhost:3000/category/",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `accesstoken_${localStorage.getItem("token")}`,
          },
        }
      );
      setSuccess(response.data.message);
      resetForm();
      setImagePreview(null);
    } catch (error) {
      console.error("Error while creating category", error);
      setError(error.response.data.error_message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <motion.div className="max-w-full mx-auto backdrop-blur-md bg-gray-800 p-6 rounded-lg shadow-md"
    initial={{ opacity: 0, y:20 }}
    animate={{ opacity: 1 , y:0}}
    transition={{ delay: 0.0001 }}>
      <h2 className="text-2xl font-bold mb-6">Add New Category</h2>
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
              <label htmlFor="name" className="block mb-2">
                Category Name*
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
                Image*
              </label>
              <input
                id="image"
                name="image"
                type="file"
                accept="image/*"
                onChange={(event) => handleImageChange(event, setFieldValue)}
                className={`w-full cursor-pointer ${
                  errors.image && touched.image ? "border-red-500" : ""
                }`}
              />
              {!touched.image && !imagePreview && (
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
            <div className="mb-4">
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
            </div>
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
                {isSubmitting ? "Submitting..." : "Add Category"}
              </button>
            </div>
          </Form>
            
        )}
      </Formik>
    </motion.div>
  );
};

export default AddCategoryForm;
