import React from 'react'
import { useNavigate } from 'react-router-dom'
import { assets } from '../assets/assets'

const Navbar = ({ setSidebarOpen, setIsAuthenticated }) => {
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    
    if (setIsAuthenticated) {
      setIsAuthenticated(false)
    }
    
    navigate('/admin/login')
  }

  return (
    <header className="bg-white shadow-sm z-10 w-full">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center">
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="ml-4">
            <img src={assets.logo} alt="Logo" className="h-8" />
          </div>
        </div>

        <div>
          <button
            onClick={handleLogout}
            className="bg-[#A67B5B] text-white px-4 py-2 rounded-lg hover:bg-[#8B6B4F] transition-colors"
          >
            Déconnexion
          </button>
        </div>
      </div>
    </header>
  )
}

export default Navbar