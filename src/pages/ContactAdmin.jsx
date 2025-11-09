import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { backendUrl } from '../App'

const ContactAdmin = () => {
  const [contacts, setContacts] = useState([])
  const [selectedContact, setSelectedContact] = useState(null)
  const [showDetail, setShowDetail] = useState(false)
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState({
    total: 0,
    nouveaux: 0,
    repondus: 0
  })

  const getAuthHeaders = () => {
    const token = localStorage.getItem('adminToken')
    return {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  }

  // Fonction pour formater la date
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Récupérer tous les contacts
  const fetchContacts = async () => {
    try {
      const response = await axios.get(backendUrl + '/api/contacts')
      setContacts(response.data.data)
    } catch (error) {
      console.error('Erreur lors du chargement des contacts:', error)
      alert('Erreur lors du chargement des messages')
    }
  }

  // Récupérer les statistiques
  const fetchStats = async () => {
    try {
      const response = await axios.get(backendUrl + '/api/contacts/stats')
      setStats(response.data.data)
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error)
    }
  }

  useEffect(() => {
    fetchContacts()
    fetchStats()
  }, [])

  // Marquer comme lu
  const markAsRead = async (id) => {
    try {
      await axios.put(
        backendUrl + `/api/contacts/${id}`,
        { status: 'lu' },
        getAuthHeaders()
      )
      fetchContacts()
      fetchStats()
    } catch (error) {
      console.error('Erreur lors du marquage comme lu:', error)
      alert('Erreur lors du marquage du message')
    }
  }

  // Marquer comme répondu
  const markAsReplied = async (id) => {
    try {
      await axios.put(
        backendUrl + `/api/contacts/${id}`,
        { status: 'repondu' },
        getAuthHeaders()
      )
      fetchContacts()
      fetchStats()
    } catch (error) {
      console.error('Erreur lors du marquage comme répondu:', error)
      alert('Erreur lors du marquage du message')
    }
  }

  // Supprimer un contact
  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce message ?')) {
      try {
        await axios.delete(
          backendUrl + `/api/contacts/${id}`,
          getAuthHeaders()
        )
        fetchContacts()
        fetchStats()
        if (showDetail) setShowDetail(false)
      } catch (error) {
        console.error('Erreur lors de la suppression:', error)
        alert('Erreur lors de la suppression du message')
      }
    }
  }

  // Voir les détails d'un contact
  const viewDetails = (contact) => {
    setSelectedContact(contact)
    setShowDetail(true)
    // Marquer automatiquement comme lu quand on ouvre les détails
    if (contact.status === 'nouveau') {
      markAsRead(contact._id)
    }
  }

  // Filtrer les contacts par statut
  const [filter, setFilter] = useState('tous')

  const filteredContacts = contacts.filter(contact => {
    if (filter === 'tous') return true
    return contact.status === filter
  })

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Messages de Contact</h1>
        <div className="text-sm text-gray-600">
          {stats.nouveaux > 0 && (
            <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs">
              {stats.nouveaux} nouveau{stats.nouveaux > 1 ? 'x' : ''}
            </span>
          )}
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-blue-500">
          <h3 className="text-lg font-semibold text-gray-800">Total</h3>
          <p className="text-2xl font-bold text-gray-700">{stats.total}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-yellow-500">
          <h3 className="text-lg font-semibold text-gray-800">Nouveaux</h3>
          <p className="text-2xl font-bold text-yellow-600">{stats.nouveaux}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-green-500">
          <h3 className="text-lg font-semibold text-gray-800">Répondu</h3>
          <p className="text-2xl font-bold text-green-600">{stats.repondus}</p>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="flex space-x-4">
          <button
            onClick={() => setFilter('tous')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'tous' 
                ? 'bg-[#A67B5B] text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Tous ({stats.total})
          </button>
          <button
            onClick={() => setFilter('nouveau')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'nouveau' 
                ? 'bg-yellow-500 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Nouveaux ({stats.nouveaux})
          </button>
          <button
            onClick={() => setFilter('repondu')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'repondu' 
                ? 'bg-green-500 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Répondu ({stats.repondus})
          </button>
        </div>
      </div>

      {/* Liste des contacts */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Statut
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Message
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredContacts.map((contact) => (
              <tr 
                key={contact._id} 
                className={`hover:bg-gray-50 cursor-pointer ${
                  contact.status === 'nouveau' ? 'bg-blue-50' : ''
                }`}
                onClick={() => viewDetails(contact)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    contact.status === 'nouveau' 
                      ? 'bg-yellow-100 text-yellow-800'
                      : contact.status === 'repondu'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {contact.status === 'nouveau' ? 'Nouveau' : 
                     contact.status === 'repondu' ? 'Répondu' : 'Lu'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{contact.nom}</div>
                    <div className="text-sm text-gray-500">{contact.email}</div>
                    <div className="text-sm text-gray-500">{contact.telephone}</div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 max-w-xs truncate">
                    {contact.message}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(contact.createdAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => viewDetails(contact)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Voir
                    </button>
                    {contact.status !== 'repondu' && (
                      <button
                        onClick={() => markAsReplied(contact._id)}
                        className="text-green-600 hover:text-green-900"
                      >
                        Marquer répondu
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(contact._id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Supprimer
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredContacts.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Aucun message {filter !== 'tous' ? `avec le statut "${filter}"` : ''} pour le moment
          </div>
        )}
      </div>

      {/* Modal de détail */}
      {showDetail && selectedContact && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold text-gray-800">Détail du message</h2>
                <button
                  onClick={() => setShowDetail(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                    <p className="text-gray-900 bg-gray-50 p-2 rounded">{selectedContact.nom}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                    <p className="text-gray-900 bg-gray-50 p-2 rounded">{selectedContact.telephone}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <p className="text-gray-900 bg-gray-50 p-2 rounded">{selectedContact.email}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                  <p className="text-gray-900 bg-gray-50 p-2 rounded whitespace-pre-wrap">
                    {selectedContact.message}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date d'envoi</label>
                  <p className="text-gray-900 bg-gray-50 p-2 rounded">
                    {formatDate(selectedContact.createdAt)}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                  <p className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                    selectedContact.status === 'nouveau' 
                      ? 'bg-yellow-100 text-yellow-800'
                      : selectedContact.status === 'repondu'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {selectedContact.status === 'nouveau' ? 'Nouveau' : 
                     selectedContact.status === 'repondu' ? 'Répondu' : 'Lu'}
                  </p>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
                {selectedContact.status !== 'repondu' && (
                  <button
                    onClick={() => {
                      markAsReplied(selectedContact._id)
                      setShowDetail(false)
                    }}
                    className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                  >
                    Marquer comme répondu
                  </button>
                )}
                <button
                  onClick={() => setShowDetail(false)}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Fermer
                </button>
                <button
                  onClick={() => {
                    handleDelete(selectedContact._id)
                    setShowDetail(false)
                  }}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ContactAdmin