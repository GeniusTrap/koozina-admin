import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { backendUrl } from '../App'  

const Login = ({ setIsAuthenticated }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')

    try {
      const response = await axios.post(
        backendUrl + '/api/realisations/admin/login',  
        { email, password }
      )

      if (response.data.success) {
        localStorage.setItem('adminToken', response.data.token)
        
        // Mettre à jour l'état d'authentification
        if (setIsAuthenticated) {
          setIsAuthenticated(true)
        }
        
        navigate('/devis')
      }
    } catch (error) {
      console.error('❌ Erreur de connexion:', error)
      setError(error.response?.data?.message || 'Erreur de connexion au serveur')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Connexion Admin
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          <div>
            <label htmlFor="email" className="sr-only">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-[#A67B5B] focus:border-[#A67B5B]"
              placeholder="Email admin"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="password" className="sr-only">
              Mot de passe
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-[#A67B5B] focus:border-[#A67B5B]"
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-[#A67B5B] hover:bg-[#8B6B4F] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#A67B5B]"
            >
              Se connecter
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Login