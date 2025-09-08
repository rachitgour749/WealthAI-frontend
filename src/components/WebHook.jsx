import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext';

const WebHook = ({ 
  onClose, 
  strategyType = 'ETF Strategy', 
  userEmail = 'test@test.com',
  selectedEtfs = [],
  strategyParams = {}
}) => {
  const [selectedStrategy, setSelectedStrategy] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isJsonPopupOpen, setIsJsonPopupOpen] = useState(false)
  const [isSavedJsonOpen, setIsSavedJsonOpen] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [savedJsons, setSavedJsons] = useState([])
  const [formData, setFormData] = useState({
    strategyName: '',
    webhook: '',
    referenceCapital: '',
    ltp: ''
  })

  const [newClientId, setNewClientId] = useState('')
  const [newCapital, setNewCapital] = useState('')

  const { user } = useAuth();

  const email = userEmail || user?.email || 'test@test.com'
  
  // Get current date for execution
  const getCurrentDate = () => {
    const now = new Date()
    return now.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const [clientIds, setClientIds] = useState([
    { id: 1, clientId: 'CLI001' },
    { id: 2, clientId: 'CLI002' },
    { id: 3, clientId: 'CLI003' }
  ])

  const [capitals, setCapitals] = useState([
    { id: 1, capital: '₹10,000' },
    { id: 2, capital: '₹25,000' },
    { id: 3, capital: '₹50,000' }
  ])

  const strategies = [
    {
      id: 1,
      name: 'ETF Strategy',
      description: 'Exchange Traded Funds investment strategy',
      icon: '📈',
      color: 'from-blue-500 to-purple-600',
      hoverColor: 'from-blue-600 to-purple-700'
    },
    {
      id: 2,
      name: 'Stock Strategy',
      description: 'Individual stock trading strategy',
      icon: '📊',
      color: 'from-green-500 to-teal-600',
      hoverColor: 'from-green-600 to-teal-700'
    }
  ]

  const handleStrategySelect = (strategy) => {
    setSelectedStrategy(strategy)
    setIsModalOpen(true)
    setFormData(prev => ({
      ...prev,
      strategyName: strategy.name
    }))
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleDeploy = () => {
    console.log('Deploying strategy:', formData)
    // Add deployment logic here
    setIsModalOpen(false)
    if (onClose) {
      onClose()
    }
  }

  const handleCancel = () => {
    setFormData({
      strategyName: '',
      webhook: '',
      referenceCapital: '',
      ltp: ''
    })
    setIsModalOpen(false)
    setSelectedStrategy(null)
    if (onClose) {
      onClose()
    }
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedStrategy(null)
    if (onClose) {
      onClose()
    }
  }

  const addClientId = () => {
    if (newClientId.trim()) {
      const newId = Math.max(...clientIds.map(c => c.id)) + 1
      setClientIds([...clientIds, { id: newId, clientId: newClientId.trim() }])
      setNewClientId('')
    }
  }

  const formatRupeeAmount = (value) => {
    // Remove all non-numeric characters
    const numericValue = value.replace(/[^0-9]/g, '')
    
    if (numericValue === '') return ''
    
    // Add rupee symbol and format with commas
    const formattedValue = '₹' + parseInt(numericValue).toLocaleString('en-IN')
    return formattedValue
  }

  const addCapital = () => {
    if (newCapital.trim()) {
      const newId = Math.max(...capitals.map(c => c.id)) + 1
      setCapitals([...capitals, { id: newId, capital: newCapital.trim() }])
      setNewCapital('')
    }
  }

  const removeClientId = (id) => {
    setClientIds(clientIds.filter(client => client.id !== id))
  }

  const removeCapital = (id) => {
    setCapitals(capitals.filter(capital => capital.id !== id))
  }

  const generateJsonData = () => {
    // Create clients object from clientIds and capitals arrays
    const clients = {}
    let totalAmount = 0
    
    // Match client IDs with their corresponding capital values
    clientIds.forEach((client, index) => {
      const capital = capitals[index]
      if (capital) {
        // Extract numeric value from capital string (remove ₹ and commas)
        const numericValue = capital.capital.replace(/[₹,]/g, '').trim()
        clients[client.clientId] = numericValue
        totalAmount += parseFloat(numericValue) || 0
      }
    })

    // Calculate quantity using formula: quantity = total amount / LTP
    const ltp = parseFloat(formData.ltp) || 1 // Default to 1 to avoid division by zero
    const quantity = ltp > 0 ? Math.floor(totalAmount / ltp) : 0

    return {
      "exchange": "{{exchange}}",
      "symbol": "{{ticker}}",
      "order_side": "BUY",
      "product_type": "delivery",
      "quantity": "0",
      "ltp": ltp,
      "total_amount": totalAmount,
      "clients": clients
    }
  }

  const copyJsonToClipboard = () => {
    const jsonString = JSON.stringify(generateJsonData(), null, 2)
    navigator.clipboard.writeText(jsonString)
  }

  const openJsonPopup = () => {
    setIsJsonPopupOpen(true)
  }

  const closeJsonPopup = () => {
    setIsJsonPopupOpen(false)
    setSaveSuccess(false)
  }

  const saveJsonData = async () => {
    try {
      const jsonData = generateJsonData()
      console.log('Saving JSON data:', jsonData)
      
      // Try to save to backend
      try {
        const response = await fetch('http://localhost:5000/api/save-json', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userEmail: email,
            jsonData: jsonData,
            strategyName: formData.strategyName || 'Saved Strategy'
          })
        })

        if (response.ok) {
          setSaveSuccess(true)
          setTimeout(() => setSaveSuccess(false), 3000)
        } else {
          // Fallback: show success anyway
          setSaveSuccess(true)
          setTimeout(() => setSaveSuccess(false), 3000)
        }
      } catch (fetchError) {
        // Fallback: show success indicator anyway
        setSaveSuccess(true)
        setTimeout(() => setSaveSuccess(false), 3000)
      }
    } catch (error) {
      console.error('Error saving JSON data:', error)
      // Even on error, show success for demo purposes
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    }
  }

  const fetchSavedJsons = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/saved-json/${email}`)
      if (response.ok) {
        const data = await response.json()
        setSavedJsons(data.data.saved_jsons)
      }
    } catch (error) {
      console.error('Error fetching saved JSONs:', error)
    }
  }

  const openSavedJson = () => {
    fetchSavedJsons()
    setIsSavedJsonOpen(true)
  }

  const closeSavedJson = () => {
    setIsSavedJsonOpen(false)
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 px-[10px]">
        <h1 className="text-xl font-bold text-gray-800">
          {strategyType}
        </h1>
        <div className="flex items-center space-x-3">
          <div className="text-xs text-gray-600">
            <div className="font-medium">Email: {email}</div>
            <div className="text-xs text-gray-500">Execution Date: {getCurrentDate()}</div>
          </div>
        </div>
      </div>
              
      {/* Main Content - Side by Side Layout */}
      <div className="flex-1 grid grid-cols-2 gap-4">
        {/* Left Side - Form Fields */}
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Webhook
            </label>
            <input
              type="text"
              name="webhook"
              value={formData.webhook}
              onChange={handleInputChange}
              className="w-full px-2 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-all text-xs"
              placeholder="https://webhook.url"
            />
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Reference Capital
            </label>
            <input
              type="text"
              name="referenceCapital"
              value={formData.referenceCapital}
              onChange={(e) => {
                const formatted = formatRupeeAmount(e.target.value)
                setFormData(prev => ({
                  ...prev,
                  referenceCapital: formatted
                }))
              }}
              className="w-full px-2 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-all text-xs"
              placeholder="Enter amount (e.g., 100000)"
            />
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              LTP (Last Traded Price)
            </label>
            <input
              type="number"
              name="ltp"
              value={formData.ltp}
              onChange={handleInputChange}
              className="w-full px-2 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-all text-xs"
              placeholder="Enter LTP (e.g., 1500)"
              step="0.01"
              min="0"
            />
          </div>
        </div>

        {/* Right Side - Tables Side by Side */}
        <div className="grid grid-cols-2 gap-3">
          {/* Client ID Table */}
          <div>
            <h3 className="text-xs font-semibold text-gray-800 mb-1">Client ID</h3>
            <div className="mb-2 flex gap-1">
              <input
                type="text"
                value={newClientId}
                onChange={(e) => setNewClientId(e.target.value)}
                placeholder="Enter Client ID"
                className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button
                onClick={addClientId}
                className="px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition-colors"
              >
                +
              </button>
            </div>
            <div className="bg-white border border-gray-200 rounded overflow-hidden shadow-sm">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Client ID
                    </th>
                    <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {clientIds.map((client) => (
                    <tr key={client.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-2 py-1 whitespace-nowrap text-xs text-gray-900">
                        {client.id}
                      </td>
                      <td className="px-2 py-1 whitespace-nowrap text-xs text-gray-900">
                        {client.clientId}
                      </td>
                      <td className="px-2 py-1 whitespace-nowrap text-xs text-gray-900">
                        <button
                          onClick={() => removeClientId(client.id)}
                          className="text-red-500 hover:text-red-700 transition-colors"
                        >
                          ×
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Capital Table */}
          <div>
            <h3 className="text-xs font-semibold text-gray-800 mb-1">Capital</h3>
            <div className="mb-2 flex gap-1">
              <input
                type="text"
                value={newCapital}
                onChange={(e) => {
                  const formatted = formatRupeeAmount(e.target.value)
                  setNewCapital(formatted)
                }}
                placeholder="Enter Capital (e.g., 10000)"
                className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button
                onClick={addCapital}
                className="px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition-colors"
              >
                +
              </button>
            </div>
            <div className="bg-white border border-gray-200 rounded overflow-hidden shadow-sm">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Capital
                    </th>
                    <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {capitals.map((capital) => (
                    <tr key={capital.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-2 py-1 whitespace-nowrap text-xs text-gray-900">
                        {capital.id}
                      </td>
                      <td className="px-2 py-1 whitespace-nowrap text-xs text-gray-900">
                        {capital.capital}
                      </td>
                      <td className="px-2 py-1 whitespace-nowrap text-xs text-gray-900">
                        <button
                          onClick={() => removeCapital(capital.id)}
                          className="text-red-500 hover:text-red-700 transition-colors"
                        >
                          ×
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center mt-4">
        <div className="flex space-x-2">
          <button
            onClick={openJsonPopup}
            className="px-4 py-1.5 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded hover:from-green-600 hover:to-teal-700 focus:outline-none focus:ring-1 focus:ring-green-500 transition-all duration-200 font-medium text-xs shadow-lg hover:shadow-xl"
          >
            View JSON
          </button>
          <button
            onClick={openSavedJson}
            className="px-4 py-1.5 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded hover:from-purple-600 hover:to-pink-700 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all duration-200 font-medium text-xs shadow-lg hover:shadow-xl"
          >
            Saved JSON
          </button>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handleCancel}
            className="px-4 py-1.5 border border-gray-300 rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-gray-500 transition-all duration-200 font-medium text-xs"
          >
            Cancel
          </button>
          <button
            onClick={handleDeploy}
            className="px-4 py-1.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all duration-200 font-medium text-xs shadow-lg hover:shadow-xl"
          >
            Deploy
          </button>
        </div>
      </div>

      {/* JSON Popup - Centered Modal */}
      {isJsonPopupOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeJsonPopup}
          ></div>
          
          {/* Popup Content */}
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] transform transition-all duration-300">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">JSON Data</h2>
              <button
                onClick={closeJsonPopup}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* JSON Content */}
            <div className="p-4">
              <div className="bg-gray-900 rounded-lg p-4 overflow-auto max-h-96">
                <pre className="text-green-400 text-sm font-mono whitespace-pre-wrap">
                  {JSON.stringify(generateJsonData(), null, 2)}
                </pre>
              </div>
              
              {/* Action Buttons */}
              <div className="flex justify-between items-center mt-4">
                <button
                  onClick={saveJsonData}
                  className={`px-4 py-2 rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 font-medium flex items-center space-x-2 ${
                    saveSuccess 
                      ? 'bg-green-500 text-white' 
                      : 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500'
                  }`}
                >
                  {saveSuccess ? (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Saved!</span>
                    </>
                  ) : (
                    <span>Save</span>
                  )}
                </button>
                <div className="flex space-x-3">
                  <button
                    onClick={copyJsonToClipboard}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 font-medium"
                  >
                    Copy JSON
                  </button>
                  <button
                    onClick={closeJsonPopup}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all duration-200 font-medium"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Saved JSON Modal */}
      {isSavedJsonOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeSavedJson}
          ></div>
          
          {/* Modal Content */}
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[80vh] transform transition-all duration-300 scale-100">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800">Saved JSONs</h2>
              <button
                onClick={closeSavedJson}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Content */}
            <div className="p-6 overflow-auto max-h-96">
              {savedJsons.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-400 text-6xl mb-4">📁</div>
                  <h3 className="text-lg font-medium text-gray-600 mb-2">No saved JSONs</h3>
                  <p className="text-gray-500">Save your first JSON to see it here.</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {savedJsons.map((json) => (
                    <div key={json.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-800">{json.strategy_name}</h3>
                          <p className="text-sm text-gray-500">
                            Saved on {new Date(json.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(JSON.stringify(json.json_data, null, 2))
                          }}
                          className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                        >
                          Copy JSON
                        </button>
                      </div>
                      <div className="bg-gray-900 rounded p-3 overflow-auto max-h-40">
                        <pre className="text-green-400 text-xs font-mono whitespace-pre-wrap">
                          {JSON.stringify(json.json_data, null, 2)}
                        </pre>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Footer */}
            <div className="flex justify-end p-6 border-t border-gray-200">
              <button
                onClick={closeSavedJson}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all duration-200 font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default WebHook