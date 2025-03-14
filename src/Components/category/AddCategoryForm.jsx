import React, { useState } from "react";
import axios from "axios";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { motion } from 'framer-motion'
import * as Yup from "yup";
import {useAuth} from "../../Context/Auth.context";

const AddCategoryForm = ({success , imagePreview , token , error , initialValues , validationSchema , handleSubmit , handleImageChange , setImagePreview , setError , setSuccess}) => {
 
  
  // if (Loading) {
  //   return (
  //     <motion.div
  //       className="bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700 mb-8 flex justify-center items-center h-64"
  //       initial={{ opacity: 0 }}
  //       animate={{ opacity: 1 }}
  //     >
  //       <div className="text-gray-300">Loading Form...</div>
  //     </motion.div>
  //   );
  // }
  return (
    <motion.div className="max-w-full mx-auto bg-gray-800 bg-opacity-50 backdrop-blur-md overflow-hidden shadow-lg rounded-xl p-6 border border-gray-700"
    initial={{ opacity: 0, y:20 }}
    animate={{ opacity: 1 , y:0}}
    transition={{
      delay: 0.2, 
      duration: 0.6,
      ease: "easeOut", 
    }}>
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
              {touched.image && !imagePreview && (
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
