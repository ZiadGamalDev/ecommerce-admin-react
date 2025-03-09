import React from 'react'
import { Header } from '../Components/common/Header'
import { UserCheck, UserPlus, UsersIcon, UserX } from "lucide-react";
import { motion } from 'framer-motion'
import { StatCard } from '../Components/common/StatCard'
const userStats = {
	totalUsers: 152845,
	newUsersToday: 243,
	activeUsers: 98520,
	churnRate: "2.4%",
};

const UsersPage = () => {
  return (
    <div className='flex-1 overflow-auto relative z-10'>
         <Header title="Users"/>
         <main className='max-w-7xl mx-auto py-6 px-4  lg:px-8'>
        {/* STATS */}
        <motion.div
        className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8 '
        initial={{ opacity: 0 , y:20}}
        animate={{ opacity: 1, y:0 }}
        transition={{ duration: 1 }}
        >
        <StatCard 
        name="Total Users" icon={UsersIcon} value={userStats.totalUsers} color="#6366F1"
        />
        <StatCard name='New Users Today' icon={UserPlus} value={userStats.newUsersToday} color='#8B5CF6' />
					<StatCard name='activeUsers' icon={UserCheck} value={userStats.activeUsers} color='#EC4899' />
					<StatCard name='churnRate' icon={UserX} value={userStats.churnRate} color='#10B981' />
        </motion.div>
        </main>
         
       </div>
  )
}

export default UsersPage