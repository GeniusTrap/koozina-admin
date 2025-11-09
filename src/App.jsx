import React, { useState, useEffect } from 'react' 
import { Routes, Route } from 'react-router-dom'
import Login from './components/Login'
import DevisAdmin from './pages/DevisAdmin'
import ContactAdmin from './pages/ContactAdmin'
import RealisationsAdmin from './pages/RealisationsAdmin'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'

export const backendUrl = import.meta.env.VITE_BACKEND_URL

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    setIsAuthenticated(!!token)
  }, [])


  if (!isAuthenticated) {
    return <Login setIsAuthenticated={setIsAuthenticated} />
  }

  return (
    <div className="h-screen flex flex-col">
      <Navbar setSidebarOpen={setSidebarOpen} setIsAuthenticated={setIsAuthenticated} />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 bg-gray-100">
          <Routes>
            <Route path='/devis' element={<DevisAdmin />} />
            <Route path='/contact' element={<ContactAdmin />} />
            <Route path='/realisations' element={<RealisationsAdmin />} />
            <Route path='/' element={<DevisAdmin />} />
            <Route path='*' element={<DevisAdmin />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

export default App