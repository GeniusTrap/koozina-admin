import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { backendUrl } from '../App'

const RealisationsAdmin = () => {
  const [realisations, setRealisations] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingRealisation, setEditingRealisation] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: ''
  })
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [selectedImage, setSelectedImage] = useState(null)

  const getAuthHeaders = () => {
    const token = localStorage.getItem('adminToken')
    return {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  }

  const handleImageUpload = async (file) => {
  setUploading(true)
  const uploadData = new FormData()
  uploadData.append('file', file)
  uploadData.append('upload_preset', 'plan_de_travail') 

  try {
    const response = await axios.post(
      `https://api.cloudinary.com/v1_1/dfjy8u04i/image/upload`, 
      uploadData
    )
    setFormData(prev => ({ ...prev, image: response.data.secure_url }))
  } catch (error) {
    console.error('Erreur upload image:', error)
    alert('Erreur lors de l\'upload de l\'image')
  } finally {
    setUploading(false)
  }
}

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setSelectedImage(file)
      handleImageUpload(file)
    }
  }

  const fetchRealisations = async () => {
    try {
      const response = await axios.get(backendUrl + '/api/realisations')
      setRealisations(response.data.data)
    } catch (error) {
      console.error('Erreur lors du chargement des réalisations:', error)
    }
  }

  useEffect(() => {
    fetchRealisations()
  }, [])

  // Gérer les changements du formulaire
  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  // Créer ou modifier une réalisation
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.image) {
      alert('Veuillez sélectionner une image')
      return
    }
    
    setLoading(true)

    try {
      if (editingRealisation) {
        await axios.put(
          backendUrl + `/api/realisations/${editingRealisation._id}`,
          formData,
          getAuthHeaders()
        )
      } else {
        await axios.post(
          backendUrl + '/api/realisations',
          formData,
          getAuthHeaders()
        )
      }

      setFormData({ title: '', description: '', image: '' })
      setSelectedImage(null)
      setEditingRealisation(null)
      setShowForm(false)
      fetchRealisations()
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
      alert('Erreur lors de la sauvegarde')
    } finally {
      setLoading(false)
    }
  }

  // Modifier une réalisation
  const handleEdit = (realisation) => {
    setEditingRealisation(realisation)
    setFormData({
      title: realisation.title,
      description: realisation.description,
      image: realisation.image
    })
    setSelectedImage(null)
    setShowForm(true)
  }

  // Supprimer une réalisation
  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette réalisation ?')) {
      try {
        await axios.delete(
          backendUrl + `/api/realisations/${id}`,
          getAuthHeaders()
        )
        fetchRealisations()
      } catch (error) {
        console.error('Erreur lors de la suppression:', error)
        alert('Erreur lors de la suppression')
      }
    }
  }

  // Annuler le formulaire
  const handleCancel = () => {
    setFormData({ title: '', description: '', image: '' })
    setSelectedImage(null)
    setEditingRealisation(null)
    setShowForm(false)
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Gestion des Réalisations</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-[#A67B5B] text-white px-4 py-2 rounded-lg hover:bg-[#8B6B4F] transition-colors"
        >
          + Ajouter une réalisation
        </button>
      </div>

      {/* Formulaire */}
      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {editingRealisation ? 'Modifier la réalisation' : 'Nouvelle réalisation'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Titre *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A67B5B]"
                placeholder="Titre de la réalisation"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A67B5B]"
                placeholder="Description de la réalisation"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Image *
              </label>
              
              {/* Carreau d'upload comme ton exemple */}
              <div className="flex gap-2">
                <label htmlFor="image" className="cursor-pointer">
                  <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-[#A67B5B] transition-colors">
                    {selectedImage || formData.image ? (
                      <img 
                        src={selectedImage ? URL.createObjectURL(selectedImage) : formData.image} 
                        alt="Aperçu" 
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <div className="text-center text-gray-500">
                        <svg className="w-8 h-8 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        <span className="text-xs">Ajouter une image</span>
                      </div>
                    )}
                  </div>
                  <input 
                    type="file" 
                    id="image" 
                    accept="image/*" 
                    onChange={handleFileChange}
                    className="hidden" 
                  />
                </label>
              </div>

              {uploading && <p className="text-sm text-gray-500 mt-2">Upload en cours...</p>}
              {(selectedImage || formData.image) && !uploading && (
                <p className="text-sm text-green-600 mt-2">✓ Image sélectionnée</p>
              )}
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={loading || uploading}
                className="bg-[#A67B5B] text-white px-4 py-2 rounded-lg hover:bg-[#8B6B4F] disabled:opacity-50"
              >
                {loading ? 'Enregistrement...' : (editingRealisation ? 'Modifier' : 'Créer')}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Liste des réalisations */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {realisations.map((realisation) => (
          <div key={realisation._id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <img
              src={realisation.image}
              alt={realisation.title}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {realisation.title}
              </h3>
              <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                {realisation.description}
              </p>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(realisation)}
                  className="flex-1 bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition-colors"
                >
                  Modifier
                </button>
                <button
                  onClick={() => handleDelete(realisation._id)}
                  className="flex-1 bg-red-500 text-white py-2 rounded hover:bg-red-600 transition-colors"
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {realisations.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          Aucune réalisation pour le moment
        </div>
      )}
    </div>
  )
}

export default RealisationsAdmin