import React from 'react'
import { Header } from '../Components/common/Header'
import AddCategoryForm from '../Components/category/AddCategoryForm'
import CategoryTable from '../Components/category/CategoryTable'

const CategoryPage = () => {
  return (
     <div className='flex-1 overflow-auto relative z-10'>
          <Header title="Category"/>
          <main className='max-w-7xl mx-auto py-6 px-4  lg:px-8'>
            <AddCategoryForm />
            <CategoryTable />
            </main>
    
          
        </div>
  )
}

export default CategoryPage