import React, { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config/api.js';
import { formatDate, formatDateTime } from '../utils/dateFormatter';
import * as XLSX from 'xlsx';
import { RiDeleteBinLine } from "react-icons/ri";

const WebHook = ({
  onClose,
  strategyType = 'ETF Rotation Strategy',
  userEmail = 'test@test.com',
  selectedEtfs = [],
  selectedStrategy = null,
  strategyParams = {},
  onDeploymentSuccess = null,
  setShowResults = null
}) => {
  const [, setIsModalOpen] = useState(false)
  const [isJsonPopupOpen, setIsJsonPopupOpen] = useState(false)
  const [isSavedJsonOpen, setIsSavedJsonOpen] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [savedJsons, setSavedJsons] = useState([])
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
  const [clientPendingDelete, setClientPendingDelete] = useState(null)

  // Deployment state management
  const [isDeploying, setIsDeploying] = useState(false)
  const [deploySuccess, setDeploySuccess] = useState(false)
  const [deployError, setDeployError] = useState('')

  // Execution state management
  const [isExecuting, setIsExecuting] = useState(false)
  const [executionSuccess, setExecutionSuccess] = useState(false)
  const [executionError, setExecutionError] = useState('')
  const [showExecutionPopup, setShowExecutionPopup] = useState(false)

  // Save deployment state management
  const [saveDeploymentLoading, setSaveDeploymentLoading] = useState(false)
  const [saveDeploymentSuccess, setSaveDeploymentSuccess] = useState(false)
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
    webhook: '',
    referenceCapital: '₹1,00,000',
  })

  const [newClientId, setNewClientId] = useState('')
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


  // Get current date for execution
  const getCurrentDate = () => {
    const now = new Date()
    return formatDate(now)
  }

  const [clients, setClients] = useState([])


  const handleStrategySelect = (strategy) => {
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
    
    if (name === 'referenceCapital') {
      // Format reference capital with rupee symbol and commas
      const numericValue = value.replace(/[^0-9]/g, '')
      if (numericValue === '') {
        setFormData(prev => ({
          ...prev,
          [name]: ''
        }))
      } else {
        const formattedValue = '₹' + parseInt(numericValue).toLocaleString('en-IN')
        setFormData(prev => ({
          ...prev,
          [name]: formattedValue
        }))
      }
    } else {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    }
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
        const currentType = String(strategyType || formData.strategyName || 'ETF Rotation Strategy').toLowerCase()
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
      const endpoint = strategyType === 'Stock Rotation Strategy'
        ? `${API_BASE_URL}/api/stocks/deploy`
        : strategyType === 'RS Strategy'
        ? `${API_BASE_URL}/api/rs-strategy/deploy`
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
      const endpoint = strategyType === 'Stock Rotation Strategy'
        ? `${API_BASE_URL}/api/stocks/signals/latest`
        : strategyType === 'RS Strategy'
        ? `${API_BASE_URL}/api/rs-strategy/signals/latest`
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
      if (strategyType === 'Stock Rotation Strategy') {
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
          strategy_name: savedData.strategy_name || formData.strategyName || selectedStrategy?.name || 'ETF Rotation Strategy',
          strategy_type: savedData.strategy_type || strategyType || 'ETF Rotation Strategy',
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

        if (clients.length === 0) {
          throw new Error('Please add at least one client ID')
        }

        // Generate deployment data from current form
        deploymentData = {
          user_email: email,
          strategy_name: formData.strategyName || selectedStrategy?.name || 'ETF Rotation Strategy',
          strategy_type: strategyType || 'ETF Rotation Strategy',
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
    if (onClose) {
      onClose()
    }
  }

  const closeModal = () => {
    setIsModalOpen(false)
    if (onClose) {
      onClose()
    }
  }

  const addClient = () => {
    if (newClientId.trim()) {
      const upperCaseClientId = newClientId.trim().toUpperCase()
      // Check if client ID already exists (case-insensitive)
      const existingClientIds = clients.map(c => c.clientId.toUpperCase())
      if (existingClientIds.includes(upperCaseClientId)) {
        alert(`Client ID "${upperCaseClientId}" already exists`)
        return
      }
      const newId = clients.length > 0 ? Math.max(...clients.map(c => c.id)) + 1 : 1
      setClients([...clients, { 
        id: newId, 
        clientId: upperCaseClientId, 
        multiple: 1  // Default multiple
      }])
      setNewClientId('')
    }
  }

  const openDeleteConfirm = (client) => {
    setClientPendingDelete(client)
    setIsDeleteConfirmOpen(true)
  }

  const closeDeleteConfirm = () => {
    setIsDeleteConfirmOpen(false)
    setClientPendingDelete(null)
  }

  const deleteClient = (clientId) => {
    setClients(prevClients => prevClients.filter(client => client.id !== clientId))
    setClientPendingDelete(null)
    setIsDeleteConfirmOpen(false)
  }

  const handleConfirmDelete = () => {
    if (clientPendingDelete) {
      deleteClient(clientPendingDelete.id)
    }
  }

  // Excel file upload handler
  const fileInputRef = useRef(null);
  const [uploadingExcel, setUploadingExcel] = useState(false);

  const handleExcelUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploadingExcel(true);
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          
          // Get the first sheet
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          
          // Convert to JSON
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          
          if (jsonData.length === 0) {
            alert('Excel file is empty');
            setUploadingExcel(false);
            return;
          }

          // Find the Client ID column index
          const headerRow = jsonData[0];
          let clientIdColumnIndex = -1;
          
          // Try to find "Client ID" column (case insensitive, handles variations)
          for (let i = 0; i < headerRow.length; i++) {
            const header = String(headerRow[i] || '').toLowerCase().trim();
            if (header.includes('client') && header.includes('id')) {
              clientIdColumnIndex = i;
              break;
            }
          }

          // If not found, try first column
          if (clientIdColumnIndex === -1) {
            clientIdColumnIndex = 0;
          }

          // Extract Client IDs from the column (skip header row)
          const clientIds = [];
          for (let i = 1; i < jsonData.length; i++) {
            const row = jsonData[i];
            if (row && row[clientIdColumnIndex]) {
              const clientId = String(row[clientIdColumnIndex]).trim();
              if (clientId && clientId.length > 0) {
                clientIds.push(clientId);
              }
            }
          }

          if (clientIds.length === 0) {
            alert('No Client IDs found in the Excel file');
            setUploadingExcel(false);
            return;
          }

          // Add all Client IDs as clients (normalized to uppercase for comparison)
          const existingClientIds = new Set(clients.map(c => c.clientId.toUpperCase()));
          const newClients = [];
          let currentMaxId = clients.length > 0 ? Math.max(...clients.map(c => c.id)) : 0;

          clientIds.forEach((clientId) => {
            // Convert to uppercase and allow only alphanumeric characters
            const upperCaseClientId = clientId.toUpperCase().replace(/[^A-Z0-9]/g, '');
            // Skip if client already exists or if invalid (empty after filtering)
            if (upperCaseClientId && !existingClientIds.has(upperCaseClientId)) {
              currentMaxId++;
              newClients.push({
                id: currentMaxId,
                clientId: upperCaseClientId,
                multiple: 1  // Default multiple
              });
              existingClientIds.add(upperCaseClientId); // Track added IDs to avoid duplicates in same upload
            }
          });

          if (newClients.length === 0) {
            alert('All Client IDs from the Excel file already exist');
            setUploadingExcel(false);
            return;
          }

          // Add new clients
          setClients([...clients, ...newClients]);
          alert(`Successfully added ${newClients.length} client(s) from Excel file`);
          
        } catch (error) {
          console.error('Error parsing Excel file:', error);
          alert('Error parsing Excel file. Please ensure it is a valid Excel file.');
        } finally {
          setUploadingExcel(false);
          // Reset file input
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        }
      };

      reader.onerror = () => {
        alert('Error reading file');
        setUploadingExcel(false);
      };

      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error('Error uploading Excel file:', error);
      alert('Error uploading Excel file');
      setUploadingExcel(false);
    }
  };

  const triggerExcelUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };


  const updateClientMultiple = (clientId, inputValue) => {
    // Allow empty string for deletion
    if (inputValue === '' || inputValue === null || inputValue === undefined) {
      setClients(clients.map(client => 
        client.id === clientId 
          ? { ...client, multiple: '' }
          : client
      ));
      return;
    }
    
    // Parse the input value
    const numValue = parseInt(inputValue.toString().replace(/[^0-9]/g, ''), 10);
    
    // If valid number, update with constraints
    if (!isNaN(numValue)) {
      const constrainedValue = Math.max(1, Math.min(20, numValue));
      setClients(clients.map(client => 
        client.id === clientId 
          ? { ...client, multiple: constrainedValue }
          : client
      ));
    } else {
      // If invalid, keep the raw input (for typing purposes)
      setClients(clients.map(client => 
        client.id === clientId 
          ? { ...client, multiple: inputValue }
          : client
      ));
    }
  }


  const generateJsonData = () => {
    const clientsData = {}
    const ltpPrice = signalData?.ltp?.price || parseFloat(formData.ltp) || 0
    console.log('Using LTP for quantity calculation:', ltpPrice)

    // Calculate final capital for quantity calculation using individual client multiples
    const rawReferenceCapital = parseFloat(formData.referenceCapital.replace(/[^0-9.]/g, ''));
    
    clients.forEach((client) => {
      if (client.clientId) {
        // Ensure client ID is uppercase
        const upperCaseClientId = client.clientId.toUpperCase().replace(/[^A-Z0-9]/g, '');
        if (upperCaseClientId) {
          // Calculate final capital using individual client multiple
          const multipleValue = client.multiple === '' || client.multiple === null || client.multiple === undefined ? 1 : client.multiple;
          const finalCapitalNumeric = (rawReferenceCapital * multipleValue) / 52;
          
          // Calculate quantity using individual final capital
          const clientQuantity = ltpPrice > 0 ? Math.floor(finalCapitalNumeric / ltpPrice) : 0;
          
          console.log(`Client ${upperCaseClientId}: Multiple=${client.multiple}, Final Capital=${finalCapitalNumeric}, LTP=${ltpPrice}, Quantity=${clientQuantity}`);
          
          clientsData[upperCaseClientId] = clientQuantity.toString();
        }
      }
    });

    // Use automatically fetched symbol from signalData, fallback to hardcoded value
    const symbolValue = signalData?.symbol || "NIFTY50"
    console.log('Using symbol for JSON:', symbolValue)

    return {
      "exchange": "NSE",
      "symbol": symbolValue,
      "order_side": "BUY",
      "product_type": "delivery",
      "clients": clientsData
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
          strategy_type: strategyType || formData.strategyName || 'ETF Rotation Strategy',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }

        // Remove any undefined or null values
        const cleanPayload = JSON.parse(JSON.stringify(requestPayload, (key, value) => {
          if (value === undefined || value === null) return ''
          return value
        }))

        console.log('Request payload:', cleanPayload)

        const response = await fetch('https://api.wealthai1.in/api/save-json', {
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
          strategy_type: strategyType || formData.strategyName || 'ETF Rotation Strategy',
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

      const response = await fetch(`/api/saved-json/${encodeURIComponent(email)}`, {
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
        const desiredType = String(strategyType || formData.strategyName || 'ETF Rotation Strategy').toLowerCase()

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
        const desiredType = String(strategyType || formData.strategyName || 'ETF Rotation Strategy').toLowerCase()
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
        const response = await fetch(`${API_BASE_URL}/api/delete-json/${jsonId}`, {
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

  const handleSaveDeployment = async () => {
    setSaveDeploymentLoading(true);
    setSaveDeploymentSuccess(false);
    setShowResults(false);
    try {
      // ✅ USE ACTUAL STRATEGY NAME FROM SELECTED STRATEGY
      const strategyName = selectedStrategy?.strategy_name || selectedStrategy?.name || strategyType;
      const currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
      const timestamp = Date.now(); // Add timestamp for uniqueness
      const runId = `run_${strategyName.replace(/\s+/g, '_').toLowerCase()}_${currentDate}_${timestamp}`;
      
      console.log('🔍 WebHook selectedStrategy prop:', selectedStrategy); // Added debug
      console.log('🔍 Strategy name being used:', strategyName); // Added debug
      console.log('🔍 Fallback strategyType:', strategyType); // Added debug
      console.log('🔍 Saving deployment with strategy name:', strategyName);
      console.log('🔍 Selected strategy object:', selectedStrategy);
      console.log('🔍 Execution date:', currentDate);
      
      // 1. Parse Reference Capital
      const rawReferenceCapital = parseFloat(formData.referenceCapital.replace(/[^0-9.]/g, ''));
      if (isNaN(rawReferenceCapital)) {
        throw new Error('Invalid Reference Capital');
      }
      
      // 2. Calculate Final Capital using new formula (will be calculated per client)
      // Note: Individual client calculations are done in the clientInformationJson section below
      
      // 3. Create Client Information JSON with individual multiples
      const clientInformationJson = {};
      clients.forEach(client => {
        // Ensure client ID is uppercase
        const upperCaseClientId = client.clientId.toUpperCase().replace(/[^A-Z0-9]/g, '');
        if (upperCaseClientId) {
          const multipleValue = client.multiple === '' || client.multiple === null || client.multiple === undefined ? 1 : client.multiple;
          const clientFinalCapitalNumeric = (rawReferenceCapital * multipleValue) / 52;
          const clientFinalCapitalFormatted = `₹${clientFinalCapitalNumeric.toLocaleString('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          })}`;
          clientInformationJson[upperCaseClientId] = clientFinalCapitalFormatted;
        }
      });
      
      console.log('🔍 Individual client calculations completed');
      console.log('🔍 Client Info JSON:', clientInformationJson);
      console.log('🔍 Clients:', clients);
      
      // Prepare deployment data
      const deploymentData = {
        user_email: email,
        strategy_name: strategyName, // ✅ THIS USES THE ACTUAL STRATEGY NAME
        strategy_type: strategyType,
        run_id: runId,
        webhook_url: formData.webhook || '',
        reference_capital: formData.referenceCapital || '',
        ltp: signalData?.ltp?.price || parseFloat(formData.ltp) || 0,
        execution_date: currentDate, // YYYY-MM-DD format
        // REMOVE client_ids and capitals
        // client_ids: clientIds.map(client => client.clientId),
        // capitals: capitals.map(capital => capital.capital),  
        // ADD new client_information_json
        client_information_json: JSON.stringify(clientInformationJson),
        etf_count: clients.length || 0,
        etf_names: selectedStrategy?.tickers || selectedEtfs || [],
        deployment_data: generateJsonData(),
        created_at: new Date().toISOString()
      };  
      
      console.log('📤 Sending deployment data:', deploymentData);
      
      // Call backend API - Choose endpoint based on strategy type
      const endpoint = strategyType === 'RS Strategy'
        ? `${API_BASE_URL}/api/save-rs-deployment`
        : `${API_BASE_URL}/api/live-signals/save-deployment`;
      
      console.log('Using deployment endpoint:', endpoint);
      console.log('Strategy type:', strategyType);
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(deploymentData)
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        setSaveDeploymentSuccess(true);
        console.log('✅ Deployment saved successfully:', result);
        
        // Call the callback to refresh parent component
        if (onDeploymentSuccess) {
          onDeploymentSuccess();
        }
        
        // Auto-close modal immediately after successful response
        setTimeout(() => {
          if (onClose) {
            onClose();
          }
        }, 300); // Small delay to ensure state updates are visible
      } else if (response.ok && !result.success && result.message?.includes('already exists')) {
        // Handle case where deployment already exists
        setSaveDeploymentSuccess(true);
        console.log('⚠️ Deployment already exists:', result.message);
        
        // Auto-close modal even if deployment already exists
        setTimeout(() => {
          if (onClose) {
            onClose();
          }
        }, 100); // Small delay to ensure state updates are visible
      } else {
        throw new Error(result.detail || result.message || 'Failed to save deployment');
      }
      
    } catch (error) {
      console.error('❌ Error saving deployment:', error);
      // You can add error state handling here
    } finally {
      setSaveDeploymentLoading(false);
    }
  };

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
          {selectedStrategy?.strategy_name || selectedStrategy?.name || 
           (strategyType === 'Stock Rotation Strategy' ? 'Stock Rotation Strategy' : 
            strategyType === 'ETF Rotation Strategy' || strategyType === 'ETF Strategy' ? 'ETF Rotation Strategy' :
            strategyType)}
        </h1>
        <div className="flex items-center space-x-3">
          <div className="text-xs text-gray-600">
            <div className="font-medium">Email: {email}</div>
            <div className="text-xs text-gray-500">Deployment Date: {getCurrentDate()}</div>
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
              className="w-full px-2 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-all text-xs text-gray-400 bg-white"
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
              onChange={handleInputChange}
              className="w-full px-2 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-all text-xs"
              placeholder="Enter amount (e.g., ₹1,00,000)"
            />
          </div>

        </div>

        {/* Right Side - Full Width Client Table */}
        <div className="w-full">
          {/* Client ID Table */}
          <div className="w-full">
            <h3 className="text-xs font-semibold text-gray-800 mb-1">Client ID</h3>
            <div className="mb-2 flex gap-1">
              <input
                type="text"
                value={newClientId}
                onChange={(e) => {
                  // Convert to uppercase and allow only alphanumeric characters
                  const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
                  setNewClientId(value);
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    addClient();
                  }
                }}
                placeholder="Enter Client ID"
                className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 uppercase"
              />
              <button
                onClick={addClient}
                className="px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition-colors"
                title="Add Client"
              >
                +
              </button>
              <div className="relative group">
                <button
                  onClick={triggerExcelUpload}
                  disabled={uploadingExcel}
                  className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  {uploadingExcel ? (
                    <span className="inline-block animate-spin rounded-full h-3 w-3 border-b-2 border-white"></span>
                  ) : (
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  )}
                </button>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                  Upload Excel File
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleExcelUpload}
                style={{ display: 'none' }}
              />
            </div>
            <div className="bg-white border border-gray-200 rounded shadow-sm w-full overflow-auto h-[180px]">
              <table className="w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-2 py-1 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider w-16">
                      S.NO.
                    </th>
                    <th className="px-2 py-1 text-left  text-[10px] font-medium text-gray-500 uppercase tracking-wider w-32">
                      Client ID
                    </th>
                    <th className="px-2 py-1 text-left  text-[10px] font-medium text-gray-500 uppercase tracking-wider w-24">
                      Multiple
                    </th>
                    <th className="px-2 py-1 text-left  text-[10px] font-medium text-gray-500 uppercase tracking-wider w-40">
                      Final Capital
                    </th>
                    <th className="px-2 py-1 text-left  text-[10px] font-medium text-gray-500 uppercase tracking-wider w-16">
                      DELETE
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {clients.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-2 py-4 text-center text-xs text-gray-500">
                        No clients added yet. Add a client ID above.
                      </td>
                    </tr>
                  ) : (
                    clients.map((client) => {
                      // Calculate final capital for this client using individual multiple
                      const rawReferenceCapital = parseFloat(formData.referenceCapital.replace(/[^0-9.]/g, ''));
                      const multipleValue = client.multiple === '' || client.multiple === null || client.multiple === undefined ? 1 : client.multiple;
                      const finalCapitalNumeric = (rawReferenceCapital * multipleValue) / 52;
                      const finalCapitalFormatted = `₹${finalCapitalNumeric.toLocaleString('en-IN', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}`;
                      
                      return (
                    <tr key={client.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-2 py-1 whitespace-nowrap text-xs text-gray-900">
                        {client.id}
                      </td>
                      <td className="px-2 py-1 whitespace-nowrap text-xs text-gray-900 uppercase">
                        {client.clientId.toUpperCase()}
                      </td>
                      <td className="px-2 py-1 whitespace-nowrap text-xs text-gray-900">
              <input
                              type="number"
                              min="1"
                              max="20"
                              value={client.multiple}
                              onChange={(e) => updateClientMultiple(client.id, e.target.value)}
                              onBlur={(e) => {
                                // Ensure minimum value of 1 when field loses focus
                                const value = parseInt(e.target.value) || 1;
                                updateClientMultiple(client.id, value);
                              }}
                              className="w-full px-1 py-0.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                      </td>
                          <td className="px-2 py-1 whitespace-nowrap text-xs font-semibold text-green-700">
                            {finalCapitalFormatted}
                      </td>
                      <td className="px-2 py-1 whitespace-nowrap text-xs text-gray-900">
                        <button
                          type="button"
                          onClick={() => openDeleteConfirm(client)}
                          className="flex items-center justify-center text-red-600 hover:text-red-800 hover:scale-110 transition-all duration-200 p-1"
                        >
                          <RiDeleteBinLine className="text-lg" />
                        </button>
                      </td>
                    </tr>
                      );
                    })
                  )}
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

      {/* Action Buttons */}
      <div className="flex justify-center items-center">
        {/* <div className="flex space-x-2">
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
        </div> */}
        <div className="flex space-x-2">
          <button
            onClick={handleCancel}
            className="px-4 py-1.5 border border-gray-500 rounded text-black bg-white hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-gray-500 transition-all duration-200 font-medium text-xs"
          >
            Close
          </button>
          <button
            onClick={handleSaveDeployment}
            disabled={saveDeploymentLoading || saveDeploymentSuccess}
            className={`px-4 py-1.5 rounded font-medium text-xs shadow-lg hover:shadow-xl transition-all duration-200 ${
              saveDeploymentLoading
                ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white opacity-50 cursor-not-allowed'
                : saveDeploymentSuccess
                ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white cursor-not-allowed'
                : 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white hover:from-teal-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500'
            }`}
          >
            {saveDeploymentLoading ? (
              <>
                <div className="inline-block animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                Saving...
              </>
            ) : saveDeploymentSuccess ? (
              <>
                <svg className="w-3 h-3 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Saved!
              </>
            ) : (
              'Save Deployment'
            )}
          </button>
        </div>
      </div>

      {isDeleteConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeDeleteConfirm}
          ></div>
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Delete Client</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Are you sure you want to remove client{' '}
                  <span className="font-semibold">
                    {clientPendingDelete?.clientId?.toUpperCase()}
                  </span>
                  ?
                </p>
              </div>
              <button
                type="button"
                onClick={closeDeleteConfirm}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={closeDeleteConfirm}
                className="px-4 py-1.5 border border-gray-300 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-1.5 bg-red-600 text-white rounded text-sm font-medium hover:bg-red-700 transition-colors"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

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
                                return isNaN(date.getTime()) ? getCurrentDate() : formatDate(date)
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