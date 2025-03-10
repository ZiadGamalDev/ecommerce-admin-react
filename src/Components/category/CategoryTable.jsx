import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { motion } from 'framer-motion'
import { Search , Edit , Trash2 , Eye } from 'lucide-react'
import { Hourglass } from 'react-loader-spinner'


const CategoryTable = () => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredCategories, setFilteredCategories] = useState([])
  useEffect(()=>{
    const fetchCategories = async ()=>{
      try {
        const response = await axios.get("http://localhost:3000/category/")
        setCategories(response.data.data)
        setFilteredCategories(response.data.data)
        setLoading(false)
        console.log(response.data);
        

      } catch (error) {
        setError( " Failed to Fetch Categories",error)
        setLoading(false)
        console.error("Error Fetching Categories",error)
        
      }
    }
    fetchCategories()
  },[])

  const handleSearch = (e)=>{
    const term = e.target.value
    setSearchTerm(term)

 const filtered = categories.filter(category => category.name.toLowerCase().includes(term.toLowerCase()))
  setFilteredCategories(filtered)
    
  }
  if(loading){
    return (<Hourglass
      visible={true}
      height="80"
      width="80"
      ariaLabel="hourglass-loading"
      wrapperStyle={{}}
      wrapperClass=""
      colors={['#306cce', '#72a1ed']}
      />)
    
  }
  if(error){
    return <div className=' text-red-500'>Error: {error}</div>
  }
  return (
    <motion.div
    initial={{ opacity: 0, y:20 }}
    animate={{ opacity: 1 , y:0}}
    transition={{
      delay: 0.2, 
      duration: 0.5, 
      ease: "easeOut", 
    }}
    className='bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700 mb-8 mt-4'
    >
    <div className='flex justify-between items-center mb-6'>
      <h2 className='text-xl font-semibold text-gray-100'>Category List</h2>
      <div className='relative'>
        <input type="text"
        className='bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
        placeholder='Search Category...'
        onChange={handleSearch}
        value={searchTerm} />
        <Search className='absolute top-2.5 left-3 text-gray-400 ' size={18}/>
      </div>

    </div>
    <div className='overflow-x-auto'>
  <table className='min-w-full divide-y divide-gray-700'>
    <thead>
      <tr>
        <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>Name</th>
        <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>Brand</th>
        <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>Status</th>
        <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>Actions</th>
      </tr>
    </thead>
    <tbody className='divide-y divide-gray-700'>
    {
      filteredCategories.length > 0 ? (
        filteredCategories.map((category)=>(
          <motion.tr
          key={category._id}
          initial={{ opacity: 0, y:20 }}
          animate={{ opacity: 1 , y:0}}
          transition={{ delay: 0.2 }}
          >
            <td
            className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100 flex gap-2 items-center'
            >
            
                <img src={category.image.secure_url} alt='' className='size-10 rounded-full' />
              {category.name}
             
            </td>
            <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-300'>
              { category.brands.map((brand)=>{
                return (
                  <span key={brand._id} className='mr-2'>{brand.name}</span>
                )
              })}
            </td>
            <td className='px-6 py-4 whitespace-nowrap text-sm '>
                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                  ${category.isActive == true? 'bg-green-800 text-green-200':'bg-red-700 text-red-200'}`}>
                    { category.isActive  == true? 'Active':'Inactive'}
                    </span>
            </td>
            <td className='px-6 py-4 whitespace-nowrap text-sm'>
              <button className='text-indigo-400 hover:text-indigo-300 mr-2'>
                <Edit size={18}/>
              </button>
              <button className='text-red-400 hover:text-red-300'>
                <Trash2 size={18}/>
              </button>
            </td>
           
            
          </motion.tr>
        ))
      ) : (
        <motion.tr
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <td colSpan="6" className='px-6 py-4 text-center text-sm text-gray-300'>
                  No categories found
                </td>
              </motion.tr>
      )
    }
    </tbody>
  </table>
    </div>
    </motion.div>
  )
}

export default CategoryTable