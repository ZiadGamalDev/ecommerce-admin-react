import React from 'react'
import AddBrandForm from '../Components/Brands/AddBrandForm'
import { Header } from '../Components/common/Header'

const BrandsPage = () => {
  return (
     <div className='flex-1 overflow-auto relative z-10'>
              <Header title="Brand"/>
              <main className='max-w-7xl mx-auto py-6 px-4  lg:px-8'>
                <AddBrandForm />
               
                </main>
        
              
            </div>
  )
}

export default BrandsPage