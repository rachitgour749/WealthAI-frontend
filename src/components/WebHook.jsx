import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext';

const WebHook = ({
  onClose,
  strategyType = 'ETF Strategy',
  userEmail = 'test@test.com',
  selectedEtfs = [],
  strategyParams = {}
}) => {
  const [selectedStrategy, setSelectedStrategy] = useState(null)
  const [, setIsModalOpen] = useState(false)
  const [isJsonPopupOpen, setIsJsonPopupOpen] = useState(false)
  const [isSavedJsonOpen, setIsSavedJsonOpen] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [savedJsons, setSavedJsons] = useState([])

  // Deployment state management
  const [isDeploying, setIsDeploying] = useState(false)
  const [deploySuccess, setDeploySuccess] = useState(false)
  const [deployError, setDeployError] = useState('')

  // Execution state management
  const [isExecuting, setIsExecuting] = useState(false)
  const [executionSuccess, setExecutionSuccess] = useState(false)
  const [executionError, setExecutionError] = useState('')
  const [showExecutionPopup, setShowExecutionPopup] = useState(false)
  // Local persistence for saved JSONs (fallback/optimistic cache)
  const STORAGE_KEY = 'wealthai_saved_jsons'

  const readCache = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return Array.isArray(JSON.parse(raw)) ? JSON.parse(raw) : []
    } catch (e) {
      return []
    }
  }

  const writeCache = (items) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items || []))
    } catch (e) {
      // ignore storage errors
    }
  }

  const addToCache = (item) => {
    const current = readCache()
    // de-duplicate by id if present; otherwise by created_at+email+strategy_type
    const id = item?.id || `${item?.created_at || Date.now()}_${(item?.user_email || '').toLowerCase()}_${(item?.strategy_type || '').toLowerCase()}`
    const withId = { id, ...item }
    const filtered = current.filter(x => (x.id || '') !== id)
    writeCache([withId, ...filtered])
  }

  const removeFromCache = (id) => {
    const current = readCache()
    writeCache(current.filter(x => x.id !== id))
  }

  const loadFromCacheFiltered = (currentEmail, desiredType) => {
    const all = readCache()
    const byEmail = all.filter(item => String((item?.user_email || item?.email || item?.json_data?.user_email || '')).toLowerCase() === currentEmail)
    return byEmail.filter(item => {
      const topLevel = String(item?.strategy_type || item?.strategyName || item?.strategy || '').toLowerCase()
      const nested = String(item?.json_data?.strategy_type || item?.json_data?.strategyType || '').toLowerCase()
      return topLevel === desiredType || nested === desiredType
    })
  }

  const [formData, setFormData] = useState({
    strategyName: '',
    webhook: 'http://tradeai1.wealthwisers.in/websoket/tradeView-data/ec1674b527fc/',
    referenceCapital: '₹1,00,000',
  })

  const [newClientId, setNewClientId] = useState('')
  const [newCapital, setNewCapital] = useState('')
  const [signalData, setSignalData] = useState([])

  const { user } = useAuth();

  const email = userEmail || user?.email || 'test@test.com'

  // Function to get the most recent previous Friday
  const getPreviousFriday = () => {
    const today = new Date()
    const dayOfWeek = today.getDay() // 0 = Sunday, 1 = Monday, ..., 5 = Friday, 6 = Saturday
    const daysToSubtract = dayOfWeek === 5 ? 7 : (dayOfWeek + 2) % 7 // If today is Friday, go back 7 days, otherwise calculate days to previous Friday
    const previousFriday = new Date(today)
    previousFriday.setDate(today.getDate() - daysToSubtract)
    return previousFriday.toISOString().split('T')[0] // Return in YYYY-MM-DD format
  }

  // API Configuration
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000'

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

  const handleStrategySelect = (strategy) => {
    setSelectedStrategy(strategy)
    setIsModalOpen(true)
    setFormData(prev => ({
      ...prev,
      strategyName: strategy.name
    }))
    // Reset deployment state when opening modal
    setDeployError('')
    setDeploySuccess(false)
    setIsDeploying(false)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const fetchSavedStrategyFromDatabase = async () => {
    try {
      console.log('Fetching saved strategy from database for user:', email)

      // First try to fetch saved strategies
      const strategiesResponse = await fetch(`${API_BASE_URL}/api/get-saved-strategies-list/${encodeURIComponent(email)}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      })

      if (strategiesResponse.ok) {
        const strategiesData = await strategiesResponse.json()
        console.log('Fetched saved strategies:', strategiesData)

        // Filter for ETF strategies
        let strategies = []
        if (strategiesData && strategiesData.strategies) {
          strategies = Array.isArray(strategiesData.strategies) ? strategiesData.strategies : [strategiesData.strategies]
        }

        const etfStrategies = strategies.filter(strategy =>
          strategy.strategy_type === 'etf_rotation' ||
          strategy.strategy_type === 'ETF_rotation' ||
          (strategy.tickers && Array.isArray(strategy.tickers))
        )

        if (etfStrategies.length > 0) {
          // Return the most recent strategy
          const latestStrategy = etfStrategies[0]
          console.log('Using latest saved strategy:', latestStrategy)
          return latestStrategy
        }
      }

      // If no saved strategies, try to fetch saved JSONs
      const jsonResponse = await fetch(`${API_BASE_URL}/api/saved-json/${encodeURIComponent(email)}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      })

      if (jsonResponse.ok) {
        const jsonData = await jsonResponse.json()
        console.log('Fetched saved JSONs:', jsonData)

        let savedJsons = []
        if (jsonData && jsonData.data && Array.isArray(jsonData.data.saved_jsons)) {
          savedJsons = jsonData.data.saved_jsons
        } else if (Array.isArray(jsonData)) {
          savedJsons = jsonData
        } else if (jsonData && Array.isArray(jsonData.saved_jsons)) {
          savedJsons = jsonData.saved_jsons
        }

        // Filter for current strategy type
        const currentType = String(strategyType || formData.strategyName || 'ETF Strategy').toLowerCase()
        const matchingJsons = savedJsons.filter(json =>
          json.strategy_type && String(json.strategy_type).toLowerCase().includes(currentType)
        )

        if (matchingJsons.length > 0) {
          const latestJson = matchingJsons[0]
          console.log('Using latest saved JSON:', latestJson)
          return latestJson
        }
      }

      console.log('No saved data found in database')
      return null
    } catch (error) {
      console.error('Error fetching saved data from database:', error)
      return null
    }
  }

  const deployToLiveSignal = async (deploymentData) => {
    try {
      console.log('Deploying to live signal API:', deploymentData)

      // Choose endpoint based on strategy type
      const endpoint = strategyType === 'Stock Strategy'
        ? `${API_BASE_URL}/api/stocks/deploy`
        : `${API_BASE_URL}/api/live-signal/deploy`;

      console.log('Using endpoint:', endpoint);
      console.log('Strategy type:', strategyType);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(deploymentData)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || errorData.detail || `HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      console.log('Deployment successful:', result)
      return result
    } catch (error) {
      console.error('Deployment failed:', error)
      throw error
    }
  }

  function filterBuyStocks(signals) {
  if (!Array.isArray(signals)) {
    console.error("Invalid signals array:", signals);
    return [];
  }
  return signals.filter(signal => signal.side === "BUY");
}


  const fetchLiveSignals = async (date = null, side = 'BUY') => {
    console.log("Fetching live signals for strategy:", strategyType)

    // Use dynamic previous Friday date if no date provided
    const targetDate = date || getPreviousFriday()
    console.log('Using date:', targetDate)

    try {
      console.log('Fetching live signals from API...')

      // Choose endpoint based on strategy type
      const endpoint = strategyType === 'Stock Strategy'
        ? `${API_BASE_URL}/api/stocks/signals/latest`
        : `${API_BASE_URL}/api/live-signals/?date=${targetDate}&side=${side}`;

      console.log('API URL:', endpoint)

      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.warn('Failed to fetch signals:', errorData)
        // Don't throw - use fallback
        return
      }

      const result = await response.json()
      console.log('Live signals fetched successfully:', result)

      // Handle different response formats
      if (strategyType === 'Stock Strategy') {
        // Stock strategy returns { success, signals, count, run_id }
        if (result.signals && result.signals.length > 0) {
          const buyStocks = filterBuyStocks(result.signals);
          console.log('Filtered buy stocks:', buyStocks[0]);
          setSignalData(buyStocks[0]);
          console.log('Set stock signal data:', buyStocks[0]); // updated this to show filtered first stock
        }
      }
      else {
        // ETF strategy returns { data: { signals } }
        if (result.data && result.data.signals && result.data.signals.length > 0) {
          setSignalData(result.data.signals[0])
        }
      }
    } catch (error) {
      console.error('Failed to fetch live signals:', error)
      // Don't throw - just log
    }
  }

  const executeTrade = async () => {
    try {
      setIsExecuting(true)
      setExecutionSuccess(false)
      setExecutionError('')
      setShowExecutionPopup(false)

      console.log('Executing trade directly via webhook...')

      // Get the JSON data to send
      const tradeData = generateJsonData()
      console.log('Sending trade data to webhook:', tradeData)
      console.log('Webhook URL:', formData.webhook)

      const response = await fetch(formData.webhook, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(tradeData)
      })

      console.log('Webhook response status:', response.status)

      if (response.status === 201) {
        console.log('Trade execution successful!')
        setExecutionSuccess(true)
        setExecutionError('')
        setShowExecutionPopup(true)

        // Auto-hide success popup after 3 seconds
        setTimeout(() => {
          setShowExecutionPopup(false)
          setExecutionSuccess(false)
        }, 3000)
      } else {
        console.error('Trade execution failed with status:', response.status)
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        setExecutionSuccess(false)
        setExecutionError(`Execution failed: ${response.status} - ${errorData.error || response.statusText}`)
        setShowExecutionPopup(true)

        // Auto-hide error popup after 5 seconds
        setTimeout(() => {
          setShowExecutionPopup(false)
          setExecutionError('')
        }, 5000)
      }
    } catch (error) {
      console.error('Trade execution error:', error)
      setExecutionSuccess(false)
      setExecutionError(`Network error: ${error.message}`)
      setShowExecutionPopup(true)

      // Auto-hide error popup after 5 seconds
      setTimeout(() => {
        setShowExecutionPopup(false)
        setExecutionError('')
      }, 5000)
    } finally {
      setIsExecuting(false)
    }
  }

  useEffect(() => {
    fetchLiveSignals(); // Will automatically use previous Friday date
  }, [])

  console.log("signalData", signalData)

  const handleDeploy = async () => {
    try {
      setIsDeploying(true)
      setDeployError('')
      setDeploySuccess(false)

      console.log('Starting deployment process...')

      // Step 1: Fetch saved data from database
      console.log('Fetching saved strategy data from database...')
      const savedData = await fetchSavedStrategyFromDatabase()

      let deploymentData
      let jsonData

      if (savedData) {
        console.log('Found saved data in database, using it for deployment:', savedData)

        // Use saved data to generate deployment JSON
        if (savedData.json_data) {
          // This is from saved JSONs
          jsonData = savedData.json_data
        } else if (savedData.tickers && savedData.capital_per_week) {
          // This is from saved strategies - convert to JSON format
          const clients = {}
          if (savedData.tickers && Array.isArray(savedData.tickers)) {
            savedData.tickers.forEach((ticker, index) => {
              const clientId = `CLI${String(index + 1).padStart(3, '0')}`
              // Use capital_per_week for each client (you might want to adjust this logic)
              const clientCapital = savedData.capital_per_week || 10000
              // Use automatically fetched LTP, fallback to manual input
              const ltp = signalData?.ltp?.price || parseFloat(formData.ltp) || 100
              const quantity = Math.floor(clientCapital / ltp)
              clients[clientId] = quantity.toString()
            })
          }

          jsonData = {
            "exchange": "NSE",
            "symbol": signalData?.symbol || "NIFTY50",
            "order_side": "BUY",
            "product_type": "delivery",
            "clients": clients
          }
        }

        // Create deployment data using saved information
        deploymentData = {
          user_email: email,
          strategy_name: savedData.strategy_name || formData.strategyName || selectedStrategy?.name || 'ETF Strategy',
          strategy_type: savedData.strategy_type || strategyType || 'ETF Strategy',
          deployment_data: jsonData,
          webhook_url: formData.webhook || '',
          reference_capital: savedData.capital_per_week?.toString() || formData.referenceCapital || '',
          ltp: parseFloat(formData.ltp) || 100,
          deployed_at: new Date().toISOString(),
          status: 'active',
          source: 'database'
        }
      } else {
        console.log('No saved data found, using current form data')

        // Fallback to current form data if no saved data
        if (!formData.ltp || parseFloat(formData.ltp) <= 0) {
          throw new Error('Please enter a valid LTP (Last Traded Price)')
        }

        if (clientIds.length === 0) {
          throw new Error('Please add at least one client ID')
        }

        if (capitals.length === 0) {
          throw new Error('Please add at least one capital amount')
        }

        if (clientIds.length !== capitals.length) {
          throw new Error('Number of client IDs must match number of capital amounts')
        }

        // Generate deployment data from current form
        deploymentData = {
          user_email: email,
          strategy_name: formData.strategyName || selectedStrategy?.name || 'ETF Strategy',
          strategy_type: strategyType || 'ETF Strategy',
          deployment_data: generateJsonData(),
          webhook_url: formData.webhook || '',
          reference_capital: formData.referenceCapital || '',
          ltp: signalData?.ltp?.price || parseFloat(formData.ltp) || 0,
          deployed_at: new Date().toISOString(),
          status: 'active',
          source: 'form'
        }
      }

      console.log('Deploying strategy with data:', deploymentData)

      // Deploy to backend
      const result = await deployToLiveSignal(deploymentData)

      setDeploySuccess(true)
      console.log('Strategy deployed successfully:', result)

      // Fetch live signals after successful deployment
      try {
        console.log('Fetching live signals after deployment...')
        const signalsResult = await fetchLiveSignals() // Will automatically use previous Friday date
        console.log('Live signals fetched:', signalsResult)
      } catch (signalError) {
        console.error('Failed to fetch live signals:', signalError)
        // Don't fail the deployment if signal fetching fails
      }

      // Close modal after successful deployment
      setTimeout(() => {
        setIsModalOpen(false)
        if (onClose) {
          onClose()
        }
      }, 2000)

    } catch (error) {
      console.error('Deployment error:', error)
      setDeployError(error.message || 'Failed to deploy strategy. Please try again.')
    } finally {
      setIsDeploying(false)
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
    // Create clients object from clientIds and capitals arrays with individual quantities
    const clients = {}

    // Use automatically fetched LTP from signalData, fallback to formData.ltp
    const ltpPrice = signalData?.ltp?.price || parseFloat(formData.ltp) || 0
    console.log('Using LTP for quantity calculation:', ltpPrice)

    // Match client IDs with their corresponding capital values
    clientIds.forEach((client, index) => {
      const capital = capitals[index]
      if (capital && client.clientId) {
        // Extract numeric value from capital string (remove ₹ and commas)
        const numericValue = capital.capital.replace(/[₹,]/g, '').trim()
        const parsedValue = parseFloat(numericValue) || 0
        if (parsedValue > 0) {
          // Calculate individual quantity for this client using fetched LTP
          const clientQuantity = ltpPrice > 0 ? Math.floor(parsedValue / ltpPrice) : 0

          console.log(`Client ${client.clientId}: Capital=${parsedValue}, LTP=${ltpPrice}, Quantity=${clientQuantity}`)

          // Only store quantity for each client
          clients[client.clientId] = clientQuantity.toString()
        }
      }
    })

    // Use automatically fetched symbol from signalData, fallback to hardcoded value
    const symbolValue = signalData?.symbol || "NIFTY50"
    console.log('Using symbol for JSON:', symbolValue)

    return {
      "exchange": "NSE",
      "symbol": symbolValue,
      "order_side": "BUY",
      "product_type": "delivery",
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
      console.log('Strategy Type from props:', strategyType)

      // Enhanced validation
      if (!email || email === 'test@test.com' || !email.includes('@')) {
        console.warn('Invalid email address:', email)
        setSaveSuccess(true)
        setTimeout(() => setSaveSuccess(false), 3000)
        return
      }

      if (!jsonData || Object.keys(jsonData).length === 0) {
        console.warn('No JSON data to save')
        setSaveSuccess(true)
        setTimeout(() => setSaveSuccess(false), 3000)
        return
      }

      // Validate JSON data structure
      if (!jsonData.clients || Object.keys(jsonData.clients).length === 0) {
        console.warn('No client data to save')
        setSaveSuccess(true)
        setTimeout(() => setSaveSuccess(false), 3000)
        return
      }

      // Try to save to backend
      try {
        // Clean and validate the request payload
        const requestPayload = {
          user_email: email.trim(),
          json_data: {
            ...jsonData,
            // Ensure all numeric values are properly formatted
            ltp: parseFloat(jsonData.ltp) || 0,
            total_amount: parseFloat(jsonData.total_amount) || 0,
            quantity: parseInt(jsonData.quantity) || 0
          },
          strategy_name: (formData.strategyName || 'Saved Strategy').trim(),
          strategy_type: strategyType || formData.strategyName || 'ETF Strategy',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }

        // Remove any undefined or null values
        const cleanPayload = JSON.parse(JSON.stringify(requestPayload, (key, value) => {
          if (value === undefined || value === null) return ''
          return value
        }))

        console.log('Request payload:', cleanPayload)

        const response = await fetch('http://localhost:8000/api/save-json', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'User-Agent': 'WealthAI-Frontend/1.0'
          },
          body: JSON.stringify(cleanPayload)
        })

        console.log('Response status:', response.status)
        console.log('Response headers:', Object.fromEntries(response.headers.entries()))

        if (response.ok) {
          const responseData = await response.json()
          console.log('Save successful:', responseData)
          setSaveSuccess(true)
          setTimeout(() => setSaveSuccess(false), 3000)
        } else {
          let errorData
          try {
            errorData = await response.json()
          } catch (parseError) {
            errorData = {
              error: `Server error: ${response.status} ${response.statusText}`,
              details: 'Could not parse error response'
            }
          }
          console.error('Save failed:', response.status, errorData)

          // For 500 errors, show a more informative message
          if (response.status === 500) {
            console.error('Server internal error - this might be a backend issue')
          }

          // Cache locally even if backend returns error so user still sees item later
          addToCache({
            user_email: requestPayload.user_email,
            strategy_name: requestPayload.strategy_name,
            strategy_type: requestPayload.strategy_type,
            json_data: requestPayload.json_data,
            created_at: requestPayload.created_at,
            updated_at: requestPayload.updated_at
          })
          setSaveSuccess(true)
          setTimeout(() => setSaveSuccess(false), 3000)
        }
      } catch (fetchError) {
        console.error('Network error:', fetchError)
        console.error('This might indicate the backend server is not running or not accessible')
        // Fallback: cache locally and show success indicator anyway
        addToCache({
          user_email: email.trim(),
          strategy_name: (formData.strategyName || 'Saved Strategy').trim(),
          strategy_type: strategyType || formData.strategyName || 'ETF Strategy',
          json_data: jsonData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        setSaveSuccess(true)
        setTimeout(() => setSaveSuccess(false), 3000)
      }
    } catch (error) {
      console.error('Error saving JSON data:', error)
      // Cache locally as last resort so user does not lose work
      addToCache({
        user_email: email.trim(),
        strategy_name: (formData.strategyName || 'Saved Strategy').trim(),
        strategy_type: strategyType || formData.strategyName || 'ETF Strategy',
        json_data: generateJsonData(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    }
  }

  const fetchSavedJsons = async () => {
    try {
      if (!email || email === 'test@test.com') {
        console.warn('Invalid email address for fetching saved JSONs')
        return
      }

      const response = await fetch(`http://localhost:8000/api/saved-json/${encodeURIComponent(email)}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      })

      console.log('Fetch saved JSONs response status:', response.status)

      if (response.ok) {
        const data = await response.json()
        console.log('Fetched saved JSONs:', data)
        // Normalize to array
        let list = []
        if (data && data.data && Array.isArray(data.data.saved_jsons)) {
          list = data.data.saved_jsons
        } else if (Array.isArray(data)) {
          list = data
        } else if (data && Array.isArray(data.saved_jsons)) {
          list = data.saved_jsons
        }

        const currentEmail = String((email || '').trim()).toLowerCase()
        const desiredType = String(strategyType || formData.strategyName || 'ETF Strategy').toLowerCase()

        // Merge backend list with cached items, then filter and de-duplicate by id
        const cached = loadFromCacheFiltered(currentEmail, desiredType)
        const merged = [...list, ...cached]
        const mapById = new Map()
        merged.forEach(item => {
          const id = item?.id || `${item?.created_at || ''}_${(item?.user_email || '').toLowerCase()}_${(item?.strategy_type || '').toLowerCase()}`
          if (!mapById.has(id)) mapById.set(id, { id, ...item })
        })

        // Filter by email and strategy
        const byEmail = Array.from(mapById.values()).filter(item => String((item?.user_email || item?.email || item?.json_data?.user_email || '')).toLowerCase() === currentEmail)
        const filteredByStrategy = byEmail.filter(item => {
          const topLevel = String(item?.strategy_type || item?.strategyName || item?.strategy || '').toLowerCase()
          const nested = String(item?.json_data?.strategy_type || item?.json_data?.strategyType || '').toLowerCase()
          return topLevel === desiredType || nested === desiredType
        })

        setSavedJsons(filteredByStrategy)
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        console.error('Fetch saved JSONs failed:', response.status, errorData)
        // Fallback to cache
        const currentEmail = String((email || '').trim()).toLowerCase()
        const desiredType = String(strategyType || formData.strategyName || 'ETF Strategy').toLowerCase()
        setSavedJsons(loadFromCacheFiltered(currentEmail, desiredType))
      }
    } catch (error) {
      console.error('Error fetching saved JSONs:', error)
      // Fallback to cache
      const currentEmail = String((email || '').trim()).toLowerCase()
      const desiredType = String(strategyType || formData.strategyName || 'ETF Strategy').toLowerCase()
      setSavedJsons(loadFromCacheFiltered(currentEmail, desiredType))
    }
  }

  const openSavedJson = () => {
    fetchSavedJsons()
    setIsSavedJsonOpen(true)
  }

  const closeSavedJson = () => {
    setIsSavedJsonOpen(false)
  }

  const deleteSavedJson = async (jsonId) => {
    try {
      if (!email || email === 'test@test.com') {
        console.warn('Invalid email address for deleting saved JSON')
        return
      }

      // Try backend delete first
      try {
        const response = await fetch(`http://localhost:8000/api/delete-json/${jsonId}`, {
          method: 'DELETE',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            user_email: email
          })
        })

        console.log('Delete saved JSON response status:', response.status)

        if (response.ok) {
          console.log('Successfully deleted saved JSON from backend')
          // Refresh the saved JSONs list
          fetchSavedJsons()
          // Also remove from cache
          removeFromCache(jsonId)
          return
        } else {
          console.warn('Backend delete failed, using client-side removal')
        }
      } catch (backendError) {
        console.warn('Backend delete endpoint not available, using client-side removal:', backendError)
      }

      // Fallback: Remove from client-side state (immediate UI update)
      setSavedJsons(prevJsons => {
        const updatedJsons = prevJsons.filter(json => json.id !== jsonId)
        console.log(`Removed JSON with ID ${jsonId} from client-side state`)
        return updatedJsons
      })
      // Also update cache
      removeFromCache(jsonId)

    } catch (error) {
      console.error('Error deleting saved JSON:', error)
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Execution Success/Error Popup */}
      {showExecutionPopup && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[100] max-w-md w-full mx-4">
          {executionSuccess ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 shadow-lg">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-green-700 font-medium">Execution successful</span>
              </div>
            </div>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span className="text-red-700 font-medium">{executionError}</span>
              </div>
            </div>
          )}
        </div>
      )}
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
              readOnly
              className="w-full px-2 py-1.5 border border-gray-300 rounded bg-gray-50 text-blue-600 cursor-not-allowed text-xs"
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
              readOnly
              className="w-full px-2 py-1.5 border border-gray-300 rounded bg-gray-50 cursor-not-allowed text-xs"
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
              value={signalData?.ltp?.price.toFixed(2)}
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

      {/* Deployment Status Messages */}
      {isDeploying && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center">
            <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
            <span className="text-sm text-blue-700">Fetching saved strategy data from database...</span>
          </div>
        </div>
      )}

      {deployError && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <svg className="w-4 h-4 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span className="text-sm text-red-700">{deployError}</span>
          </div>
        </div>
      )}

      {deploySuccess && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center">
            <svg className="w-4 h-4 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-sm text-green-700">Strategy deployed successfully! Closing modal...</span>
          </div>
        </div>
      )}

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
                <div className="flex space-x-3">
                  <button
                    onClick={saveJsonData}
                    className={`px-4 py-2 rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 font-medium flex items-center space-x-2 ${saveSuccess
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
                  <button
                    onClick={executeTrade}
                    disabled={isExecuting}
                    className={`px-4 py-2 rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 font-medium flex items-center space-x-2 ${isExecuting
                        ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
                      }`}
                  >
                    {isExecuting ? (
                      <>
                        <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Executing...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <span>Execute</span>
                      </>
                    )}
                  </button>
                </div>
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
                            Saved on {(() => {
                              try {
                                const date = new Date(json.created_at || json.updated_at || new Date())
                                return isNaN(date.getTime()) ? getCurrentDate() : date.toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })
                              } catch (error) {
                                return getCurrentDate()
                              }
                            })()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(JSON.stringify(json.json_data, null, 2))
                            }}
                            className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                          >
                            Copy JSON
                          </button>
                        </div>
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