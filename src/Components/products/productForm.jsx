import { useEffect, useState } from "react";
import { Plus, X, Upload, Star } from "lucide-react";
import axios from "axios";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useAuth } from "../../Context/Auth.context";

const ProductForm = ({ product, onSubmit, onCancel }) => {
  const isEditMode = !!product;
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Use the custom hook instead of direct context
  const { token, logout } = useAuth();

  // Define validation schema with Yup
  const validationSchema = Yup.object({
    title: Yup.string()
      .required("Product title is required")
      .min(3, "Title must be at least 3 characters long")
      .max(100, "Title cannot exceed 100 characters"),
    description: Yup.string()
      .required("Product description is required")
      .min(10, "Description must be at least 10 characters long"),
    categoryId: Yup.string().required("Category is required"),
    brandId: Yup.string().required("Brand is required"),
    basePrice: Yup.number()
      .required("Base price is required")
      .positive("Base price must be a positive number"),
    stock: Yup.number()
      .required("Stock quantity is required")
      .integer("Stock must be a whole number")
      .min(0, "Stock cannot be negative"),
    discountType: Yup.string().oneOf(
      ["percentage", "fixed"],
      'Discount type must be either "percentage" or "fixed"'
    ),
    discountValue: Yup.number().when("discountType", {
      is: "percentage",
      then: (schema) =>
        schema
          .min(0, "Discount value cannot be negative")
          .max(100, "Discount percentage cannot exceed 100%"),
      otherwise: (schema) => schema.min(0, "Discount value cannot be negative"),
    }),
    images: Yup.array().min(1, "At least one product image is required"),
  });

  // Set initial form values based on backend fields
  const initialValues = {
    title: product?.title || "",
    description: product?.description || "",
    categoryId: product?.category?._id || "",
    brandId: product?.brand?._id || "",
    basePrice: product?.basePrice || "",
    stock: product?.stock || "",
    discountType: product?.discount?.type || "percentage",
    discountValue: product?.discount?.value || "0",
    images: product?.images || [],
  };

  // Common headers with authentication token
  const getAuthHeaders = () => ({
    accesstoken: `accesstoken_${token}`,
  });
  console.log(getAuthHeaders());

  // Handle unauthorized responses
  const handleUnauthorized = (error) => {
    if (error.response && error.response.status === 401) {
      setSubmitError("Your session has expired. Please log in again.");
      // Log the user out
      logout();
      // You might want to redirect to login page here
      // navigate('/login'); // If using React Router
      return true;
    }
    return false;
  };

  // Fetch categories and brands
  useEffect(() => {
    // Redirect if not authenticated
    if (!token) {
      setSubmitError("Authentication required. Please log in.");
      // navigate('/login'); // If using React Router
      return;
    }

    const fetchData = async () => {
      try {
        const [categoriesResponse, brandsResponse] = await Promise.all([
          axios.get("http://localhost:3000/category/", {
            headers: getAuthHeaders(),
          }),
          axios.get("http://localhost:3000/brand/", {
            headers: getAuthHeaders(),
          }),
        ]);
        setCategories(categoriesResponse.data.data || []);
        setBrands(brandsResponse.data.data || []);
      } catch (error) {
        console.error("Error fetching data:", error);
        if (!handleUnauthorized(error)) {
          setSubmitError(
            "Error loading categories and brands. Please refresh the page."
          );
        }
      }
    };
    fetchData();
  }, [token, logout]);

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    // Check if authenticated
    if (!token) {
      setSubmitError("Authentication required. Please log in.");
      setSubmitting(false);
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(null);

    try {
      const productData = new FormData();

      // Add all fields to FormData
      Object.keys(values).forEach((key) => {
        if (key !== "images") productData.append(key, values[key]);
      });

      // Handle images separately
      if (values.images.length > 0) {
        // For existing images from the server, add their IDs
        const existingImageIds = values.images
          .filter((img) => img._id) // Only include images with _id (from server)
          .map((img) => img._id);

        if (existingImageIds.length > 0) {
          productData.append(
            "existingImages",
            JSON.stringify(existingImageIds)
          );
        }

        // For new file uploads (those without _id), append them to the FormData
        values.images.forEach((img) => {
          if (img.file) {
            productData.append("files", img.file);
          }
        });
      }

      let response;
      if (isEditMode) {
        response = await axios.put(
          `http://localhost:3000/product/${product._id}`,
          productData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              ...getAuthHeaders(),
            },
          }
        );
      } else {
        response = await axios.post(
          `http://localhost:3000/product/${values.categoryId}/${values.brandId}`,
          productData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              ...getAuthHeaders(),
            },
          }
        );
      }

      setSubmitSuccess(
        isEditMode
          ? "Product updated successfully!"
          : "Product created successfully!"
      );

      if (onSubmit) onSubmit(response.data.data);
      if (!isEditMode) resetForm();
    } catch (error) {
      console.error("Error submitting product:", error);
      if (!handleUnauthorized(error)) {
        setSubmitError(
          error.response?.data?.message ||
            "An error occurred while saving the product. Please try again."
        );
      }
    } finally {
      setIsSubmitting(false);
      setSubmitting(false);
    }
  };

  const handleRemoveImage = (formikProps, imageId) => {
    const updatedImages = formikProps.values.images.filter(
      (img) => img._id !== imageId
    );
    formikProps.setFieldValue("images", updatedImages);
  };

  // Handle file uploads with error handling for auth
  const handleFileUpload = async (event, formikProps) => {
    if (!token) {
      setSubmitError("Authentication required. Please log in.");
      return;
    }

    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);

    try {
      const newImages = [...formikProps.values.images];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Option 1: For immediate upload to server and getting URLs back
        // const formData = new FormData();
        // formData.append('productImage', file);
        // const response = await axios.post('http://localhost:3000/product/upload-image', formData, {
        //   headers: {
        //     "Content-Type": "multipart/form-data",
        //     ...getAuthHeaders()
        //   }
        // });
        // newImages.push(response.data.image);

        // Option 2: For client-side preview without immediate upload
        const reader = new FileReader();
        reader.onload = () => {
          const newImage = {
            _id: `temp_${Date.now()}_${i}`, // Temporary ID for client-side handling
            file: file, // Store the actual file for later upload
            secure_url: reader.result, // Use the data URL for preview
            isNew: true, // Flag to identify new uploads
          };

          newImages.push(newImage);
          formikProps.setFieldValue("images", [...newImages]);
        };
        reader.readAsDataURL(file);
      }

      // If using Option 1, update form values here
      // formikProps.setFieldValue("images", newImages);
    } catch (error) {
      console.error("Error uploading images:", error);
      if (!handleUnauthorized(error)) {
        setSubmitError("Failed to upload images. Please try again.");
      }
    } finally {
      setUploading(false);
      // Clear the file input so the same file can be selected again if needed
      event.target.value = "";
    }
  };

  // If not authenticated, show a message
  if (!token) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 max-w-4xl mx-auto">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>Authentication required. Please log in to manage products.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-4xl mx-auto">
      <h2 className="text-xl font-semibold mb-6">
        {isEditMode ? "Update Product" : "Product Upload"}
      </h2>

      {/* Breadcrumbs */}
      <div className="flex items-center text-gray-500 text-sm mb-6">
        <a href="#" className="hover:text-blue-600">
          Dashboard
        </a>
        <span className="mx-2">/</span>
        <a href="#" className="hover:text-blue-600">
          Products
        </a>
        <span className="mx-2">/</span>
        <span className="text-gray-700">
          {isEditMode ? "Product Update" : "Product Upload"}
        </span>
      </div>

      {/* Submit status messages */}
      {submitError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{submitError}</p>
        </div>
      )}
      {submitSuccess && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          <p>{submitSuccess}</p>
        </div>
      )}

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {(formikProps) => (
          <Form>
            {/* Basic Information */}
            <div className="bg-white rounded-lg p-6 mb-6 border border-gray-200">
              <h3 className="text-lg font-medium mb-6">Basic Information</h3>

              <div className="mb-4">
                <label className="block text-gray-700 uppercase text-xs font-medium mb-2">
                  Product Name
                </label>
                <Field
                  type="text"
                  name="title"
                  className={`w-full px-3 py-2 border ${
                    formikProps.touched.title && formikProps.errors.title
                      ? "border-red-500"
                      : "border-gray-300"
                  } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
                <ErrorMessage
                  name="title"
                  component="p"
                  className="text-red-500 text-xs mt-1 error-message"
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 uppercase text-xs font-medium mb-2">
                  Description
                </label>
                <Field
                  as="textarea"
                  name="description"
                  rows="5"
                  className={`w-full px-3 py-2 border ${
                    formikProps.touched.description &&
                    formikProps.errors.description
                      ? "border-red-500"
                      : "border-gray-300"
                  } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
                <ErrorMessage
                  name="description"
                  component="p"
                  className="text-red-500 text-xs mt-1 error-message"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-gray-700 uppercase text-xs font-medium mb-2">
                    Category
                  </label>
                  <Field
                    as="select"
                    name="categoryId"
                    className={`w-full px-3 py-2 border ${
                      formikProps.touched.categoryId &&
                      formikProps.errors.categoryId
                        ? "border-red-500"
                        : "border-gray-300"
                    } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  >
                    <option value="">Select Category</option>
                    {categories.map((category) => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))}
                  </Field>
                  <ErrorMessage
                    name="categoryId"
                    component="p"
                    className="text-red-500 text-xs mt-1 error-message"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 uppercase text-xs font-medium mb-2">
                    Brand
                  </label>
                  <Field
                    as="select"
                    name="brandId"
                    className={`w-full px-3 py-2 border ${
                      formikProps.touched.brandId && formikProps.errors.brandId
                        ? "border-red-500"
                        : "border-gray-300"
                    } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  >
                    <option value="">Select Brand</option>
                    {brands.map((brand) => (
                      <option key={brand._id} value={brand._id}>
                        {brand.name}
                      </option>
                    ))}
                  </Field>
                  <ErrorMessage
                    name="brandId"
                    component="p"
                    className="text-red-500 text-xs mt-1 error-message"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-gray-700 uppercase text-xs font-medium mb-2">
                    Price
                  </label>
                  <Field
                    type="number"
                    name="basePrice"
                    className={`w-full px-3 py-2 border ${
                      formikProps.touched.basePrice &&
                      formikProps.errors.basePrice
                        ? "border-red-500"
                        : "border-gray-300"
                    } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                  <ErrorMessage
                    name="basePrice"
                    component="p"
                    className="text-red-500 text-xs mt-1 error-message"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 uppercase text-xs font-medium mb-2">
                    Product Stock
                  </label>
                  <Field
                    type="number"
                    name="stock"
                    className={`w-full px-3 py-2 border ${
                      formikProps.touched.stock && formikProps.errors.stock
                        ? "border-red-500"
                        : "border-gray-300"
                    } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                  <ErrorMessage
                    name="stock"
                    component="p"
                    className="text-red-500 text-xs mt-1 error-message"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 uppercase text-xs font-medium mb-2">
                    Discount Type
                  </label>
                  <Field
                    as="select"
                    name="discountType"
                    className={`w-full px-3 py-2 border ${
                      formikProps.touched.discountType &&
                      formikProps.errors.discountType
                        ? "border-red-500"
                        : "border-gray-300"
                    } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount</option>
                  </Field>
                  <ErrorMessage
                    name="discountType"
                    component="p"
                    className="text-red-500 text-xs mt-1 error-message"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 uppercase text-xs font-medium mb-2">
                    Discount Value{" "}
                    {formikProps.values.discountType === "percentage"
                      ? "(%)"
                      : ""}
                  </label>
                  <Field
                    type="number"
                    name="discountValue"
                    className={`w-full px-3 py-2 border ${
                      formikProps.touched.discountValue &&
                      formikProps.errors.discountValue
                        ? "border-red-500"
                        : "border-gray-300"
                    } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                  <ErrorMessage
                    name="discountValue"
                    component="p"
                    className="text-red-500 text-xs mt-1 error-message"
                  />
                </div>
              </div>
            </div>

            {/* Media */}
            <div className="bg-white rounded-lg p-6 mb-6 border border-gray-200">
              <h3 className="text-lg font-medium mb-6">Product Images</h3>
              <div className="flex flex-wrap gap-4 mb-2">
                {formikProps.values.images.map((image) => (
                  <div
                    key={image._id}
                    className="relative border border-gray-200 rounded-md w-24 h-24"
                  >
                    <img
                      src={image.secure_url}
                      alt="Product"
                      className="w-full h-full object-cover rounded-md"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(formikProps, image._id)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                    >
                      <X size={14} />
                    </button>
                    {image.isNew && (
                      <div className="absolute bottom-0 left-0 right-0 bg-blue-500 text-white text-xs py-1 text-center">
                        New
                      </div>
                    )}
                  </div>
                ))}
                <label
                  className={`border border-dashed ${
                    formikProps.errors.images
                      ? "border-red-500"
                      : "border-gray-300"
                  } rounded-md w-24 h-24 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50`}
                >
                  <div className="text-center">
                    <Upload
                      className={`w-8 h-8 mx-auto ${
                        formikProps.errors.images
                          ? "text-red-400"
                          : "text-gray-400"
                      }`}
                    />
                    <span
                      className={`text-xs ${
                        formikProps.errors.images
                          ? "text-red-500"
                          : "text-gray-500"
                      }`}
                    >
                      {uploading ? "Uploading..." : "Image upload"}
                    </span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(event) => handleFileUpload(event, formikProps)}
                    disabled={uploading}
                  />
                </label>
              </div>
              <ErrorMessage
                name="images"
                component="p"
                className="text-red-500 text-xs mb-4 error-message"
              />

              <div className="flex gap-4 mt-6">
                {onCancel && (
                  <button
                    type="button"
                    onClick={onCancel}
                    className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-md hover:bg-gray-300"
                  >
                    CANCEL
                  </button>
                )}
                <button
                  type="submit"
                  disabled={formikProps.isSubmitting || isSubmitting}
                  className={`flex-1 bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 flex items-center justify-center ${
                    formikProps.isSubmitting || isSubmitting
                      ? "opacity-70 cursor-not-allowed"
                      : ""
                  }`}
                >
                  {formikProps.isSubmitting || isSubmitting ? (
                    <span>Processing...</span>
                  ) : (
                    <>
                      <Upload className="mr-2" size={18} />
                      {isEditMode ? "UPDATE PRODUCT" : "PUBLISH PRODUCT"}
                    </>
                  )}
                </button>
              </div>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default ProductForm;
