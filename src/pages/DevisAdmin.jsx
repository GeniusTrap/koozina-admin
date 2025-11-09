import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { backendUrl } from '../App'
import jsPDF from 'jspdf'

const DevisAdmin = () => {
  const [devis, setDevis] = useState([])
  const [selectedDevis, setSelectedDevis] = useState(null)
  const [showDetail, setShowDetail] = useState(false)
  const [isEditMode, setIsEditMode] = useState(true) 
  const [searchTerm, setSearchTerm] = useState('')
  const [adminData, setAdminData] = useState({
    prixCouleur: '',
    prixMateriel: '',
    fraisLivraison: ''
  })
  const [loading, setLoading] = useState(false)

  const getAuthHeaders = () => {
    const token = localStorage.getItem('adminToken')
    return {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  }

  const handleDownloadPDF = () => {
  const doc = new jsPDF()

  const prixTotalPDF = (parseFloat(adminData.prixMateriel) || 0) + (parseFloat(adminData.fraisLivraison) || 0)
  
  doc.setFontSize(20)
  doc.text('DEVIS KOZINA', 105, 20, { align: 'center' })
  
  doc.setFontSize(12)
  doc.text(`Client: ${selectedDevis.prenom} ${selectedDevis.nom}`, 20, 40)
  doc.text(`Email: ${selectedDevis.email}`, 20, 50)
  doc.text(`Téléphone: ${selectedDevis.telephone}`, 20, 60)
  doc.text(`Superficie: ${selectedDevis.superficie} m²`, 20, 70)
  doc.text(`Couleur: ${selectedDevis.couleur} (${adminData.prixCouleur || '0'} DT/m²)`, 20, 80)
  doc.text(`Gouvernorat: ${selectedDevis.gouvernorat}`, 20, 90)
  
  doc.text('DÉTAIL DU PRIX:', 20, 110)
  doc.text(`- Prix matériel: ${(parseFloat(adminData.prixMateriel) || 0).toFixed(2)} DT`, 30, 120)
  doc.text(`- Frais de livraison: ${(parseFloat(adminData.fraisLivraison) || 0).toFixed(2)} DT`, 30, 130)
  doc.text(`- TOTAL: ${prixTotalPDF.toFixed(2)} DT`, 30, 140)
  
  doc.text(`Date: ${formatDate(selectedDevis.createdAt)}`, 20, 160)
  
  doc.save(`devis-${selectedDevis.prenom}-${selectedDevis.nom}.pdf`)
}

  const handlePrintDevis = () => {
  const printWindow = window.open('', '_blank')
  
  // ⬇️⬇️⬇️ AJOUTE CETTE LIGNE ⬇️⬇️⬇️
  const prixTotalPrint = (parseFloat(adminData.prixMateriel) || 0) + (parseFloat(adminData.fraisLivraison) || 0)
  
  const printContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Devis ${selectedDevis.prenom} ${selectedDevis.nom}</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            margin: 20px;
            line-height: 1.6;
          }
          .header { 
            text-align: center; 
            margin-bottom: 30px;
            border-bottom: 2px solid #333;
            padding-bottom: 10px;
          }
          .section { 
            margin-bottom: 20px; 
          }
          .section-title { 
            font-weight: bold; 
            margin-bottom: 10px;
            color: #333;
          }
          .price-details {
            background: #f9f9f9;
            padding: 15px;
            border-radius: 5px;
          }
          .total {
            font-size: 1.2em;
            font-weight: bold;
            margin-top: 15px;
            color: #A67B5B;
          }
          @media print {
            body { margin: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>DEVIS KOZINA</h1>
        </div>
        
        <div class="section">
          <div class="section-title">INFORMATIONS CLIENT</div>
          <p><strong>Nom Complet:</strong> ${selectedDevis.prenom} ${selectedDevis.nom}</p>
          <p><strong>Email:</strong> ${selectedDevis.email}</p>
          <p><strong>Téléphone:</strong> ${selectedDevis.telephone}</p>
          <p><strong>Superficie:</strong> ${selectedDevis.superficie} m²</p>
          <p><strong>Couleur:</strong> ${selectedDevis.couleur} (${adminData.prixCouleur || '0'} DT/m²)</p>
          <p><strong>Gouvernorat:</strong> ${selectedDevis.gouvernorat}</p>
          <p><strong>Date de demande:</strong> ${formatDate(selectedDevis.createdAt)}</p>
        </div>
        
        <div class="section">
          <div class="section-title">DÉTAIL DU PRIX</div>
          <div class="price-details">
            <p><strong>Prix matériel:</strong> ${(parseFloat(adminData.prixMateriel) || 0).toFixed(2)} DT</p>
            <p><strong>Frais de livraison:</strong> ${(parseFloat(adminData.fraisLivraison) || 0).toFixed(2)} DT</p>
            <p class="total">TOTAL: ${prixTotalPrint.toFixed(2)} DT</p>  <!-- ⬅️ ICI -->
          </div>
        </div>
        
        <div class="no-print" style="margin-top: 30px; text-align: center;">
          <button onclick="window.print()" style="padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">
            Imprimer cette page
          </button>
          <button onclick="window.close()" style="padding: 10px 20px; background: #6c757d; color: white; border: none; border-radius: 5px; cursor: pointer; margin-left: 10px;">
            Fermer
          </button>
        </div>
      </body>
    </html>
  `

  printWindow.document.write(printContent)
  printWindow.document.close()
  
  // Auto-impression après un délai
  setTimeout(() => {
    printWindow.print()
  }, 500)
}

const filteredDevis = devis.filter(devisItem =>
  devisItem.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
  devisItem.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
  devisItem.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
  devisItem.telephone.includes(searchTerm)
)


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

  // Récupérer tous les devis
  const fetchDevis = async () => {
    try {
      const response = await axios.get(backendUrl + '/api/devis')
      setDevis(response.data.data)
    } catch (error) {
      console.error('Erreur lors du chargement des devis:', error)
      alert('Erreur lors du chargement des devis')
    }
  }

  useEffect(() => {
    fetchDevis()
  }, [])

  // Voir les détails d'un devis
  const viewDetails = (devisItem, editMode = true) => {
    setSelectedDevis(devisItem)
    
    const prixCouleur = devisItem.prixMateriel && devisItem.superficie 
      ? (devisItem.prixMateriel / devisItem.superficie).toFixed(2)
      : ''

    setAdminData({
      prixCouleur: prixCouleur,
      prixMateriel: devisItem.prixMateriel || '',
      fraisLivraison: devisItem.fraisLivraison || ''
    })
    
    // Déterminer le mode en fonction du statut
    const isDevisTraite = devisItem.prixMateriel > 0
    setIsEditMode(editMode && !isDevisTraite)
    setShowDetail(true)
  }

  // Mettre à jour un devis
  const handleUpdateDevis = async () => {
    setLoading(true)
    try {
      await axios.put(
        backendUrl + `/api/devis/${selectedDevis._id}`,
        adminData,
        getAuthHeaders()
      )
      fetchDevis()
      setShowDetail(false)
      alert('Devis mis à jour avec succès')
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error)
      alert('Erreur lors de la mise à jour du devis')
    } finally {
      setLoading(false)
    }
  }


  // Supprimer un devis
  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce devis ?')) {
      try {
        await axios.delete(
          backendUrl + `/api/devis/${id}`,
          getAuthHeaders()
        )
        fetchDevis()
        if (showDetail) setShowDetail(false)
      } catch (error) {
        console.error('Erreur lors de la suppression:', error)
        alert('Erreur lors de la suppression du devis')
      }
    }
  }

  // Calculer le prix total
  const prixTotal = (parseFloat(adminData.prixMateriel) || 0) + (parseFloat(adminData.fraisLivraison) || 0)

  // Vérifier si un devis est traité
  const isDevisTraite = (devisItem) => {
    return devisItem.prixMateriel > 0
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Gestion des Devis</h1>
      </div>

      <div className="mb-6">
    <input
      type="text"
      placeholder="Rechercher par nom, prénom, email ou téléphone..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A67B5B]"
    />
  </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Client
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Projet
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Statut
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
            {filteredDevis.map((devisItem) => {
              const traite = isDevisTraite(devisItem)
              return (
                <tr key={devisItem._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {devisItem.prenom} {devisItem.nom}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{devisItem.email}</div>
                    <div className="text-sm text-gray-500">{devisItem.telephone}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {devisItem.superficie}m² - {devisItem.couleur}
                    </div>
                    <div className="text-sm text-gray-500">{devisItem.gouvernorat}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      traite 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {traite ? 'Traité' : 'En attente'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(devisItem.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {traite ? (
                      <button
                        onClick={() => viewDetails(devisItem, false)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        Voir
                      </button>
                    ) : (
                      <button
                        onClick={() => viewDetails(devisItem, true)}
                        className="text-green-600 hover:text-green-900 mr-3"
                      >
                        Gérer
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(devisItem._id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {devis.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Aucun devis pour le moment
          </div>
        )}
      </div>

      {/* Modal de détail et gestion */}
      {showDetail && selectedDevis && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold text-gray-800">
                  {isEditMode ? 'Gestion du Devis' : 'Détails du Devis'}
                </h2>
                <button
                  onClick={() => setShowDetail(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Informations client (lecture seule) */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Informations Client</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nom Complet</label>
                      <p className="text-gray-900 bg-gray-50 p-2 rounded">{selectedDevis.prenom} {selectedDevis.nom}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <p className="text-gray-900 bg-gray-50 p-2 rounded">{selectedDevis.email}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                      <p className="text-gray-900 bg-gray-50 p-2 rounded">{selectedDevis.telephone}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Superficie</label>
                      <p className="text-gray-900 bg-gray-50 p-2 rounded">{selectedDevis.superficie} m²</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Couleur</label>
                      <p className="text-gray-900 bg-gray-50 p-2 rounded">{selectedDevis.couleur}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Gouvernorat</label>
                      <p className="text-gray-900 bg-gray-50 p-2 rounded">{selectedDevis.gouvernorat}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date de demande</label>
                      <p className="text-gray-900 bg-gray-50 p-2 rounded">{formatDate(selectedDevis.createdAt)}</p>
                    </div>
                  </div>
                </div>

                {/* Section admin (modifiable ou lecture seule) */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    {isEditMode ? 'Configuration du Devis' : 'Devis Finalisé'}
                  </h3>
                  <div className="space-y-4">
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Prix de la couleur "{selectedDevis.couleur}" (DT)
                        <span className="text-xs text-gray-500 ml-2">
                          (Superficie client: {selectedDevis.superficie} m²)
                        </span>
                      </label>
                      {isEditMode ? (
                        <input
                          type="number"
                          value={adminData.prixCouleur || ''}
                          onChange={(e) => {
                            const prixCouleur = parseFloat(e.target.value) || 0;
                            const superficie = selectedDevis.superficie || 0;
                            const prixMateriel = prixCouleur * superficie;
                            setAdminData({
                              ...adminData, 
                              prixCouleur: e.target.value,
                              prixMateriel: prixMateriel
                            });
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A67B5B]"
                          placeholder="Ex: 400"
                          min="0"
                          step="0.01"
                        />
                      ) : (
                        <p className="text-gray-900 bg-gray-50 p-2 rounded">{adminData.prixCouleur || '0'} DT</p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        Prix matériel calculé: <strong>{(parseFloat(adminData.prixMateriel) || 0).toFixed(2)} DT</strong>
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Prix Matériel Total (DT)
                      </label>
                      <p className="text-lg font-bold text-[#A67B5B] bg-gray-50 p-2 rounded">
                        {(parseFloat(adminData.prixMateriel) || 0).toFixed(2)} DT
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Frais de Livraison (DT)</label>
                      {isEditMode ? (
                        <input
                          type="number"
                          value={adminData.fraisLivraison}
                          onChange={(e) => setAdminData({...adminData, fraisLivraison: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A67B5B]"
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                        />
                      ) : (
                        <p className="text-gray-900 bg-gray-50 p-2 rounded">{adminData.fraisLivraison || '0'} DT</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Prix Total (DT)</label>
                      <p className="text-xl font-bold text-[#A67B5B] bg-gray-50 p-2 rounded">
                        {prixTotal.toFixed(2)} DT
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Matériel: {(parseFloat(adminData.prixMateriel) || 0).toFixed(2)} DT + Livraison: {(parseFloat(adminData.fraisLivraison) || 0).toFixed(2)} DT
                      </p>
                    </div>

                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
  {isEditMode ? (
    <button
      onClick={handleUpdateDevis}
      disabled={loading}
      className="bg-[#A67B5B] text-white px-6 py-2 rounded-lg hover:bg-[#8B6B4F] transition-colors disabled:opacity-50"
    >
      {loading ? 'Enregistrement...' : 'Enregistrer le devis'}
    </button>
  ) : (
    <>
      <button
        onClick={handleDownloadPDF}
        className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
      >
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Télécharger PDF
      </button>
      <button
        onClick={handlePrintDevis}
        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
      >
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
        </svg>
        Imprimer
      </button>
    </>
  )}
  <button
    onClick={() => setShowDetail(false)}
    className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
  >
    Fermer
  </button>
</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DevisAdmin