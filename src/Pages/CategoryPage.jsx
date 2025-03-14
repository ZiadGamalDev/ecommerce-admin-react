import React, { useEffect, useState } from 'react'
import { Header } from '../Components/common/Header'
import AddCategoryForm from '../Components/category/AddCategoryForm'
import CategoryTable from '../Components/category/CategoryTable'
import axios from 'axios'
import { useAuth } from '../Context/Auth.context'
import * as Yup from "yup";

const CategoryPage = () => {
  const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [filteredCategories, setFilteredCategories] = useState([])
    const [success, setSuccess] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const {token}=useAuth()
    // console.log(token);
    useEffect(()=>{
      const fetchCategories = async ()=>{
        try {
          const response = await axios.get("https://e-commerce-api-tau-five.vercel.app/category/")
          setCategories(response.data.data)
          setFilteredCategories(response.data.data)
          setLoading(false)
          // console.log(response.data);
          
  
        } catch (error) {
          setError( " Failed to Fetch Categories",error)
          setLoading(false)
          console.error("Error Fetching Categories",error)
          
        }
      }
      fetchCategories()
      console.log(categories);
      
    },[])
  
    const handleSearch = (e)=>{
      const term = e.target.value

      setSearchTerm(term)
      console.log(term);
      console.log(filteredCategories);
  
   const filtered = categories.filter(category => category.name.toLowerCase().includes(term.toLowerCase()))
    setFilteredCategories(filtered)
    console.log(filteredCategories);
    console.log(term);
    
      
    }
    // AddCategoryForm component is rendered here
   

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
        "https://e-commerce-api-tau-five.vercel.app/category/",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            accesstoken: `accesstoken_${token}`,
          },
        }

      );
      setSuccess(response.data.message);
      console.log(response.data.data);
      
      setCategories((prevCategories) => [...prevCategories, response.data.data]);
      setFilteredCategories([...categories, response.data.data])
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
     <div className='flex-1 overflow-auto relative z-10'>
          <Header title="Category"/>
          <main className='max-w-7xl mx-auto py-6 px-4  lg:px-8'>
            <AddCategoryForm success={success} imagePreview={imagePreview} token={token} error={error} initialValues={initialValues} handleSubmit={handleSubmit} handleImageChange={handleImageChange} setImagePreview={setImagePreview} setError={setError} setSuccess={setSuccess} />
            {/* passing stats to child components */}
            <CategoryTable categories={categories} filteredCategories={filteredCategories} searchTerm={searchTerm} handleSearch={handleSearch} />
            </main>
    
          
        </div>
  )
}
// success , imagePreview , token , error , initialValues , validationSchema , handleSubmit , handleImageChange , setImagePreview , setError , setSuccess
export default CategoryPage