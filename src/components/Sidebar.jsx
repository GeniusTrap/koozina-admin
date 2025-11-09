import React from 'react'
import { NavLink } from 'react-router-dom'

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const menuItems = [
    { path: '/devis', label: 'Devis', icon: '📋' },
    { path: '/contact', label: 'Contact', icon: '✉️' },
    { path: '/realisations', label: 'Réalisations', icon: '🖼️' },
  ]

  return (
    <>

      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-50 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className={`
  fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out flex-shrink-0
  ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static md:inset-0
`}>
        <div className="flex items-center justify-center h-16 bg-[#EADFC8]">
          <h1 className="text-xl font-bold text-gray-800">Admin Panel</h1>
        </div>
        
        <nav className="mt-8">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100 transition-colors ${
                  isActive ? 'bg-gray-100 border-r-4 border-[#A67B5B]' : ''
                }`
              }
            >
              <span className="mr-3 text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </>
  )
}

export default Sidebar